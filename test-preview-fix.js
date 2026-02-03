/**
 * Test Script for Multi-Step Preview Fix
 * 
 * Run in browser console at http://localhost:3001/index.html
 * after opening a multi-step prompt (e.g., Essay Topic Discovery)
 */

function testPreviewFix() {
    console.log('\n🔍 TESTING MULTI-STEP PREVIEW FIX\n' + '='.repeat(50));
    
    const modal = document.getElementById('promptModal');
    
    if (!modal) {
        console.error('❌ Prompt modal not found. Open a prompt first.');
        return;
    }
    
    if (!modal.open) {
        console.error('❌ Modal is not open. Click on a multi-step prompt to open it.');
        return;
    }
    
    console.log('\n📊 MODAL STATE:');
    console.log(`  Title: ${modal.title}`);
    console.log(`  Has steps: ${modal.steps && modal.steps.length > 0}`);
    console.log(`  Steps count: ${modal.steps?.length || 0}`);
    console.log(`  Active step index: ${modal.activeStepIndex}`);
    console.log(`  Active tab: ${modal.activeTab}`);
    
    if (!modal.steps || modal.steps.length === 0) {
        console.log('\n⚠️  This is not a multi-step prompt. Open "Essay Topic Discovery" instead.');
        return;
    }
    
    const currentStep = modal.steps[modal.activeStepIndex];
    console.log(`\n📝 CURRENT STEP (Step ${modal.activeStepIndex + 1}):`);
    console.log(`  Name: ${currentStep.name}`);
    console.log(`  Template length: ${currentStep.template?.length || 0} chars`);
    console.log(`  Variables count: ${currentStep.variables?.length || 0}`);
    
    if (currentStep.variables && currentStep.variables.length > 0) {
        console.log(`\n🔢 STEP VARIABLES:`);
        currentStep.variables.forEach(v => {
            console.log(`  - ${v.name}: "${v.value || '(empty)'}"`);
        });
    }
    
    console.log(`\n💾 MODAL _values OBJECT:`);
    console.log(`  Keys: ${Object.keys(modal._values || {}).join(', ') || '(empty)'}`);
    Object.keys(modal._values || {}).forEach(key => {
        console.log(`  - ${key}: "${modal._values[key] || '(empty)'}"`);
    });
    
    console.log(`\n🎨 PREVIEW AREA CHECK:`);
    const previewArea = modal.shadowRoot?.querySelector('.preview-area');
    if (previewArea) {
        console.log(`  ✅ Preview area element exists`);
        console.log(`  Content length: ${previewArea.textContent?.length || 0} chars`);
        console.log(`  First 200 chars: ${previewArea.textContent?.substring(0, 200) || '(empty)'}`);
        
        if (previewArea.textContent && previewArea.textContent.length > 0) {
            console.log('\n✅ SUCCESS: Preview area has content!');
        } else {
            console.log('\n❌ FAIL: Preview area is empty');
            console.log('\nDebugging info:');
            console.log(`  - Template: ${currentStep.template?.substring(0, 100)}...`);
            console.log(`  - _values populated: ${Object.keys(modal._values || {}).length > 0}`);
        }
    } else {
        console.log(`  ❌ Preview area element NOT found`);
        console.log(`  Current tab: ${modal.activeTab}`);
        console.log('  Try clicking the "Preview" tab first');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n📝 MANUAL TEST STEPS:');
    console.log('1. Click the "Preview" tab');
    console.log('2. Check if the template text appears');
    console.log('3. Fill in a variable and check if {{variable}} is replaced');
    console.log('4. Switch to Step 2 and verify its template shows');
    console.log('\n' + '='.repeat(50));
}

// Instructions
console.log('✅ Preview test script loaded');
console.log('📝 To test:');
console.log('  1. Click on "Essay Topic Discovery" prompt');
console.log('  2. In the console, run: testPreviewFix()');
console.log('');
