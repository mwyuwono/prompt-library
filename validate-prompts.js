// Run this after pasting LLM output into prompts.json
// Usage: node validate-prompts.js

const fs = require('fs');

// --- Load files ---
let original, updated;
try {
  original = JSON.parse(fs.readFileSync('prompts.json.bak', 'utf8'));
} catch {
  console.error('ERROR: prompts.json.bak not found. Did you make a backup first?');
  process.exit(1);
}
try {
  updated = JSON.parse(fs.readFileSync('prompts.json', 'utf8'));
} catch (e) {
  console.error('ERROR: prompts.json is not valid JSON.');
  console.error(e.message);
  process.exit(1);
}

let passed = true;

// --- Check 1: still an array ---
if (!Array.isArray(updated)) {
  console.error('FAIL: prompts.json is not an array.');
  process.exit(1);
}

// --- Check 2: same number of prompts ---
if (updated.length !== original.length) {
  console.error(`FAIL: Expected ${original.length} prompts, got ${updated.length}.`);
  passed = false;
}

// --- Check 3: IDs are intact ---
const origIds = original.map(p => p.id).sort().join(',');
const newIds  = updated.map(p => p.id).sort().join(',');
if (origIds !== newIds) {
  console.error('FAIL: Prompt IDs changed. Missing or renamed IDs detected.');
  passed = false;
}

// --- Check 4: {{variable}} placeholders intact ---
function extractVars(text) {
  return (text || '').match(/\{\{[^}]+\}\}/g) || [];
}
function allTemplates(prompt) {
  const texts = [prompt.template, prompt.description, prompt.instructions];
  if (prompt.variations) {
    prompt.variations.forEach(v => {
      texts.push(v.template, v.description, v.instructions);
    });
  }
  return texts.filter(Boolean);
}

original.forEach((orig, i) => {
  const match = updated.find(p => p.id === orig.id);
  if (!match) return; // already caught above

  const origVars = allTemplates(orig).flatMap(extractVars);
  const newVars  = allTemplates(match).flatMap(extractVars);

  const missing = origVars.filter(v => !newVars.includes(v));
  const extra   = newVars.filter(v => !origVars.includes(v));

  if (missing.length) {
    console.error(`FAIL [${orig.id}]: Missing variables: ${missing.join(', ')}`);
    passed = false;
  }
  if (extra.length) {
    console.warn(`WARN [${orig.id}]: Unexpected new variables: ${extra.join(', ')}`);
  }
});

// --- Check 5: variables array untouched ---
original.forEach(orig => {
  const match = updated.find(p => p.id === orig.id);
  if (!match) return;
  const origVarStr = JSON.stringify(orig.variables || []);
  const newVarStr  = JSON.stringify(match.variables || []);
  if (origVarStr !== newVarStr) {
    console.error(`FAIL [${orig.id}]: variables[] array was changed.`);
    passed = false;
  }
});

// --- Result ---
if (passed) {
  console.log(`✓ All checks passed. ${updated.length} prompts validated.`);
  console.log('  You are safe to commit.');
} else {
  console.log('\nValidation failed. Do NOT commit. Restore your backup:');
  console.log('  cp prompts.json.bak prompts.json');
}
