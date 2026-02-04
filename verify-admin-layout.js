/**
 * Verification Script: Admin Layout Double-Scroll Fix
 * 
 * Tests that the admin page has proper 100vh height with no page-level scrolling,
 * and that sidebar/editor have independent scrolling.
 */

console.log('=== Admin Layout Verification ===\n');

// Test 1: Page container should be exactly 100vh with no overflow
const adminPage = document.querySelector('.admin-page');
const adminPageStyles = getComputedStyle(adminPage);
const adminPageHeight = adminPage.offsetHeight;
const viewportHeight = window.innerHeight;
const adminPageOverflow = adminPageStyles.overflow;

console.log('1. Page Container (.admin-page):');
console.log(`   Height: ${adminPageHeight}px (viewport: ${viewportHeight}px)`);
console.log(`   Overflow: ${adminPageOverflow}`);
console.log(`   ✓ PASS: Should be ~${viewportHeight}px with overflow: hidden` + (adminPageHeight === viewportHeight && adminPageOverflow === 'hidden' ? ' ✓' : ' ✗'));

// Test 2: Body should not scroll
const bodyScrollHeight = document.body.scrollHeight;
const bodyClientHeight = document.body.clientHeight;
const bodyHasScroll = bodyScrollHeight > bodyClientHeight;

console.log('\n2. Body Element:');
console.log(`   scrollHeight: ${bodyScrollHeight}px`);
console.log(`   clientHeight: ${bodyClientHeight}px`);
console.log(`   ✓ PASS: No body scroll (scrollHeight === clientHeight)` + (!bodyHasScroll ? ' ✓' : ' ✗'));

// Test 3: Sidebar should have independent scroll
const sidebar = document.querySelector('.prompt-list');
const sidebarStyles = getComputedStyle(sidebar);
const sidebarHeight = sidebar.offsetHeight;
const sidebarOverflow = sidebarStyles.overflowY;
const sidebarScrollHeight = sidebar.scrollHeight;

console.log('\n3. Sidebar (.prompt-list):');
console.log(`   Height: ${sidebarHeight}px`);
console.log(`   Overflow-Y: ${sidebarOverflow}`);
console.log(`   ScrollHeight: ${sidebarScrollHeight}px (has scroll: ${sidebarScrollHeight > sidebarHeight})`);
console.log(`   ✓ PASS: Height === viewport, overflow-y: auto` + (sidebarHeight === viewportHeight && sidebarOverflow === 'auto' ? ' ✓' : ' ✗'));

// Test 4: Main content area should fill remaining space
const mainContent = document.querySelector('#main-content');
const mainStyles = getComputedStyle(mainContent);
const mainHeight = mainContent.offsetHeight;
const mainOverflow = mainStyles.overflow;

console.log('\n4. Main Content (#main-content):');
console.log(`   Height: ${mainHeight}px`);
console.log(`   Overflow: ${mainOverflow}`);
console.log(`   ✓ PASS: Height should fill available space without causing page scroll` + (mainHeight <= viewportHeight ? ' ✓' : ' ✗'));

// Test 5: Editor component should have independent scroll
const editorContainer = document.querySelector('#editor-container');
if (editorContainer && editorContainer.classList.contains('active')) {
    const editor = document.querySelector('wy-prompt-editor');
    const editorShadow = editor?.shadowRoot;
    
    if (editorShadow) {
        const editorLayout = editorShadow.querySelector('.editor-layout');
        const editorForm = editorShadow.querySelector('.editor-form');
        
        if (editorLayout) {
            const layoutStyles = getComputedStyle(editorLayout);
            const layoutHeight = editorLayout.offsetHeight;
            
            console.log('\n5. Editor Layout (.editor-layout in Shadow DOM):');
            console.log(`   Height: ${layoutHeight}px`);
            console.log(`   Min-Height: ${layoutStyles.minHeight}`);
            console.log(`   ✓ PASS: Should NOT have min-height: 100vh` + (layoutStyles.minHeight !== `${viewportHeight}px` ? ' ✓' : ' ✗'));
        }
        
        if (editorForm) {
            const formStyles = getComputedStyle(editorForm);
            const formHeight = editorForm.offsetHeight;
            const formMaxHeight = formStyles.maxHeight;
            const formOverflow = formStyles.overflowY;
            
            console.log('\n6. Editor Form (.editor-form in Shadow DOM):');
            console.log(`   Height: ${formHeight}px`);
            console.log(`   Max-Height: ${formMaxHeight}`);
            console.log(`   Overflow-Y: ${formOverflow}`);
            console.log(`   ✓ PASS: Has max-height constraint and overflow-y: auto` + (formMaxHeight !== 'none' && formOverflow === 'auto' ? ' ✓' : ' ✗'));
        }
    }
} else {
    console.log('\n5-6. Editor: Not loaded (select a prompt to test)');
}

// Summary
console.log('\n=== Summary ===');
console.log('Expected behavior:');
console.log('- Page container: height: 100vh, overflow: hidden');
console.log('- Sidebar: height: 100vh, overflow-y: auto (independent scroll)');
console.log('- Editor: max-height constraint, overflow-y: auto (independent scroll)');
console.log('- Body: No scroll (scrollHeight === clientHeight)');
console.log('\nIf any test fails with ✗, the double-scrolling issue is present.');
