#!/usr/bin/env node
import fs from 'node:fs';

const teamId = process.env.VERCEL_TEAM_ID ?? 'team_HSxbM1n9TThluD1tkS8MrfHF';
const token = process.env.VERCEL_TOKEN;
const apply = process.argv.includes('--apply');
const now = Date.now();

if (!token) throw new Error('VERCEL_TOKEN is required. Dry-run is the default; pass --apply to delete candidates.');

const request = async (path, init = {}) => {
  const response = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status} ${path}: ${body.error?.message ?? JSON.stringify(body)}`);
  return body;
};

const projects = (await request(`/v9/projects?teamId=${teamId}&limit=100`)).projects;
const aliases = new Set();
for (const project of projects) {
  const page = await request(`/v4/aliases?teamId=${teamId}&projectId=${project.id}&limit=100`);
  for (const alias of page.aliases ?? []) aliases.add(alias.deploymentId);
}

const deployments = [];
let until;
do {
  const page = await request(`/v6/deployments?teamId=${teamId}&limit=100${until ? `&until=${until}` : ''}`);
  deployments.push(...page.deployments);
  until = page.pagination?.next;
} while (until);

const productionKeep = new Set();
for (const project of projects) {
  deployments
    .filter((deployment) => deployment.projectId === project.id && deployment.target === 'production' && deployment.readyState === 'READY')
    .sort((a, b) => b.created - a.created)
    .slice(0, 2)
    .forEach((deployment) => productionKeep.add(deployment.uid));
}

const candidates = [];
const skipped = [];
for (const deployment of deployments) {
  const ageDays = (now - deployment.created) / 86_400_000;
  const isProduction = deployment.target === 'production';
  const isFailed = ['ERROR', 'CANCELED'].includes(deployment.readyState);
  const isPreview = !isProduction && deployment.readyState === 'READY';
  const protectedReason = aliases.has(deployment.uid) ? 'active alias' : productionKeep.has(deployment.uid) ? 'newest two successful production deployments' : null;
  if (protectedReason) { skipped.push({ id: deployment.uid, project: deployment.name, reason: protectedReason }); continue; }
  if (isProduction && deployment.readyState === 'READY') candidates.push({ id: deployment.uid, project: deployment.name, reason: 'older unaliased production' });
  else if (isPreview && ageDays > 14) candidates.push({ id: deployment.uid, project: deployment.name, reason: 'unaliased preview older than 14 days' });
  else if (isFailed && ageDays > 7) candidates.push({ id: deployment.uid, project: deployment.name, reason: 'unaliased failed/canceled deployment older than 7 days' });
  else skipped.push({ id: deployment.uid, project: deployment.name, reason: 'ambiguous or within retention window' });
}

const report = { generatedAt: new Date().toISOString(), teamId, mode: apply ? 'apply' : 'dry-run', candidates, skipped, deleted: [], failures: [] };
if (apply) {
  for (const candidate of candidates) {
    try {
      await request(`/v13/deployments/${candidate.id}?teamId=${teamId}`, { method: 'DELETE' });
      report.deleted.push(candidate);
    } catch (error) { report.failures.push({ ...candidate, error: error.message }); }
  }
}
console.log(JSON.stringify(report, null, 2));
if (apply && report.failures.length) process.exitCode = 1;
