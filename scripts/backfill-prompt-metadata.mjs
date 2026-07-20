#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const PBKDF2_ITERATIONS = 250000;

function comparablePrompt(prompt) {
    if (!prompt) return null;
    const copy = structuredClone(prompt);
    delete copy.modifiedAt;
    delete copy.customOrder;
    return JSON.stringify(copy);
}

export function findModifiedAtFromVersions(prompt, versions, fallbackDate) {
    const current = comparablePrompt(prompt);
    if (!versions.length) return fallbackDate;

    const newestPrompt = versions[0].prompts.find(item => item.id === prompt.id);
    if (comparablePrompt(newestPrompt) !== current) return fallbackDate;

    for (let index = 0; index < versions.length - 1; index += 1) {
        const newer = versions[index].prompts.find(item => item.id === prompt.id);
        const older = versions[index + 1].prompts.find(item => item.id === prompt.id);
        if (comparablePrompt(newer) !== comparablePrompt(older)) {
            return versions[index].date;
        }
    }

    const oldest = versions.at(-1);
    return oldest.prompts.some(item => item.id === prompt.id) ? oldest.date : fallbackDate;
}

export function assignPromptMetadata(prompts, versions, fallbackDate) {
    const nextOrders = new Map();
    return prompts.map(prompt => {
        const customOrder = nextOrders.get(prompt.category) || 0;
        nextOrders.set(prompt.category, customOrder + 1);
        return {
            ...prompt,
            modifiedAt: findModifiedAtFromVersions(prompt, versions, fallbackDate),
            customOrder
        };
    });
}

function gitVersions(filename, transform = value => JSON.parse(value)) {
    const log = execFileSync('git', ['log', '--format=%H|%aI', '--', filename], {
        cwd: ROOT,
        encoding: 'utf8'
    }).trim();
    if (!log) return [];

    return log.split('\n').flatMap(line => {
        const [commit, date] = line.split('|');
        try {
            const content = execFileSync('git', ['show', `${commit}:${filename}`], {
                cwd: ROOT,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore']
            });
            return [{ date, prompts: transform(content) }];
        } catch {
            return [];
        }
    });
}

function getPrivatePassphrase() {
    if (process.env.PRIVATE_PROMPTS_PASSPHRASE) return process.env.PRIVATE_PROMPTS_PASSPHRASE;
    const passphrasePath = path.join(ROOT, 'private-passcode.txt');
    return fs.existsSync(passphrasePath) ? fs.readFileSync(passphrasePath, 'utf8').trim() : '';
}

function decryptPrivatePayload(value, passphrase) {
    const payload = JSON.parse(value);
    const salt = Buffer.from(payload.salt, 'base64');
    const iv = Buffer.from(payload.iv, 'base64');
    const combined = Buffer.from(payload.ciphertext, 'base64');
    const ciphertext = combined.subarray(0, -16);
    const authTag = combined.subarray(-16);
    const key = crypto.pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, 32, 'sha256');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
}

function encryptPrivatePrompts(prompts, passphrase) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = crypto.pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, 32, 'sha256');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([
        cipher.update(JSON.stringify(prompts, null, 2), 'utf8'),
        cipher.final()
    ]);
    return {
        version: 1,
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        ciphertext: Buffer.concat([ciphertext, cipher.getAuthTag()]).toString('base64')
    };
}

function writeJson(filename, value) {
    const target = path.join(ROOT, filename);
    const temp = `${target}.tmp`;
    fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    fs.renameSync(temp, target);
}

function backfillFile(filename, versions) {
    const target = path.join(ROOT, filename);
    const prompts = JSON.parse(fs.readFileSync(target, 'utf8'));
    const fallbackDate = fs.statSync(target).mtime.toISOString();
    const updated = assignPromptMetadata(prompts, versions, fallbackDate);
    writeJson(filename, updated);
    return updated;
}

export function runBackfill() {
    const publicVersions = gitVersions('prompts.json');
    const publicPrompts = backfillFile('prompts.json', publicVersions);

    const passphrase = getPrivatePassphrase();
    const privateVersions = passphrase
        ? gitVersions('private-prompts.enc.json', value => decryptPrivatePayload(value, passphrase))
        : [];
    const privatePrompts = backfillFile('private-prompts.source.json', privateVersions);

    if (passphrase) {
        writeJson('private-prompts.enc.json', encryptPrivatePrompts(privatePrompts, passphrase));
    }

    console.log(`Backfilled ${publicPrompts.length} public and ${privatePrompts.length} private prompts.`);
    if (!passphrase) console.warn('Private encrypted payload was not refreshed because no passphrase is configured.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    runBackfill();
}
