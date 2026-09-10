#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'buffer' }).toString().split('\0').filter(Boolean);
const ignored = ['rb-fabric-collection/', 'quick-text/', 'docs/', 'arched-double-door-render/', 'design_handoff_fullscreen_modal/', 'prompts-for-implementation/', 'redesign-reference/'];
const entries = files
  .filter((file) => !ignored.some((prefix) => file.startsWith(prefix)))
  .map((file) => ({ file, bytes: fs.statSync(file).size }))
  .sort((a, b) => b.bytes - a.bytes);
const totalBytes = entries.reduce((total, entry) => total + entry.bytes, 0);
console.log(JSON.stringify({ totalBytes, totalMiB: Number((totalBytes / 1024 / 1024).toFixed(2)), largest: entries.slice(0, 20) }, null, 2));
