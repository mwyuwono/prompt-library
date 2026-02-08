/**
 * Test script for variation conversion controls
 * Run: node test-variation-conversion.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read prompts.json
const promptsPath = path.join(__dirname, 'prompts.json');
const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));

console.log('========================================');
console.log('  Variation Conversion Test');
console.log('========================================\n');

// Test Case 1: Find a single-step prompt
const singleStepPrompt = prompts.find(p => !p.variations && !p.steps);
if (singleStepPrompt) {
    console.log('✓ Found single-step prompt:', singleStepPrompt.title);
    console.log('  - Has template:', !!singleStepPrompt.template);
    console.log('  - Has variables:', (singleStepPrompt.variables || []).length, 'variables');
} else {
    console.log('✗ No single-step prompts found');
}

// Test Case 2: Find a multi-step prompt
const multiStepPrompt = prompts.find(p => !p.variations && p.steps && p.steps.length > 0);
if (multiStepPrompt) {
    console.log('\n✓ Found multi-step prompt:', multiStepPrompt.title);
    console.log('  - Number of steps:', multiStepPrompt.steps.length);
    console.log('  - Steps:');
    multiStepPrompt.steps.forEach((step, i) => {
        console.log(`    ${i + 1}. ${step.name}`);
    });
} else {
    console.log('\n✗ No multi-step prompts found');
}

// Test Case 3: Find a prompt with variations
const variationPrompt = prompts.find(p => p.variations && p.variations.length > 0);
if (variationPrompt) {
    console.log('\n✓ Found variation-based prompt:', variationPrompt.title);
    console.log('  - Number of variations:', variationPrompt.variations.length);
    console.log('  - Variations:');
    variationPrompt.variations.forEach((v, i) => {
        const type = v.steps ? `multi-step (${v.steps.length} steps)` : 'single-step';
        console.log(`    ${i + 1}. ${v.name} - ${type}`);
    });
} else {
    console.log('\n✗ No variation-based prompts found');
}

// Summary
console.log('\n========================================');
console.log('  Data Model Verification');
console.log('========================================\n');

const stats = {
    total: prompts.length,
    singleStep: prompts.filter(p => !p.variations && !p.steps).length,
    multiStep: prompts.filter(p => !p.variations && p.steps).length,
    variations: prompts.filter(p => p.variations).length
};

console.log('Total prompts:', stats.total);
console.log('Single-step:', stats.singleStep);
console.log('Multi-step:', stats.multiStep);
console.log('Variations:', stats.variations);

// Recommendations for manual testing
console.log('\n========================================');
console.log('  Manual Testing Recommendations');
console.log('========================================\n');

console.log('Test the following prompts in admin interface:');
console.log('\n1. Single-step → Variations:');
if (singleStepPrompt) {
    console.log(`   Open "${singleStepPrompt.title}"`);
    console.log('   Click "Convert to Variations" button');
    console.log('   Verify: Variation editor appears with 1 variation');
}

console.log('\n2. Multi-step → Variations:');
if (multiStepPrompt) {
    console.log(`   Open "${multiStepPrompt.title}"`);
    console.log('   Click "Convert to Variations" button');
    console.log('   Verify: Variation editor appears with 1 multi-step variation');
}

console.log('\n3. Variations → Standard:');
if (variationPrompt) {
    console.log(`   Open "${variationPrompt.title}"`);
    console.log('   Click "Convert to Standard" button');
    console.log('   Confirm dialog');
    console.log('   Verify: Standard mode with first variation as template');
}

console.log('\n4. Admin URL: http://localhost:3001/admin\n');
