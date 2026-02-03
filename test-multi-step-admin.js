/**
 * Manual Test Script for Multi-Step Prompt Editing
 * 
 * Open in browser console at http://localhost:3001/admin.html#audio-essay-discovery
 * and run: await testMultiStepPromptEditor()
 */

async function testMultiStepPromptEditor() {
    console.log('🧪 Testing Multi-Step Prompt Editor...\n');
    
    const results = {
        passed: [],
        failed: []
    };
    
    function pass(test) {
        results.passed.push(test);
        console.log(`✅ PASS: ${test}`);
    }
    
    function fail(test, reason) {
        results.failed.push({ test, reason });
        console.error(`❌ FAIL: ${test}\n   Reason: ${reason}`);
    }
    
    // Test 1: Check if wy-step-editor is registered
    try {
        const stepEditor = customElements.get('wy-step-editor');
        if (stepEditor) {
            pass('wy-step-editor component is registered');
        } else {
            fail('wy-step-editor component registration', 'Component not found');
        }
    } catch (e) {
        fail('wy-step-editor component registration', e.message);
    }
    
    // Test 2: Check if editor exists and has prompt loaded
    try {
        const editor = document.getElementById('editor');
        if (!editor) {
            fail('Editor element exists', 'Editor not found in DOM');
        } else if (!editor._editedPrompt) {
            fail('Prompt loaded in editor', 'No prompt data in editor');
        } else {
            pass('Editor exists and has prompt loaded');
        }
    } catch (e) {
        fail('Editor element check', e.message);
    }
    
    // Test 3: Check if prompt mode is detected correctly
    try {
        const editor = document.getElementById('editor');
        if (editor._promptMode === 'multi') {
            pass('Multi-step mode detected correctly');
        } else {
            fail('Multi-step mode detection', `Mode is ${editor._promptMode}, expected 'multi'`);
        }
    } catch (e) {
        fail('Prompt mode detection', e.message);
    }
    
    // Test 4: Check if steps are loaded
    try {
        const editor = document.getElementById('editor');
        const steps = editor._editedPrompt?.steps;
        if (Array.isArray(steps) && steps.length > 0) {
            pass(`Steps loaded (${steps.length} steps found)`);
            console.log(`   Steps: ${steps.map(s => s.name).join(', ')}`);
        } else {
            fail('Steps loaded', 'No steps found in prompt');
        }
    } catch (e) {
        fail('Steps loading check', e.message);
    }
    
    // Test 5: Check if wy-step-editor components are rendered
    try {
        const stepEditors = document.querySelectorAll('wy-step-editor');
        if (stepEditors.length > 0) {
            pass(`Step editors rendered (${stepEditors.length} editors)`);
        } else {
            fail('Step editors rendered', 'No wy-step-editor elements found in DOM');
        }
    } catch (e) {
        fail('Step editor rendering check', e.message);
    }
    
    // Test 6: Check if mode toggle exists
    try {
        const modeToggle = document.querySelector('.mode-toggle');
        if (modeToggle) {
            pass('Mode toggle UI exists');
        } else {
            fail('Mode toggle UI', 'Mode toggle not found in DOM');
        }
    } catch (e) {
        fail('Mode toggle check', e.message);
    }
    
    // Test 7: Check if add step button exists
    try {
        const addButton = document.querySelector('.add-step-button');
        if (addButton) {
            pass('Add step button exists');
        } else {
            fail('Add step button', 'Button not found in DOM');
        }
    } catch (e) {
        fail('Add step button check', e.message);
    }
    
    // Test 8: Verify step data structure
    try {
        const editor = document.getElementById('editor');
        const firstStep = editor._editedPrompt?.steps?.[0];
        if (firstStep) {
            const hasRequiredFields = 
                firstStep.hasOwnProperty('id') &&
                firstStep.hasOwnProperty('name') &&
                firstStep.hasOwnProperty('instructions') &&
                firstStep.hasOwnProperty('template') &&
                firstStep.hasOwnProperty('variables');
            
            if (hasRequiredFields) {
                pass('Step data structure is correct');
            } else {
                fail('Step data structure', 'Missing required fields');
                console.log('   Step fields:', Object.keys(firstStep));
            }
        } else {
            fail('Step data structure', 'No first step found');
        }
    } catch (e) {
        fail('Step data structure check', e.message);
    }
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log('='.repeat(50));
    
    if (results.failed.length > 0) {
        console.log('\n❌ FAILED TESTS:');
        results.failed.forEach(({ test, reason }) => {
            console.log(`  - ${test}: ${reason}`);
        });
    }
    
    console.log('\n📝 MANUAL TESTS TO PERFORM:');
    console.log('1. Expand/collapse steps');
    console.log('2. Edit step name, instructions, template');
    console.log('3. Add a new step');
    console.log('4. Delete a step (should prevent if last step)');
    console.log('5. Move step up/down');
    console.log('6. Convert to single-step (should show confirmation)');
    console.log('7. Save prompt and verify JSON structure');
    
    return results;
}

// Instructions for use
console.log('💡 To run tests, execute: await testMultiStepPromptEditor()');
