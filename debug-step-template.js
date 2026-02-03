/**
 * Debug Script for Step Template Issues
 * 
 * Run in browser console after opening Essay Topic Discovery prompt
 * 
 * Usage: debugStepTemplate()
 */

function debugStepTemplate() {
    console.log('\n🔍 DEBUG: STEP TEMPLATE INVESTIGATION\n' + '='.repeat(70));
    
    const modal = document.getElementById('promptModal');
    
    if (!modal || !modal.open) {
        console.error('❌ Modal not found or not open');
        console.log('   1. Click on "Essay Topic Discovery" prompt');
        console.log('   2. Run this script again');
        return;
    }
    
    console.log('\n📊 MODAL STATE\n' + '-'.repeat(70));
    console.log(`Title: ${modal.title}`);
    console.log(`Mode: ${modal.mode}`);
    console.log(`Active Tab: ${modal.activeTab}`);
    console.log(`Has Steps: ${!!(modal.steps && modal.steps.length > 0)}`);
    console.log(`Steps Count: ${modal.steps?.length || 0}`);
    console.log(`Active Step Index: ${modal.activeStepIndex}`);
    
    if (!modal.steps || modal.steps.length === 0) {
        console.error('❌ No steps found in modal');
        return;
    }
    
    console.log('\n📝 ALL STEPS DATA\n' + '-'.repeat(70));
    modal.steps.forEach((step, i) => {
        console.log(`\nStep ${i + 1}:`);
        console.log(`  ID: ${step.id}`);
        console.log(`  Name: ${step.name}`);
        console.log(`  Has Template: ${!!(step.template)}`);
        console.log(`  Template Type: ${typeof step.template}`);
        console.log(`  Template Length: ${step.template?.length || 0} chars`);
        if (step.template) {
            console.log(`  Template Preview: ${step.template.substring(0, 100)}...`);
        } else {
            console.log(`  Template Value: ${step.template}`);
        }
        console.log(`  Variables Count: ${step.variables?.length || 0}`);
    });
    
    const currentStep = modal.steps[modal.activeStepIndex];
    console.log('\n🎯 CURRENT STEP (Active)\n' + '-'.repeat(70));
    console.log(`Index: ${modal.activeStepIndex}`);
    console.log(`Name: ${currentStep.name}`);
    console.log(`Has Template: ${!!(currentStep.template)}`);
    console.log(`Template Length: ${currentStep.template?.length || 0}`);
    
    console.log('\n💾 _values OBJECT\n' + '-'.repeat(70));
    console.log(`Keys: ${Object.keys(modal._values || {}).length}`);
    if (modal._values && Object.keys(modal._values).length > 0) {
        Object.keys(modal._values).forEach(key => {
            console.log(`  ${key}: "${modal._values[key]}"`);
        });
    } else {
        console.log('  (empty)');
    }
    
    console.log('\n🧪 COMPILATION TEST\n' + '-'.repeat(70));
    try {
        if (currentStep.template) {
            const compiled = modal._compilePrompt(currentStep.template);
            console.log('✅ Compilation successful');
            console.log(`   Compiled length: ${compiled.length} chars`);
            console.log(`   Preview: ${compiled.substring(0, 200)}...`);
        } else {
            console.error('❌ Current step has no template');
        }
    } catch (e) {
        console.error('❌ Compilation failed:', e.message);
    }
    
    console.log('\n🎨 DOM INSPECTION\n' + '-'.repeat(70));
    
    // Check for tab buttons
    const varTab = modal.shadowRoot?.querySelector('[data-tab="variables"]');
    const previewTab = modal.shadowRoot?.querySelector('[data-tab="preview"]');
    console.log(`Variables tab exists: ${!!varTab}`);
    console.log(`Preview tab exists: ${!!previewTab}`);
    
    if (varTab) {
        console.log(`  - Is active: ${varTab.classList.contains('active')}`);
        console.log(`  - Has data-tab: ${varTab.dataset.tab}`);
    }
    
    if (previewTab) {
        console.log(`  - Is active: ${previewTab.classList.contains('active')}`);
        console.log(`  - Has data-tab: ${previewTab.dataset.tab}`);
    }
    
    // Check for preview area
    const previewArea = modal.shadowRoot?.querySelector('.preview-area');
    console.log(`\nPreview area exists: ${!!previewArea}`);
    if (previewArea) {
        console.log(`  Content: "${previewArea.textContent?.substring(0, 200) || '(empty)'}"`);
        console.log(`  Is visible: ${getComputedStyle(previewArea).display !== 'none'}`);
    }
    
    // Check for variables grid
    const variablesGrid = modal.shadowRoot?.querySelector('.variables-grid');
    console.log(`\nVariables grid exists: ${!!variablesGrid}`);
    if (variablesGrid) {
        console.log(`  Is visible: ${getComputedStyle(variablesGrid).display !== 'none'}`);
    }
    
    console.log('\n🔧 RECOMMENDED ACTIONS\n' + '-'.repeat(70));
    
    if (!currentStep.template) {
        console.log('⚠️  Template is missing for current step');
        console.log('   Action: Add template in admin editor');
    } else if (modal.activeTab !== 'preview') {
        console.log('ℹ️  Currently on Variables tab');
        console.log('   Action: Click "Preview" tab to see template');
    } else if (!previewArea) {
        console.log('⚠️  Preview area element not found in DOM');
        console.log('   Action: Hard refresh (Cmd+Shift+R)');
    } else if (!previewArea.textContent || previewArea.textContent.length === 0) {
        console.log('⚠️  Preview area is empty despite having template');
        console.log('   Possible causes:');
        console.log('   - _values object not populated correctly');
        console.log('   - _compilePrompt not being called');
        console.log('   - Template placeholders causing issues');
        console.log('   Action: Try manually switching tabs or reloading');
    } else {
        console.log('✅ Everything looks good!');
        console.log('   If preview still appears empty visually:');
        console.log('   - Check CSS (display: none, opacity: 0, etc.)');
        console.log('   - Check for overlapping elements');
    }
    
    console.log('\n' + '='.repeat(70));
}

// Instructions
console.log('✅ Debug script loaded');
console.log('📝 Run: debugStepTemplate()');
console.log('');
