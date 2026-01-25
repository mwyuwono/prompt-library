#!/usr/bin/env python3
"""
Capture screenshots of a web page in light and dark mode.
Outputs PNG screenshots and a JSON report with element visibility data.

Usage:
    python3 capture.py --url http://localhost:8000 --output /tmp/visual-qa
    python3 capture.py --url http://localhost:8000 --output /tmp/visual-qa --quick
"""

import argparse
import json
import os
from playwright.sync_api import sync_playwright


def capture_screenshot(page, output_path, color_scheme):
    """Capture a full-page screenshot with the given color scheme."""
    # Emulate color scheme
    page.emulate_media(color_scheme=color_scheme)

    # Wait for any transitions to complete
    page.wait_for_timeout(500)

    # Capture screenshot
    screenshot_path = os.path.join(output_path, f"{color_scheme}.png")
    page.screenshot(path=screenshot_path, full_page=True)
    print(f"Captured {color_scheme} mode: {screenshot_path}")
    return screenshot_path


def collect_element_data(page):
    """Collect visibility data for key UI elements."""
    return page.evaluate("""
        () => {
            const elements = [];

            // Common selectors to check
            const selectors = [
                'input[type="search"]',
                '.search-input',
                '.search-icon',
                '.view-toggle',
                '.view-btn',
                'button',
                '[class*="icon"]',
                '[class*="toggle"]',
                'nav a',
                '.header',
                '.controls-bar',
                'wy-controls-bar',
                'wy-filter-chip'
            ];

            for (const selector of selectors) {
                const els = document.querySelectorAll(selector);
                els.forEach((el, index) => {
                    const rect = el.getBoundingClientRect();
                    const styles = window.getComputedStyle(el);

                    // Check Shadow DOM
                    let shadowHost = null;
                    let parent = el.parentElement;
                    while (parent) {
                        if (parent.shadowRoot) {
                            shadowHost = parent.tagName.toLowerCase();
                            break;
                        }
                        parent = parent.parentElement;
                    }

                    elements.push({
                        selector: selector + (els.length > 1 ? `[${index}]` : ''),
                        tagName: el.tagName.toLowerCase(),
                        className: el.className,
                        id: el.id || null,
                        visible: rect.width > 0 && rect.height > 0,
                        dimensions: {
                            width: rect.width,
                            height: rect.height,
                            top: rect.top,
                            left: rect.left
                        },
                        styles: {
                            color: styles.color,
                            backgroundColor: styles.backgroundColor,
                            opacity: styles.opacity,
                            visibility: styles.visibility,
                            display: styles.display
                        },
                        inShadowDOM: shadowHost,
                        textContent: el.textContent?.substring(0, 50) || null
                    });
                });
            }

            return elements;
        }
    """)


def check_custom_elements(page):
    """Check if custom elements are properly defined."""
    return page.evaluate("""
        () => {
            const customElements = [
                'wy-controls-bar',
                'wy-filter-chip',
                'wy-modal',
                'wy-prompt-modal'
            ];

            return customElements.map(name => ({
                name,
                defined: customElements.get(name) !== undefined,
                instances: document.querySelectorAll(name).length
            }));
        }
    """)


def main():
    parser = argparse.ArgumentParser(description='Capture screenshots for visual QA')
    parser.add_argument('--url', required=True, help='URL to capture')
    parser.add_argument('--output', required=True, help='Output directory')
    parser.add_argument('--quick', action='store_true', help='Quick mode: dark only, no metadata')
    parser.add_argument('--viewport-width', type=int, default=1440, help='Viewport width')
    parser.add_argument('--viewport-height', type=int, default=900, help='Viewport height')
    args = parser.parse_args()

    # Create output directory
    os.makedirs(args.output, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={'width': args.viewport_width, 'height': args.viewport_height}
        )
        page = context.new_page()

        # Navigate and wait for load
        print(f"Loading {args.url}...")
        page.goto(args.url)
        page.wait_for_load_state('networkidle')

        if args.quick:
            # Quick mode: dark only
            capture_screenshot(page, args.output, 'dark')
        else:
            # Full mode: both color schemes + metadata
            capture_screenshot(page, args.output, 'light')
            capture_screenshot(page, args.output, 'dark')

            # Collect element data in dark mode (where issues are most common)
            page.emulate_media(color_scheme='dark')
            page.wait_for_timeout(300)

            report = {
                'url': args.url,
                'viewport': {'width': args.viewport_width, 'height': args.viewport_height},
                'elements': collect_element_data(page),
                'customElements': check_custom_elements(page)
            }

            report_path = os.path.join(args.output, 'report.json')
            with open(report_path, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"Report saved: {report_path}")

        browser.close()

    print("Done!")


if __name__ == '__main__':
    main()
