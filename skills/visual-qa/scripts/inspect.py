#!/usr/bin/env python3
"""
Inspect a specific element's computed styles and CSS custom properties.
Useful for debugging why an element has incorrect styling.

Usage:
    python3 inspect.py --url http://localhost:8000 --selector ".search-input"
    python3 inspect.py --url http://localhost:8000 --selector ".search-input" --color-scheme dark
    python3 inspect.py --url http://localhost:8000 --selector "wy-controls-bar" --shadow-selector ".search-input"
"""

import argparse
import json
from playwright.sync_api import sync_playwright


def inspect_element(page, selector, shadow_selector=None):
    """Get detailed style information for an element."""
    return page.evaluate("""
        ({selector, shadowSelector}) => {
            let el = document.querySelector(selector);
            if (!el) {
                return { error: `Element not found: ${selector}` };
            }

            // If shadow selector provided, look inside shadow DOM
            if (shadowSelector && el.shadowRoot) {
                el = el.shadowRoot.querySelector(shadowSelector);
                if (!el) {
                    return { error: `Shadow element not found: ${shadowSelector}` };
                }
            }

            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);

            // Get all CSS custom properties used
            const customProps = {};
            const cssText = el.getAttribute('style') || '';

            // Common custom properties to check
            const propsToCheck = [
                '--md-sys-color-primary',
                '--md-sys-color-on-primary',
                '--md-sys-color-background',
                '--md-sys-color-on-background',
                '--md-sys-color-surface',
                '--md-sys-color-on-surface',
                '--md-sys-color-surface-variant',
                '--md-sys-color-on-surface-variant',
                '--md-sys-color-surface-container',
                '--md-sys-color-surface-container-low',
                '--md-sys-color-surface-container-high',
                '--md-sys-color-outline',
                '--md-sys-color-outline-variant',
                '--wy-controls-search-bg',
                '--wy-controls-toggle-bg',
                '--wy-filter-chip-active-bg',
                '--wy-filter-chip-active-fg',
                '--color-text-primary',
                '--color-text-secondary',
                '--color-border-subtle'
            ];

            for (const prop of propsToCheck) {
                const value = styles.getPropertyValue(prop);
                if (value) {
                    customProps[prop] = value.trim();
                }
            }

            // Check if element is in shadow DOM
            let shadowHost = null;
            let parent = el.getRootNode();
            if (parent instanceof ShadowRoot) {
                shadowHost = parent.host.tagName.toLowerCase();
            }

            return {
                selector: selector + (shadowSelector ? ` >> ${shadowSelector}` : ''),
                tagName: el.tagName.toLowerCase(),
                className: el.className?.toString() || '',
                id: el.id || null,
                boundingBox: {
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    visible: rect.width > 0 && rect.height > 0
                },
                computedStyles: {
                    color: styles.color,
                    backgroundColor: styles.backgroundColor,
                    borderColor: styles.borderColor,
                    opacity: styles.opacity,
                    visibility: styles.visibility,
                    display: styles.display,
                    fontSize: styles.fontSize,
                    fontFamily: styles.fontFamily,
                    padding: styles.padding,
                    margin: styles.margin
                },
                customProperties: customProps,
                inShadowDOM: shadowHost,
                inlineStyle: cssText || null
            };
        }
    """, {'selector': selector, 'shadowSelector': shadow_selector})


def get_contrast_ratio(page, selector, shadow_selector=None):
    """Calculate approximate contrast ratio for text elements."""
    return page.evaluate("""
        ({selector, shadowSelector}) => {
            let el = document.querySelector(selector);
            if (!el) return { error: 'Element not found' };

            if (shadowSelector && el.shadowRoot) {
                el = el.shadowRoot.querySelector(shadowSelector);
                if (!el) return { error: 'Shadow element not found' };
            }

            const styles = window.getComputedStyle(el);

            // Parse RGB values
            const parseColor = (str) => {
                const match = str.match(/rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)/);
                if (match) {
                    return { r: parseFloat(match[1]), g: parseFloat(match[2]), b: parseFloat(match[3]) };
                }
                return null;
            };

            // Calculate relative luminance
            const luminance = (rgb) => {
                const sRGB = [rgb.r, rgb.g, rgb.b].map(v => {
                    v /= 255;
                    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
                });
                return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
            };

            const fgColor = parseColor(styles.color);
            const bgColor = parseColor(styles.backgroundColor);

            if (!fgColor || !bgColor) {
                return { error: 'Could not parse colors', color: styles.color, backgroundColor: styles.backgroundColor };
            }

            const fgLum = luminance(fgColor);
            const bgLum = luminance(bgColor);

            const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);

            return {
                foreground: styles.color,
                background: styles.backgroundColor,
                contrastRatio: Math.round(ratio * 100) / 100,
                passesAA: ratio >= 4.5,
                passesAAA: ratio >= 7,
                passesAALarge: ratio >= 3
            };
        }
    """, {'selector': selector, 'shadowSelector': shadow_selector})


def main():
    parser = argparse.ArgumentParser(description='Inspect element styles for visual QA')
    parser.add_argument('--url', required=True, help='URL to inspect')
    parser.add_argument('--selector', required=True, help='CSS selector for element')
    parser.add_argument('--shadow-selector', help='Selector within shadow DOM')
    parser.add_argument('--color-scheme', choices=['light', 'dark'], default='dark', help='Color scheme to emulate')
    parser.add_argument('--contrast', action='store_true', help='Also calculate contrast ratio')
    args = parser.parse_args()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        print(f"Loading {args.url}...")
        page.goto(args.url)
        page.wait_for_load_state('networkidle')

        # Set color scheme
        page.emulate_media(color_scheme=args.color_scheme)
        page.wait_for_timeout(300)

        print(f"\nInspecting: {args.selector}" + (f" >> {args.shadow_selector}" if args.shadow_selector else ""))
        print(f"Color scheme: {args.color_scheme}\n")

        # Inspect element
        result = inspect_element(page, args.selector, args.shadow_selector)
        print(json.dumps(result, indent=2))

        # Optionally calculate contrast
        if args.contrast:
            print("\n--- Contrast Analysis ---")
            contrast = get_contrast_ratio(page, args.selector, args.shadow_selector)
            print(json.dumps(contrast, indent=2))

        browser.close()


if __name__ == '__main__':
    main()
