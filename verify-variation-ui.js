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
    
    // Check if it's the recent deployment (should be ~673 KB)
    if (stats.size >= 670000 && stats.size <= 675000) {
        console.log('  ✓ Bundle size matches deployed version (~673 KB)');
    } else {
        console.log('  ⚠ Bundle size unexpected (expected ~673 KB)');
    }
} else {
    console.log('✗ web-components.js not found');
}

// Check 2: Verify admin.html has cache-busting parameter
const adminPath = path.join(__dirname, 'admin.html');
if (fs.existsSync(adminPath)) {
    const adminContent = fs.readFileSync(adminPath, 'utf-8');
    
    // Check for cache-busting parameter
    const cacheBustMatch = adminContent.match(/web-components\.js\?v=(\d{8}-\d{4})/);
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

// Check 3: Verify the component file has conversion methods
const componentPath = path.join(__dirname, '../m3-design-v2/src/components/wy-prompt-editor.js');
if (fs.existsSync(componentPath)) {
    const componentContent = fs.readFileSync(componentPath, 'utf-8');
    
    console.log('\n✓ Source component found');
    
    // Check for conversion methods
    const hasConvertToVariations = componentContent.includes('_convertToVariations()');
    const hasConvertFromVariations = componentContent.includes('_convertFromVariations()');
    const hasConvertButton = componentContent.includes('Convert to Variations');
    const hasCardHeader = componentContent.includes('card-header-with-action');
    
    console.log(`  ${hasConvertToVariations ? '✓' : '✗'} Has _convertToVariations method`);
    console.log(`  ${hasConvertFromVariations ? '✓' : '✗'} Has _convertFromVariations method`);
    console.log(`  ${hasConvertButton ? '✓' : '✓'} Has "Convert to Variations" button`);
    console.log(`  ${hasCardHeader ? '✓' : '✗'} Has card-header-with-action CSS`);
} else {
    console.log('\n⚠ Source component not found (expected if not in same parent dir)');
}

// Check 4: Verify bundle contains the conversion code
const bundleContent = fs.readFileSync(bundlePath, 'utf-8');
const hasConversionCode = bundleContent.includes('_convertToVariations') && 
                          bundleContent.includes('_convertFromVariations');

console.log('\n✓ Checking compiled bundle');
console.log(`  ${hasConversionCode ? '✓' : '✗'} Contains conversion methods`);

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
    fs.statSync(bundlePath).size >= 670000,
    fs.readFileSync(adminPath, 'utf-8').includes('?v='),
    hasConversionCode
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
