#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const PROMPTS_PATH = process.argv[2] || 'prompts.json';
const ALLOWED_INPUT_TYPES = new Set(['text', 'textarea', 'toggle']);
const ALLOWED_MODEL_VENDORS = new Set(['anthropic', 'openai', 'google', 'gemma']);

let promptData;
let hasErrors = false;
let warningCount = 0;

function fail(message) {
  hasErrors = true;
  console.error(`ERROR: ${message}`);
}

function warn(message) {
  warningCount += 1;
  console.warn(`WARN: ${message}`);
}

function readPrompts(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${filePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function extractPlaceholders(text = '') {
  if (typeof text !== 'string') return [];

  const placeholders = [];
  const pattern = /\{\{\s*([^}]+?)\s*\}\}/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    placeholders.push(match[1].trim());
  }

  return placeholders;
}

function collectTextFields(item) {
  return ['template', 'instructions', 'description']
    .filter((key) => typeof item?.[key] === 'string')
    .map((key) => ({ key, text: item[key] }));
}

function collectVariableNames(ownerLabel, item) {
  const names = [];

  asArray(item?.variables).forEach((variable, index) => {
    if (!variable || typeof variable !== 'object') {
      fail(`${ownerLabel} variables[${index}] must be an object.`);
      return;
    }

    if (typeof variable.name !== 'string' || !variable.name.trim()) {
      fail(`${ownerLabel} variables[${index}] is missing a non-empty name.`);
      return;
    }

    names.push(variable.name);

    if (variable.inputType && !ALLOWED_INPUT_TYPES.has(variable.inputType)) {
      fail(`${ownerLabel} variable "${variable.name}" uses unsupported inputType "${variable.inputType}".`);
    }

    if (variable.inputType === 'toggle') {
      if (!Array.isArray(variable.options) || variable.options.length !== 2) {
        fail(`${ownerLabel} toggle variable "${variable.name}" must define exactly two options.`);
      }
    }

    if (variable.rows !== undefined && (!Number.isInteger(variable.rows) || variable.rows < 1)) {
      fail(`${ownerLabel} variable "${variable.name}" rows must be a positive integer.`);
    }
  });

  asArray(item?.referenceImages).forEach((reference, index) => {
    if (!reference || typeof reference !== 'object') {
      fail(`${ownerLabel} referenceImages[${index}] must be an object.`);
      return;
    }

    if (reference.variable) names.push(reference.variable);
  });

  return names;
}

function reportDuplicateValues(ownerLabel, values) {
  const counts = new Map();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));

  [...counts.entries()]
    .filter(([, count]) => count > 1)
    .forEach(([value, count]) => fail(`${ownerLabel} contains duplicate value "${value}" (${count} times).`));
}

function validatePlaceholders(ownerLabel, item, availableVariables) {
  const defined = new Set(availableVariables);
  const used = new Set();

  collectTextFields(item).forEach(({ key, text }) => {
    extractPlaceholders(text).forEach((placeholder) => {
      used.add(placeholder);
      if (!defined.has(placeholder)) {
        warn(`${ownerLabel} ${key} uses undefined placeholder "{{${placeholder}}}". If this is not a literal example, add a matching variable.`);
      }
    });
  });

  return used;
}

function normalizeDescriptionText(text = '') {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function getRepeatedPhrase(parentDescription = '', variationDescription = '') {
  const parentWords = normalizeDescriptionText(parentDescription);
  const variationWords = normalizeDescriptionText(variationDescription);
  const phraseLength = 5;

  if (parentWords.length < phraseLength || variationWords.length < phraseLength) {
    return '';
  }

  const parentPhrases = new Set();
  for (let index = 0; index <= parentWords.length - phraseLength; index += 1) {
    parentPhrases.add(parentWords.slice(index, index + phraseLength).join(' '));
  }

  for (let index = 0; index <= variationWords.length - phraseLength; index += 1) {
    const phrase = variationWords.slice(index, index + phraseLength).join(' ');
    if (parentPhrases.has(phrase)) return phrase;
  }

  return '';
}

function validateVariationDescription(prompt, variation, ownerLabel) {
  if (!prompt.description || !variation.description) return;

  const repeatedPhrase = getRepeatedPhrase(prompt.description, variation.description);
  if (repeatedPhrase) {
    fail(`${ownerLabel} description repeats parent framing: "${repeatedPhrase}".`);
  }
}

function validateImagePath(ownerLabel, imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return;
  if (/^https?:\/\//.test(imagePath)) return;

  if (!fs.existsSync(imagePath)) {
    fail(`${ownerLabel} references missing image path "${imagePath}".`);
  }
}

function validateItemImages(ownerLabel, item) {
  validateImagePath(`${ownerLabel} image`, item?.image);
  validateImagePath(`${ownerLabel} previewBaseImage`, item?.previewBaseImage);

  asArray(item?.referenceImages).forEach((reference, index) => {
    validateImagePath(`${ownerLabel} referenceImages[${index}]`, reference?.path);
  });
}

function validateRecommendedModels(ownerLabel, recommendedModels) {
  if (recommendedModels === undefined) return;

  if (!Array.isArray(recommendedModels)) {
    fail(`${ownerLabel} recommendedModels must be an array when present.`);
    return;
  }

  if (recommendedModels.length > 4) {
    fail(`${ownerLabel} recommendedModels must not exceed 4 entries (one per vendor).`);
  }

  const seenVendors = new Set();

  recommendedModels.forEach((entry, index) => {
    const entryLabel = `${ownerLabel} recommendedModels[${index}]`;

    if (!entry || typeof entry !== 'object') {
      fail(`${entryLabel} must be an object.`);
      return;
    }

    if (typeof entry.vendor !== 'string' || !ALLOWED_MODEL_VENDORS.has(entry.vendor)) {
      fail(`${entryLabel} vendor must be one of: ${[...ALLOWED_MODEL_VENDORS].join(', ')}.`);
    } else if (seenVendors.has(entry.vendor)) {
      fail(`${ownerLabel} recommendedModels contains duplicate vendor "${entry.vendor}" (max one model per vendor).`);
    } else {
      seenVendors.add(entry.vendor);
    }

    if (typeof entry.model !== 'string' || !entry.model.trim()) {
      fail(`${entryLabel} is missing a non-empty "model" name.`);
    }

    if (entry.level !== undefined && typeof entry.level !== 'string') {
      fail(`${entryLabel} level must be a string when present.`);
    }
  });
}

function validateSteps(ownerLabel, steps, inheritedVariables) {
  reportDuplicateValues(`${ownerLabel} step ids`, asArray(steps).map((step) => step?.id).filter(Boolean));

  asArray(steps).forEach((step, index) => {
    const stepLabel = `${ownerLabel} step ${step?.id || index + 1}`;
    const stepVariables = collectVariableNames(stepLabel, step);
    const used = validatePlaceholders(stepLabel, step, [...inheritedVariables, ...stepVariables]);

    stepVariables
      .filter((name) => !used.has(name))
      .forEach((name) => warn(`${stepLabel} defines unused variable "${name}".`));

    validateItemImages(stepLabel, step);
  });
}

function validatePrompt(prompt, index) {
  const ownerLabel = `prompt "${prompt.id || `#${index + 1}`}"`;

  ['id', 'title', 'category'].forEach((key) => {
    if (typeof prompt[key] !== 'string' || !prompt[key].trim()) {
      fail(`${ownerLabel} is missing required string field "${key}".`);
    }
  });

  if (prompt.description !== undefined && typeof prompt.description !== 'string') {
    fail(`${ownerLabel} description must be a string when present.`);
  }

  const promptVariables = collectVariableNames(ownerLabel, prompt);
  const promptUsed = validatePlaceholders(ownerLabel, prompt, promptVariables);

  if (!prompt.template && !prompt.variations?.length && !prompt.steps?.length) {
    fail(`${ownerLabel} must define template, variations, or steps.`);
  }

  promptVariables
    .filter((name) => !promptUsed.has(name))
    .forEach((name) => {
      const usedInChild = JSON.stringify([prompt.variations, prompt.steps] || []).includes(`{{${name}}}`);
      if (!usedInChild) warn(`${ownerLabel} defines unused variable "${name}".`);
    });

  validateItemImages(ownerLabel, prompt);
  validateRecommendedModels(ownerLabel, prompt.recommendedModels);
  validateSteps(ownerLabel, prompt.steps, promptVariables);

  reportDuplicateValues(`${ownerLabel} variation ids`, asArray(prompt.variations).map((variation) => variation?.id).filter(Boolean));

  asArray(prompt.variations).forEach((variation, variationIndex) => {
    const variationLabel = `${ownerLabel} variation "${variation.id || variationIndex + 1}"`;

    if (typeof variation.id !== 'string' || !variation.id.trim()) {
      fail(`${variationLabel} is missing required string field "id".`);
    }

    const variationVariables = collectVariableNames(variationLabel, variation);
    const availableVariables = [...promptVariables, ...variationVariables];
    const used = validatePlaceholders(variationLabel, variation, availableVariables);

    variationVariables
      .filter((name) => !used.has(name))
      .forEach((name) => {
        const usedInStep = JSON.stringify(variation.steps || []).includes(`{{${name}}}`);
        if (!usedInStep) warn(`${variationLabel} defines unused variable "${name}".`);
      });

    validateVariationDescription(prompt, variation, variationLabel);
    validateItemImages(variationLabel, variation);
    validateSteps(variationLabel, variation.steps, availableVariables);
  });
}

promptData = readPrompts(PROMPTS_PATH);

if (!Array.isArray(promptData)) {
  fail(`${PROMPTS_PATH} must be a flat JSON array.`);
}

if (!hasErrors && Array.isArray(promptData)) {
  reportDuplicateValues('prompts.json ids', promptData.map((prompt) => prompt?.id).filter(Boolean));
  promptData.forEach(validatePrompt);
}

if (hasErrors) {
  console.error(`\nValidation failed for ${path.basename(PROMPTS_PATH)}.`);
  process.exit(1);
}

console.log(`Validated ${promptData.length} prompts in ${PROMPTS_PATH}.`);
if (warningCount) {
  console.log(`${warningCount} warning${warningCount === 1 ? '' : 's'} reported.`);
}
