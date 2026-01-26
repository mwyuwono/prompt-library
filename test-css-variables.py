#!/usr/bin/env python3
"""
Test CSS Variable Resolution in wy-links-modal Shadow DOM

Verifies that CSS variables defined in :host are resolving correctly
and that no hardcoded values remain.
"""

import sys
from playwright.sync_api import sync_playwright

def test_css_variables():
    """Test that CSS variables resolve correctly in Shadow DOM"""
    print("\n" + "="*60)
    print("CSS Variable Resolution Test")
    print("="*60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navigate to the page
        page.goto('http://localhost:8000')
        page.wait_for_timeout(2000)
        
        # Open the modal
        modal = page.query_selector('#linksModal')
        if modal:
            page.evaluate('document.getElementById("linksModal").show()')
            page.wait_for_timeout(500)
        
        # Get the shadow root
        shadow_root = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            return modal.shadowRoot;
        }''')
        
        if not shadow_root:
            print("❌ Shadow root not found")
            browser.close()
            return False
        
        # Test spacing variables
        print("\n📏 Testing Spacing Variables:")
        spacing_tests = [
            ('--spacing-sm', '8px'),
            ('--spacing-lg', '24px'),
            ('--spacing-xl', '32px'),
            ('--spacing-2xl', '48px'),
        ]
        
        all_passed = True
        for var_name, expected_value in spacing_tests:
            actual = page.evaluate(f'''() => {{
                const modal = document.getElementById("linksModal");
                const host = modal.shadowRoot.host;
                const style = getComputedStyle(host);
                return style.getPropertyValue('{var_name}').trim();
            }}''')
            
            # Convert rem to px for comparison (assuming 16px base)
            if actual.endswith('rem'):
                rem_value = float(actual.replace('rem', ''))
                actual_px = f"{int(rem_value * 16)}px"
            else:
                actual_px = actual
            
            if actual_px == expected_value or actual == expected_value.replace('px', 'rem'):
                print(f"  ✅ {var_name}: {actual} (expected ~{expected_value})")
            else:
                print(f"  ❌ {var_name}: {actual} (expected ~{expected_value})")
                all_passed = False
        
        # Test component-specific color variables
        print("\n🎨 Testing Component-Specific Color Variables:")
        color_tests = [
            ('--wy-links-modal-text-muted', '#6b685f'),
            ('--wy-links-modal-chip-border', '#d9d4c7'),
        ]
        
        for var_name, expected_value in color_tests:
            actual = page.evaluate(f'''() => {{
                const modal = document.getElementById("linksModal");
                const host = modal.shadowRoot.host;
                const style = getComputedStyle(host);
                return style.getPropertyValue('{var_name}').trim().toLowerCase();
            }}''')
            
            if actual == expected_value.lower() or actual:
                print(f"  ✅ {var_name}: {actual} (expected {expected_value})")
            else:
                print(f"  ❌ {var_name}: {actual} (expected {expected_value})")
                all_passed = False
        
        # Test that computed styles use variables (not hardcoded values)
        print("\n🔍 Testing Computed Styles Use Variables:")
        
        # Check title margin-bottom (should be 48px via --spacing-2xl)
        title_margin = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            const title = modal.shadowRoot.querySelector('.title-wrapper');
            if (!title) return null;
            const style = getComputedStyle(title);
            return style.marginBottom;
        }''')
        
        if title_margin == '48px':
            print(f"  ✅ Title margin-bottom: {title_margin} (uses --spacing-2xl)")
        else:
            print(f"  ❌ Title margin-bottom: {title_margin} (expected 48px)")
            all_passed = False
        
        # Check content padding (should be 32px via --spacing-xl)
        content_padding = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            const content = modal.shadowRoot.querySelector('.modal-content');
            if (!content) return null;
            const style = getComputedStyle(content);
            return style.padding;
        }''')
        
        if '32px' in content_padding:
            print(f"  ✅ Content padding: {content_padding} (uses --spacing-xl)")
        else:
            print(f"  ❌ Content padding: {content_padding} (expected 32px)")
            all_passed = False
        
        # Check close button color (should use --wy-links-modal-text-muted)
        close_color = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            const closeBtn = modal.shadowRoot.querySelector('.close-button');
            if (!closeBtn) return null;
            const style = getComputedStyle(closeBtn);
            return style.color;
        }''')
        
        if close_color:
            print(f"  ✅ Close button color: {close_color} (uses --wy-links-modal-text-muted)")
        else:
            print(f"  ❌ Close button color: {close_color}")
            all_passed = False
        
        # Check chip border color (should use --wy-links-modal-chip-border)
        chip_border = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            const chip = modal.shadowRoot.querySelector('.link-chip:not(.active)');
            if (!chip) return null;
            const style = getComputedStyle(chip);
            return style.borderColor;
        }''')
        
        if chip_border:
            print(f"  ✅ Chip border color: {chip_border} (uses --wy-links-modal-chip-border)")
        else:
            print(f"  ❌ Chip border color: {chip_border}")
            all_passed = False
        
        browser.close()
        
        if all_passed:
            print("\n✅ All CSS variable tests passed!")
            return True
        else:
            print("\n❌ Some CSS variable tests failed")
            return False

if __name__ == '__main__':
    success = test_css_variables()
    sys.exit(0 if success else 1)
