/**
 * Comprehensive Test for Multi-Step Modal Race Condition Fixes
 * 
 * Tests all 3 reported bugs:
 * 1. Random step selection on load
 * 2. Navigation buttons not working
 * 3. Tab toggle not working
 * 
 * Run in browser console at http://localhost:3001/index.html
 * After loading, click "Essay Topic Discovery" and run: testRaceConditionFixes()
 */

async function testRaceConditionFixes() {
    console.log('\n🧪 TESTING RACE CONDITION FIXES\n' + '='.repeat(60));
    
    const modal = document.getElementById('promptModal');
    
    if (!modal) {
        console.error('❌ Modal not found. Make sure you opened a prompt first.');
        return;
    }
    
    if (!modal.open) {
        console.error('❌ Modal is not open. Click "Essay Topic Discovery" first.');
        return;
    }
    
    const results = { passed: 0, failed: 0, tests: [] };
    
    function test(name, testFn) {
        try {
            const result = testFn();
            if (result.pass) {
                console.log(`✅ ${name}`);
                if (result.details) console.log(`   ${result.details}`);
                results.passed++;
                results.tests.push({ name, status: 'PASS', details: result.details });
            } else {
                console.error(`❌ ${name}`);
                console.error(`   ${result.reason}`);
                results.failed++;
                results.tests.push({ name, status: 'FAIL', reason: result.reason });
            }
        } catch (e) {
            console.error(`❌ ${name} (ERROR)`);
            console.error(`   ${e.message}`);
            results.failed++;
            results.tests.push({ name, status: 'ERROR', reason: e.message });
        }
    }
    
    console.log('\n📋 PART 1: STATE CONSISTENCY TESTS\n');
    
    test('Modal has steps array', () => {
        return modal.steps && Array.isArray(modal.steps) && modal.steps.length > 0
            ? { pass: true, details: `${modal.steps.length} steps loaded` }
            : { pass: false, reason: 'Steps array is missing or empty' };
    });
    
    test('Active step index is valid', () => {
        const index = modal.activeStepIndex;
        const isValid = index >= 0 && index < modal.steps.length;
        return isValid
            ? { pass: true, details: `Index ${index} is valid (0-${modal.steps.length - 1})` }
            : { pass: false, reason: `Index ${index} is out of bounds (0-${modal.steps.length - 1})` };
    });
    
    test('Current step exists', () => {
        const step = modal.steps[modal.activeStepIndex];
        return step
            ? { pass: true, details: `Step: ${step.name}` }
            : { pass: false, reason: 'Current step is undefined' };
    });
    
    test('Current step has template', () => {
        const step = modal.steps[modal.activeStepIndex];
        return step && step.template && step.template.length > 0
            ? { pass: true, details: `${step.template.length} chars` }
            : { pass: false, reason: 'Step template is missing or empty' };
    });
    
    test('_values object populated', () => {
        const hasValues = modal._values && Object.keys(modal._values).length > 0;
        return hasValues
            ? { pass: true, details: `${Object.keys(modal._values).length} variables` }
            : { pass: false, reason: '_values is empty or undefined' };
    });
    
    console.log('\n📋 PART 2: BUG #1 - CONSISTENT STEP SELECTION\n');
    
    test('Step 1 is active on load', () => {
        const expectedFirstLoad = modal.activeStepIndex === 0;
        return expectedFirstLoad
            ? { pass: true, details: 'First step (index 0) is active' }
            : { pass: false, reason: `Expected index 0, got ${modal.activeStepIndex}` };
    });
    
    test('Step data matches active index', () => {
        const step = modal.steps[modal.activeStepIndex];
        const stepName = modal.shadowRoot?.querySelector('.step-instructions')?.getAttribute('heading');
        return stepName === step.name
            ? { pass: true, details: `Displaying: ${step.name}` }
            : { pass: false, reason: `UI shows "${stepName}" but active step is "${step.name}"` };
    });
    
    console.log('\n📋 PART 3: BUG #2 - NAVIGATION BUTTONS\n');
    
    test('Next button exists and clickable', () => {
        const nextBtn = modal.shadowRoot?.querySelector('[aria-label="Next step"]');
        return nextBtn && !nextBtn.disabled
            ? { pass: true, details: 'Button found and enabled' }
            : { pass: false, reason: nextBtn ? 'Button is disabled' : 'Button not found' };
    });
    
    test('Previous button exists (should be disabled on step 1)', () => {
        const prevBtn = modal.shadowRoot?.querySelector('[aria-label="Previous step"]');
        const shouldBeDisabled = modal.activeStepIndex === 0;
        return prevBtn && prevBtn.disabled === shouldBeDisabled
            ? { pass: true, details: shouldBeDisabled ? 'Correctly disabled' : 'Correctly enabled' }
            : { pass: false, reason: 'Button state incorrect' };
    });
    
    console.log('\n📋 PART 4: BUG #3 - TAB TOGGLE\n');
    
    test('Variables tab button exists', () => {
        const varTab = modal.shadowRoot?.querySelector('[data-tab="variables"]');
        return varTab
            ? { pass: true, details: 'Button found with data-tab attribute' }
            : { pass: false, reason: 'Variables tab button not found' };
    });
    
    test('Preview tab button exists', () => {
        const previewTab = modal.shadowRoot?.querySelector('[data-tab="preview"]');
        return previewTab
            ? { pass: true, details: 'Button found with data-tab attribute' }
            : { pass: false, reason: 'Preview tab button not found' };
    });
    
    test('Active tab state is valid', () => {
        const validTabs = ['variables', 'preview'];
        return validTabs.includes(modal.activeTab)
            ? { pass: true, details: `Current tab: ${modal.activeTab}` }
            : { pass: false, reason: `Invalid tab: ${modal.activeTab}` };
    });
    
    console.log('\n📋 PART 5: PREVIEW CONTENT\n');
    
    test('Preview area renders without errors', () => {
        // Try to get preview area (might not be visible if on Variables tab)
        const currentTab = modal.activeTab;
        const step = modal.steps[modal.activeStepIndex];
        
        if (!step.template) {
            return { pass: false, reason: 'Step has no template' };
        }
        
        // Check if _compilePrompt works without errors
        try {
            const compiled = modal._compilePrompt(step.template);
            return compiled !== undefined && compiled !== null
                ? { pass: true, details: `Compiled ${compiled.length} chars` }
                : { pass: false, reason: 'Compilation returned null/undefined' };
        } catch (e) {
            return { pass: false, reason: `Compilation error: ${e.message}` };
        }
    });
    
    console.log('\n📋 PART 6: INTERACTIVE TESTS\n');
    console.log('⚠️  The following require manual testing:\n');
    
    console.log('1. Navigation Test:');
    console.log('   - Click "Next" button 3 times (should go to Step 4)');
    console.log('   - Click "Previous" button 3 times (should return to Step 1)');
    console.log('   - Verify step name and instructions change each time\n');
    
    console.log('2. Tab Toggle Test:');
    console.log('   - Click "Preview" tab');
    console.log('   - Verify template text appears (not blank)');
    console.log('   - Click "Variables" tab');
    console.log('   - Verify variable inputs appear');
    console.log('   - Repeat 5 times to ensure consistent behavior\n');
    
    console.log('3. Reload Consistency Test:');
    console.log('   - Close modal and reopen "Essay Topic Discovery"');
    console.log('   - Verify Step 1 is always selected');
    console.log('   - Repeat 5 times to ensure no randomness\n');
    
    console.log('4. Multi-Prompt Test:');
    console.log('   - Close modal');
    console.log('   - Open a different prompt');
    console.log('   - Return to "Essay Topic Discovery"');
    console.log('   - Verify Step 1 is active\n');
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 AUTOMATED TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
    
    if (results.failed === 0) {
        console.log('\n🎉 ALL AUTOMATED TESTS PASSED!');
        console.log('✨ Now perform the manual interactive tests above.\n');
    } else {
        console.log('\n⚠️  SOME TESTS FAILED');
        results.tests.filter(t => t.status !== 'PASS').forEach(t => {
            console.log(`  ❌ ${t.name}: ${t.reason}`);
        });
    }
    
    return results;
}

// Instructions
console.log('✅ Race condition test script loaded');
console.log('📝 To test:');
console.log('  1. Click on "Essay Topic Discovery" prompt');
console.log('  2. Run: testRaceConditionFixes()');
console.log('  3. Perform manual interactive tests');
console.log('');
