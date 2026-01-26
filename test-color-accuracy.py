#!/usr/bin/env python3
"""
Test Color Accuracy Against Reference Design

Verifies that ALL computed colors match the Tailwind reference design exactly.
This test ensures visual fidelity by comparing actual rendered colors against
the reference design's Tailwind stone palette.
"""

import sys
from playwright.sync_api import sync_playwright

# Reference colors extracted from /Users/Matt_Weaver-Yuwono/Downloads/links-modal/code.html
# These are the exact Tailwind stone palette colors used in the design
REFERENCE_COLORS = {
    'title': (28, 25, 23),           # text-stone-900: #1C1917
    'section_header': (41, 37, 36),  # text-stone-800: #292524
    'chip_text': (68, 64, 60),       # text-stone-700: #44403C
    'close_button': (168, 162, 158), # text-stone-400: #A8A29E
    'chip_border': (217, 212, 199),  # border-accent-taupe: #D9D4C7
}

def rgb_to_tuple(rgb_string):
    """Convert 'rgb(r, g, b)' to (r, g, b) tuple"""
    values = rgb_string.replace('rgb(', '').replace(')', '').split(',')
    return tuple(int(v.strip()) for v in values)

def color_delta(color1, color2):
    """
    Calculate color difference using simple Euclidean distance in RGB space.
    
    A delta < 2.0 is considered imperceptible to the human eye.
    A delta > 5.0 is clearly visible.
    """
    return sum((a - b) ** 2 for a, b in zip(color1, color2)) ** 0.5

def test_color_accuracy():
    """
    Test that all colors in the implementation match the reference design.
    
    Returns:
        bool: True if all colors match (delta < 2.0), False otherwise
    """
    print("\n" + "="*60)
    print("COLOR ACCURACY TEST")
    print("="*60)
    print("\nComparing implementation against reference design:")
    print("Reference: /Users/Matt_Weaver-Yuwono/Downloads/links-modal/code.html")
    print("Implementation: http://localhost:8000 (wy-links-modal)\n")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:8000')
        page.wait_for_timeout(2000)
        
        # Open the modal
        page.evaluate('document.getElementById("linksModal").show()')
        page.wait_for_timeout(500)
        
        # Extract computed colors from implementation
        colors = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            const sr = modal.shadowRoot;
            const getColor = (selector, property = 'color') => {
                const el = sr.querySelector(selector);
                if (!el) return null;
                const computed = getComputedStyle(el);
                return computed.getPropertyValue(property);
            };
            
            return {
                title: getColor('.modal-title'),
                section_header: getColor('.section-header'),
                chip_text: getColor('.link-chip:not(.active)'),
                close_button: getColor('.close-button'),
                chip_border: getColor('.link-chip:not(.active)', 'border-color')
            };
        }''')
        
        browser.close()
        
        # Verify each color
        all_passed = True
        max_delta = 0.0
        
        print("Element".ljust(20) + "Actual".ljust(25) + "Expected".ljust(25) + "Delta")
        print("-" * 80)
        
        for element, expected_rgb in REFERENCE_COLORS.items():
            actual_str = colors[element]
            if not actual_str:
                print(f"❌ {element}: Element not found in DOM")
                all_passed = False
                continue
                
            actual_rgb = rgb_to_tuple(actual_str)
            delta = color_delta(actual_rgb, expected_rgb)
            max_delta = max(max_delta, delta)
            
            actual_display = f"rgb{actual_rgb}"
            expected_display = f"rgb{expected_rgb}"
            
            if delta < 2.0:  # Imperceptible difference
                print(f"✅ {element.ljust(18)} {actual_display.ljust(23)} {expected_display.ljust(23)} Δ={delta:.2f}")
            elif delta < 5.0:  # Noticeable but minor
                print(f"⚠️  {element.ljust(18)} {actual_display.ljust(23)} {expected_display.ljust(23)} Δ={delta:.2f} (minor)")
                all_passed = False
            else:  # Clearly visible difference
                print(f"❌ {element.ljust(18)} {actual_display.ljust(23)} {expected_display.ljust(23)} Δ={delta:.2f} (major)")
                all_passed = False
        
        print("-" * 80)
        
        if all_passed:
            print(f"\n✅ ALL COLORS MATCH (max Δ={max_delta:.2f})")
            print("Visual fidelity verified - implementation matches reference design.")
        else:
            print(f"\n❌ COLOR MISMATCHES DETECTED (max Δ={max_delta:.2f})")
            print("Implementation does not match reference design.")
            print("\nAcceptable delta: < 2.0 (imperceptible)")
            print("Noticeable delta: 2.0-5.0 (minor difference)")
            print("Major delta: > 5.0 (clearly visible)")
        
        return all_passed

if __name__ == '__main__':
    success = test_color_accuracy()
    sys.exit(0 if success else 1)
