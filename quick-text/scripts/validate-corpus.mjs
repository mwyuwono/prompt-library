import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const corpusPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'corpus', 'quick-text.json');
const palettePath = process.argv[3] ? path.resolve(process.argv[3]) : path.join(root, 'corpus', 'palette.json');

const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const palette = JSON.parse(fs.readFileSync(palettePath, 'utf8'));
const errors = [];

const categoryIds = new Set();
for (const category of corpus.categories || []) {
  if (!category.id) errors.push('Category missing id.');
  if (categoryIds.has(category.id)) errors.push(`Duplicate category id: ${category.id}`);
  categoryIds.add(category.id);
}

const colorIds = new Set((palette.colors || []).map((color) => color.id));
const phraseIds = new Set();
const visibilities = new Set(['private', 'public', 'local-only']);
for (const [settingKey, colorId] of Object.entries({
  defaultTileColor: corpus.settings?.defaultTileColor,
  defaultTextColor: corpus.settings?.defaultTextColor
})) {
  if (colorId && !colorIds.has(colorId)) errors.push(`settings.${settingKey} references missing color: ${colorId}`);
}

for (const phrase of corpus.phrases || []) {
  if (!phrase.id) errors.push('Phrase missing id.');
  if (phrase.id && phraseIds.has(phrase.id)) errors.push(`Duplicate phrase id: ${phrase.id}`);
  phraseIds.add(phrase.id);

  if (!phrase.categoryId) errors.push(`${phrase.id || 'Phrase'} missing categoryId.`);
  if (phrase.categoryId && !categoryIds.has(phrase.categoryId)) {
    errors.push(`${phrase.id} references missing categoryId: ${phrase.categoryId}`);
  }
  if (!phrase.title || !phrase.title.trim()) errors.push(`${phrase.id} missing title.`);
  if (!phrase.value || !phrase.value.trim()) errors.push(`${phrase.id} has empty value.`);
  if (!phrase.visibility || !visibilities.has(phrase.visibility)) {
    errors.push(`${phrase.id} has invalid visibility: ${phrase.visibility}`);
  }
  if (phrase.color && !colorIds.has(phrase.color)) errors.push(`${phrase.id} references missing color: ${phrase.color}`);
  if (phrase.textColor && !colorIds.has(phrase.textColor)) errors.push(`${phrase.id} references missing textColor: ${phrase.textColor}`);

  if (phrase.atoms !== undefined) {
    if (!Array.isArray(phrase.atoms)) {
      errors.push(`${phrase.id} has atoms that is not an array.`);
    } else {
      const atomIds = new Set();
      const valueLength = (phrase.value || '').length;
      const sorted = [...phrase.atoms].sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
      for (const atom of phrase.atoms) {
        if (!atom.id) errors.push(`${phrase.id} has an atom missing id.`);
        if (atom.id && atomIds.has(atom.id)) errors.push(`${phrase.id} has duplicate atom id: ${atom.id}`);
        if (atom.id) atomIds.add(atom.id);
        const validRange = typeof atom.start === 'number' && typeof atom.end === 'number' && atom.start >= 0 && atom.end > atom.start;
        if (!validRange) {
          errors.push(`${phrase.id} atom ${atom.id || '(no id)'} has invalid start/end.`);
        } else if (atom.end > valueLength) {
          errors.push(`${phrase.id} atom ${atom.id} end (${atom.end}) exceeds value length (${valueLength}).`);
        }
      }
      for (let i = 1; i < sorted.length; i++) {
        if (typeof sorted[i].start === 'number' && typeof sorted[i - 1].end === 'number' && sorted[i].start < sorted[i - 1].end) {
          errors.push(`${phrase.id} has overlapping atoms.`);
        }
      }
    }
  }
}

// Reusable variable library (see quick-text/README.md "Variable placeholders" ->
// reusable variable library): { id, name, type: "text" | "choice" | "value", options?, value? }.
// "value" entries carry a fixed, canned `value` string substituted at copy time (the
// card shows just `name` collapsed, or the full `value` in preview/Expanded display) —
// distinct from "text"/"choice", which are filled in interactively at copy time.
// Validated independently of the atom checks above so a schema issue in one
// doesn't mask errors in the other.
const libraryVariableIds = new Set();
const libraryVariableNames = new Set();
for (const variable of corpus.variables || []) {
  if (!variable.id) errors.push('Library variable missing id.');
  if (variable.id && libraryVariableIds.has(variable.id)) errors.push(`Duplicate library variable id: ${variable.id}`);
  if (variable.id) libraryVariableIds.add(variable.id);

  const label = variable.id || variable.name || '(unknown)';
  if (!variable.name || !variable.name.trim()) errors.push(`Library variable ${label} missing name.`);
  const normalizedName = (variable.name || '').trim().toLowerCase();
  if (normalizedName) {
    if (libraryVariableNames.has(normalizedName)) errors.push(`Duplicate library variable name (case-insensitive): ${variable.name}`);
    libraryVariableNames.add(normalizedName);
  }

  if (variable.type !== 'text' && variable.type !== 'choice' && variable.type !== 'value') {
    errors.push(`Library variable ${label} has invalid type: ${variable.type}`);
  } else if (variable.type === 'choice') {
    if (!Array.isArray(variable.options) || variable.options.length === 0) {
      errors.push(`Library variable ${label} is type "choice" but has no options.`);
    }
  } else if (variable.type === 'value') {
    if (!variable.value || !variable.value.trim()) {
      errors.push(`Library variable ${label} is type "value" but has no value.`);
    }
  }
}

// Text Replacement sync (see docs/text-replacement-sync-plan.md): shortcut uniqueness,
// non-empty when enabled, and no unresolved placeholders when enabled. Mirrors
// `TextReplacementSupport` in the Mac app so both surfaces enforce the same rules.
const shortcutConventionPattern = /^x[a-z]{2,11}$/;
const placeholderPattern = /\{\{([^{}]+)\}\}/g;
const libraryVariablesByName = new Map(
  (corpus.variables || []).map((variable) => [(variable.name || '').trim().toLowerCase(), variable])
);

function hasUnresolvedPlaceholders(value) {
  for (const match of (value || '').matchAll(placeholderPattern)) {
    const inner = match[1].trim();
    if (!inner) continue;
    if (inner.startsWith('@')) {
      const name = inner.slice(1).trim().toLowerCase();
      const variable = libraryVariablesByName.get(name);
      if (!variable || variable.type !== 'value') return true;
    } else {
      return true;
    }
  }
  return false;
}

const seenShortcuts = new Map();
for (const phrase of corpus.phrases || []) {
  const link = phrase.textReplacement;
  if (!link) continue;
  const label = phrase.id || phrase.title || '(unknown)';
  const shortcut = (link.shortcut || '').trim();

  if (link.syncEnabled && !shortcut) {
    errors.push(`${label} has syncEnabled text replacement but no shortcut.`);
    continue;
  }
  if (!shortcut) continue;

  if (/\s/.test(shortcut)) errors.push(`${label} text replacement shortcut "${shortcut}" contains whitespace.`);
  if (shortcut.length < 3) console.warn(`Warning: ${label} text replacement shortcut "${shortcut}" is under 3 characters (accidental-expansion risk).`);
  if (!shortcutConventionPattern.test(shortcut)) {
    console.warn(`Warning: ${label} text replacement shortcut "${shortcut}" doesn't match the \`x\` + word convention.`);
  }

  const key = shortcut.toLowerCase();
  if (seenShortcuts.has(key)) {
    errors.push(`Duplicate text replacement shortcut "${shortcut}": ${seenShortcuts.get(key)} and ${label}.`);
  } else {
    seenShortcuts.set(key, label);
  }

  if (link.syncEnabled && hasUnresolvedPlaceholders(phrase.value)) {
    errors.push(`${label} has syncEnabled text replacement but unresolved placeholders in value.`);
  }
}

if (errors.length) {
  console.error(`Quick Text corpus invalid (${errors.length} error${errors.length === 1 ? '' : 's'}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Quick Text corpus valid: ${(corpus.phrases || []).length} phrases, ${(corpus.categories || []).length} categories, ${(corpus.variables || []).length} library variables.`);
