// Controls-Bar Refactor Verification Script
// Copy/paste this entire script into browser console at http://localhost:3000

(function() {
  console.clear();
  console.log('%c🎨 Controls-Bar Refactor Verification', 'font-size: 16px; font-weight: bold; color: #2C4C3B');
  console.log('%c====================================', 'color: #64748b');
  
  const controls = document.querySelector('.controls-bar');
  const promptArea = document.querySelector('.prompt-area');
  
  if (!controls) {
    console.error('❌ Controls-bar element not found');
    return;
  }
  
  if (!promptArea) {
    console.error('❌ Prompt-area element not found');
    return;
  }

  const checkState = (label) => {
    const searchInput = controls.shadowRoot.querySelector('.search-input');
    const inactiveChip = controls.shadowRoot.querySelector('wy-filter-chip:not([active])');
    const activeChip = controls.shadowRoot.querySelector('wy-filter-chip[active]');
    
    console.log(`\n%c${label}`, 'font-size: 14px; font-weight: bold; color: #2C4C3B');
    console.log('━'.repeat(50));
    
    // Search input verification
    const searchBg = getComputedStyle(searchInput).backgroundColor;
    const searchBorder = getComputedStyle(searchInput).borderWidth;
    const searchShadow = getComputedStyle(searchInput).boxShadow;
    
    console.log('\n%cSearch Input:', 'font-weight: bold');
    console.log(`  Background: ${searchBg} ${searchBg === 'rgb(255, 255, 255)' || searchBg === 'rgb(245, 242, 234)' ? '✅' : '❌'}`);
    console.log(`  Border Width: ${searchBorder}`);
    console.log(`  Box Shadow: ${searchShadow} ${searchShadow === 'none' ? '✅' : '❌'}`);
    
    // Inactive chip verification
    if (inactiveChip) {
      const chipBg = getComputedStyle(inactiveChip).backgroundColor;
      const chipBorder = getComputedStyle(inactiveChip).borderColor;
      const chipShadow = getComputedStyle(inactiveChip).boxShadow;
      
      console.log('\n%cInactive Chip:', 'font-weight: bold');
      console.log(`  Background: ${chipBg} ${chipBg === 'rgb(255, 255, 255)' || chipBg === 'rgb(245, 242, 234)' ? '✅' : '❌'}`);
      console.log(`  Border: ${chipBorder} ${chipBorder === 'rgba(0, 0, 0, 0)' || chipBorder === 'transparent' ? '✅' : '❌'}`);
      console.log(`  Box Shadow: ${chipShadow} ${chipShadow === 'none' ? '✅' : '❌'}`);
    }
    
    // Active chip verification
    if (activeChip) {
      const chipBg = getComputedStyle(activeChip).backgroundColor;
      const chipColor = getComputedStyle(activeChip).color;
      const chipShadow = getComputedStyle(activeChip).boxShadow;
      
      console.log('\n%cActive Chip:', 'font-weight: bold');
      console.log(`  Background: ${chipBg} ${chipBg === 'rgb(44, 76, 59)' ? '✅' : '❌'}`);
      console.log(`  Text Color: ${chipColor} ${chipColor === 'rgb(255, 255, 255)' ? '✅' : '❌'}`);
      console.log(`  Box Shadow: ${chipShadow} ${chipShadow === 'none' ? '✅' : '❌'}`);
    }
  };

  // Check normal state
  promptArea.scrollTo(0, 0);
  setTimeout(() => {
    checkState('NORMAL STATE (scrollTop = 0)');
    
    // Scroll and check again
    promptArea.scrollTo(0, 200);
    setTimeout(() => {
      checkState('SCROLLED STATE (scrollTop = 200)');
      
      console.log('\n%c====================================', 'color: #64748b');
      console.log('%c✅ Verification Complete', 'font-size: 14px; font-weight: bold; color: #2C4C3B');
      console.log('\nExpected Results:');
      console.log('  • All checkmarks (✅) in both states');
      console.log('  • Search input: rgb(255, 255, 255) background, none shadow');
      console.log('  • Inactive chips: rgb(255, 255, 255) background, transparent border');
      console.log('  • Active chips: rgb(44, 76, 59) background, rgb(255, 255, 255) text');
      console.log('  • Container pill shape when scrolled (visual check)');
      
    }, 600);
  }, 300);
  
})();
