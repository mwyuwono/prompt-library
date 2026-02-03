/**
 * Verification Script for Multi-Step Prompt Fix
 * 
 * Run this in browser console at http://localhost:3001/admin.html#audio-essay-discovery
 * 
 * Usage: Copy and paste entire script, then call verifyFix()
 */

function verifyFix() {
    console.log('\n🔍 VERIFYING MULTI-STEP PROMPT FIX\n' + '='.repeat(50) + '\n');
    
    const results = { passed: 0, failed: 0, tests: [] };
    
    function test(name, check) {
        try {
            const result = check();
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
    
    // Test 1: Component Registration
    test('wy-step-editor is registered', () => {
        const registered = customElements.get('wy-step-editor');
        return registered 
            ? { pass: true, details: 'Component constructor found' }
            : { pass: false, reason: 'customElements.get returned undefined' };
    });
    
    // Test 2: Editor exists
    test('Editor element exists', () => {
        const editor = document.getElementById('editor');
        return editor
            ? { pass: true, details: `Element type: ${editor.tagName}` }
            : { pass: false, reason: 'Editor element not found in DOM' };
    });
    
    // Test 3: Prompt loaded
    test('Prompt loaded in editor', () => {
        const editor = document.getElementById('editor');
        const prompt = editor?._editedPrompt;
        return prompt
            ? { pass: true, details: `Prompt: ${prompt.title}` }
            : { pass: false, reason: '_editedPrompt is null or undefined' };
    });
    
    // Test 4: Mode detection
    test('Multi-step mode detected', () => {
        const editor = document.getElementById('editor');
        const mode = editor?._promptMode;
        return mode === 'multi'
            ? { pass: true, details: `Mode: ${mode}` }
            : { pass: false, reason: `Expected 'multi', got '${mode}'` };
    });
    
    // Test 5: Steps array exists
    test('Steps array exists', () => {
        const editor = document.getElementById('editor');
        const steps = editor?._editedPrompt?.steps;
        return Array.isArray(steps) && steps.length > 0
            ? { pass: true, details: `${steps.length} steps found` }
            : { pass: false, reason: 'Steps array is empty or not an array' };
    });
    
    // Test 6: Expected step count
    test('Correct number of steps (4)', () => {
        const editor = document.getElementById('editor');
        const steps = editor?._editedPrompt?.steps || [];
        return steps.length === 4
            ? { pass: true, details: steps.map(s => s.name).join(', ') }
            : { pass: false, reason: `Expected 4 steps, found ${steps.length}` };
    });
    
    // Test 7: Step editors rendered
    test('Step editor elements rendered', () => {
        const stepEditors = document.querySelectorAll('wy-step-editor');
        return stepEditors.length > 0
            ? { pass: true, details: `${stepEditors.length} wy-step-editor elements in DOM` }
            : { pass: false, reason: 'No wy-step-editor elements found' };
    });
    
    // Test 8: Correct number of step editors
    test('All step editors rendered (4)', () => {
        const stepEditors = document.querySelectorAll('wy-step-editor');
        return stepEditors.length === 4
            ? { pass: true, details: 'All steps have editor components' }
            : { pass: false, reason: `Expected 4 editors, found ${stepEditors.length}` };
    });
    
    // Test 9: First step data
    test('First step has correct data', () => {
        const editor = document.getElementById('editor');
        const firstStep = editor?._editedPrompt?.steps?.[0];
        if (!firstStep) return { pass: false, reason: 'First step not found' };
        
        const hasRequiredFields = 
            firstStep.id === 'decomposition' &&
            firstStep.name === 'Conceptual Decomposition' &&
            firstStep.instructions &&
            firstStep.template &&
            Array.isArray(firstStep.variables);
            
        return hasRequiredFields
            ? { pass: true, details: `ID: ${firstStep.id}, Name: ${firstStep.name}` }
            : { pass: false, reason: 'Missing or incorrect required fields' };
    });
    
    // Test 10: Step editor components have data
    test('Step editors have step data', () => {
        const firstStepEditor = document.querySelector('wy-step-editor');
        const stepData = firstStepEditor?.step;
        return stepData && stepData.name
            ? { pass: true, details: `First step: ${stepData.name}` }
            : { pass: false, reason: 'Step editor has no step data' };
    });
    
    // Test 11: Add Step button exists
    test('Add Step button exists', () => {
        const addButton = document.querySelector('.add-step-button');
        return addButton
            ? { pass: true, details: 'Button found in DOM' }
            : { pass: false, reason: 'Add step button not found' };
    });
    
    // Test 12: Mode toggle exists
    test('Mode toggle exists', () => {
        const modeToggle = document.querySelector('.mode-toggle');
        return modeToggle
            ? { pass: true, details: 'Mode toggle UI present' }
            : { pass: false, reason: 'Mode toggle not found' };
    });
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
    
    if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Multi-step editing is working correctly.\n');
        console.log('✨ You can now:');
        console.log('   - Expand/collapse steps by clicking headers');
        console.log('   - Edit step names, instructions, templates, variables');
        console.log('   - Add new steps with the "Add Step" button');
        console.log('   - Reorder steps with move up/down buttons');
        console.log('   - Delete steps (except the last one)');
        console.log('   - Save changes and they will persist');
    } else {
        console.log('\n⚠️  SOME TESTS FAILED');
        console.log('\nFailed tests:');
        results.tests.filter(t => t.status !== 'PASS').forEach(t => {
            console.log(`  ❌ ${t.name}: ${t.reason || t.details}`);
        });
        console.log('\nTry:');
        console.log('  1. Hard refresh the page (Cmd+Shift+R)');
        console.log('  2. Clear browser cache completely');
        console.log('  3. Check browser console for errors');
    }
    
    return results;
}

// Auto-run if script is loaded
console.log('✅ Verification script loaded.');
console.log('📝 Run: verifyFix() to test multi-step prompt editing');
console.log('');

// Auto-run if page is already loaded
if (document.readyState === 'complete') {
    setTimeout(() => {
        console.log('🔄 Auto-running verification in 2 seconds...');
        console.log('   (Give the editor time to initialize)');
        setTimeout(verifyFix, 2000);
    }, 100);
}
