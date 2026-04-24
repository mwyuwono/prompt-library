/**
 * Verify the variation conversion UI is properly integrated
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================');
console.log('  Variation UI Integration Check');
console.log('========================================\n');

// Check 1: Verify web-components.js exists and is recent
const bundlePath = path.join(__dirname, 'web-components.js');
if (fs.existsSync(bundlePath)) {
    const stats = fs.statSync(bundlePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const modDate = stats.mtime.toISOString();
    console.log('✓ web-components.js found');
    console.log(`  Size: ${sizeKB} KB`);
    console.log(`  Modified: ${modDate}`);
    
    // Local bundle is generated from components/ui via npm run build:components.
    if (stats.size >= 250000 && stats.size <= 350000) {
        console.log('  ✓ Bundle size matches local component build (~288 KB)');
    } else {
        console.log('  ⚠ Bundle size unexpected (expected ~288 KB)');
    }
} else {
    console.log('✗ web-components.js not found');
}

// Check 2: Verify admin.html has cache-busting parameter
const adminPath = path.join(__dirname, 'admin.html');
if (fs.existsSync(adminPath)) {
    const adminContent = fs.readFileSync(adminPath, 'utf-8');
    
    // Check for cache-busting parameter
    const cacheBustMatch = adminContent.match(/web-components\.js\?v=([^'"]+)/);
    if (cacheBustMatch) {
        console.log('\n✓ admin.html has cache-busting');
        console.log(`  Parameter: ?v=${cacheBustMatch[1]}`);
    } else {
        console.log('\n✗ admin.html missing cache-busting parameter');
    }
    
    // Check for wy-prompt-editor component
    if (adminContent.includes('wy-prompt-editor')) {
        console.log('✓ admin.html includes wy-prompt-editor');
    } else {
        console.log('✗ admin.html missing wy-prompt-editor');
    }
} else {
    console.log('\n✗ admin.html not found');
}

// Check 3: Verify source components use the new textarea event contract
const promptEditorPath = path.join(__dirname, 'components/ui/wy-prompt-editor.js');
const stepEditorPath = path.join(__dirname, 'components/ui/wy-step-editor.js');
const variationEditorPath = path.join(__dirname, 'components/ui/wy-variation-editor.js');
const codeTextareaPath = path.join(__dirname, 'components/ui/wy-code-textarea.js');

if (fs.existsSync(promptEditorPath) && fs.existsSync(stepEditorPath) && fs.existsSync(variationEditorPath) && fs.existsSync(codeTextareaPath)) {
    const promptEditorContent = fs.readFileSync(promptEditorPath, 'utf-8');
    const stepEditorContent = fs.readFileSync(stepEditorPath, 'utf-8');
    const variationEditorContent = fs.readFileSync(variationEditorPath, 'utf-8');
    const codeTextareaContent = fs.readFileSync(codeTextareaPath, 'utf-8');
    
    console.log('\n✓ Source components found');
    
    const hasConvertToVariations = promptEditorContent.includes('_convertToVariations()');
    const hasConvertFromVariations = promptEditorContent.includes('_convertFromVariations()');
    const hasVariationSaveSync = promptEditorContent.includes('_syncVariationTemplatesForSave()');
    const usesValueInputInPromptEditor = promptEditorContent.includes('@value-input="${(e) => this._handleFieldChange(\'template\', e.detail.value)}"');
    const usesValueInputInStepEditor = stepEditorContent.includes('@value-input="${this._handleTemplateChange}"');
    const usesValueInputInVariationEditor = variationEditorContent.includes('@value-input="${(e) => this._handleTemplateChange(index, e)}"');
    const codeTextareaUsesValueInput = codeTextareaContent.includes("new CustomEvent('value-input'");
    const codeTextareaUsesValueChange = codeTextareaContent.includes("new CustomEvent('value-change'");
    const codeTextareaStillUsesCustomInput = codeTextareaContent.includes("new CustomEvent('input'");
    const codeTextareaStillUsesCustomChange = codeTextareaContent.includes("new CustomEvent('change'");
    
    console.log(`  ${hasConvertToVariations ? '✓' : '✗'} Has _convertToVariations method`);
    console.log(`  ${hasConvertFromVariations ? '✓' : '✗'} Has _convertFromVariations method`);
    console.log(`  ${hasVariationSaveSync ? '✓' : '✗'} Has variation save sync method`);
    console.log(`  ${usesValueInputInPromptEditor ? '✓' : '✗'} Prompt editor uses value-input`);
    console.log(`  ${usesValueInputInStepEditor ? '✓' : '✗'} Step editor uses value-input`);
    console.log(`  ${usesValueInputInVariationEditor ? '✓' : '✗'} Variation editor uses value-input`);
    console.log(`  ${codeTextareaUsesValueInput ? '✓' : '✗'} Code textarea dispatches value-input`);
    console.log(`  ${codeTextareaUsesValueChange ? '✓' : '✗'} Code textarea dispatches value-change`);
    console.log(`  ${!codeTextareaStillUsesCustomInput ? '✓' : '✗'} Code textarea no longer dispatches custom input`);
    console.log(`  ${!codeTextareaStillUsesCustomChange ? '✓' : '✗'} Code textarea no longer dispatches custom change`);
} else {
    console.log('\n⚠ Source components not found');
}

// Check 4: Verify bundle contains the new event contract and save sync
const bundleContent = fs.readFileSync(bundlePath, 'utf-8');
const hasConversionCode = bundleContent.includes('_convertToVariations') && 
                          bundleContent.includes('_convertFromVariations');
const hasVariationSaveSyncInBundle = bundleContent.includes('_syncVariationTemplatesForSave');
const bundleUsesValueInput = bundleContent.includes('value-input');
const bundleUsesValueChange = bundleContent.includes('value-change');
const bundleHasCodeTextareaValueInputDispatch = bundleContent.includes('dispatchEvent(new CustomEvent("value-input"');
const bundleHasCodeTextareaValueChangeDispatch = bundleContent.includes('dispatchEvent(new CustomEvent("value-change"');
const bundleHasCodeTextareaCustomInputDispatch = bundleContent.includes('dispatchEvent(new CustomEvent("input"');
const bundleHasCodeTextareaCustomChangeDispatch = bundleContent.includes('dispatchEvent(new CustomEvent("change", {\n      detail: { value: this.value }');

console.log('\n✓ Checking compiled bundle');
console.log(`  ${hasConversionCode ? '✓' : '✗'} Contains conversion methods`);
console.log(`  ${hasVariationSaveSyncInBundle ? '✓' : '✗'} Contains variation save sync`);
console.log(`  ${bundleUsesValueInput ? '✓' : '✗'} Contains value-input event usage`);
console.log(`  ${bundleUsesValueChange ? '✓' : '✗'} Contains value-change event usage`);
console.log(`  ${bundleHasCodeTextareaValueInputDispatch ? '✓' : '✗'} Code textarea dispatches value-input in bundle`);
console.log(`  ${bundleHasCodeTextareaValueChangeDispatch ? '✓' : '✗'} Code textarea dispatches value-change in bundle`);
console.log(`  ${!bundleHasCodeTextareaCustomInputDispatch ? '✓' : '✗'} Code textarea no longer dispatches custom input in bundle`);
console.log(`  ${!bundleHasCodeTextareaCustomChangeDispatch ? '✓' : '✗'} Code textarea no longer dispatches custom change in bundle`);

if (bundleContent.includes('Convert to Variations')) {
    console.log('  ✓ Contains "Convert to Variations" UI text');
} else {
    console.log('  ✗ Missing "Convert to Variations" UI text');
}

if (bundleContent.includes('Convert to Standard')) {
    console.log('  ✓ Contains "Convert to Standard" UI text');
} else {
    console.log('  ✗ Missing "Convert to Standard" UI text');
}

// Summary
console.log('\n========================================');
console.log('  Verification Summary');
console.log('========================================\n');

const allChecks = [
    fs.existsSync(bundlePath),
    fs.statSync(bundlePath).size >= 250000 && fs.statSync(bundlePath).size <= 350000,
    fs.readFileSync(adminPath, 'utf-8').includes('?v='),
    hasConversionCode,
    hasVariationSaveSyncInBundle,
    bundleUsesValueInput,
    bundleUsesValueChange,
    bundleHasCodeTextareaValueInputDispatch,
    bundleHasCodeTextareaValueChangeDispatch,
    !bundleHasCodeTextareaCustomInputDispatch,
    !bundleHasCodeTextareaCustomChangeDispatch
];

const passed = allChecks.filter(Boolean).length;
const total = allChecks.length;

console.log(`Checks passed: ${passed}/${total}`);

if (passed === total) {
    console.log('\n✓ All checks passed! UI is ready for testing.');
    console.log('\nNext steps:');
    console.log('  1. Open http://localhost:3001/admin');
    console.log('  2. Select "Audio Essay" (single-step)');
    console.log('  3. Look for "Convert to Variations" button next to "Prompt Type"');
    console.log('  4. Click button and verify variation editor appears');
    console.log('  5. Try "Essay Topic Discovery" (multi-step)');
    console.log('  6. Try "Writing Assistant" (has variations already)');
    console.log('  7. Look for "Convert to Standard" button');
} else {
    console.log('\n⚠ Some checks failed. Review output above.');
}

console.log('');
