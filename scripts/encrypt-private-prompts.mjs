import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PBKDF2_ITERATIONS = 250000;
const DEFAULT_INPUT = 'private-prompts.source.json';
const DEFAULT_OUTPUT = 'private-prompts.enc.json';
const DEFAULT_PASSPHRASE_FILE = 'private-passcode.txt';

const args = parseArgs(process.argv.slice(2));
const inputPath = path.resolve(process.cwd(), args.input || DEFAULT_INPUT);
const outputPath = path.resolve(process.cwd(), args.output || DEFAULT_OUTPUT);
const passcodeFilePath = path.resolve(process.cwd(), DEFAULT_PASSPHRASE_FILE);
const passcode = args.passcode || process.env.PRIVATE_PROMPTS_PASSPHRASE || readPasscodeFile(passcodeFilePath);

if (!passcode) {
    console.error('Missing passcode. Use --passcode, set PRIVATE_PROMPTS_PASSPHRASE, or create private-passcode.txt.');
    process.exit(1);
}

if (!fs.existsSync(inputPath)) {
    console.error(`Missing source file: ${inputPath}`);
    console.error('Create private-prompts.source.json locally, or copy private-prompts.source.example.json.');
    process.exit(1);
}

const sourceText = fs.readFileSync(inputPath, 'utf8');
let parsed;

try {
    parsed = JSON.parse(sourceText);
} catch (error) {
    console.error(`Invalid JSON in ${inputPath}:`, error.message);
    process.exit(1);
}

if (!Array.isArray(parsed)) {
    console.error('Private prompts source must be a flat JSON array.');
    process.exit(1);
}

const payload = encryptPayload(JSON.stringify(parsed, null, 2), passcode);
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

console.log(`Encrypted ${parsed.length} private prompt${parsed.length === 1 ? '' : 's'} to ${outputPath}`);

function encryptPayload(plaintext, secret) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = crypto.pbkdf2Sync(secret, salt, PBKDF2_ITERATIONS, 32, 'sha256');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const ciphertext = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    return {
        version: 1,
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        ciphertext: Buffer.concat([ciphertext, authTag]).toString('base64')
    };
}

function parseArgs(argv) {
    const parsedArgs = {};

    for (let index = 0; index < argv.length; index += 1) {
        const current = argv[index];
        const next = argv[index + 1];

        if (current === '--input' && next) {
            parsedArgs.input = next;
            index += 1;
        } else if (current === '--output' && next) {
            parsedArgs.output = next;
            index += 1;
        } else if (current === '--passcode' && next) {
            parsedArgs.passcode = next;
            index += 1;
        }
    }

    return parsedArgs;
}

function readPasscodeFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    const passcode = fs.readFileSync(filePath, 'utf8').trim();
    return passcode || null;
}
