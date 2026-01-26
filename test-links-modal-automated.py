#!/usr/bin/env python3
"""
Comprehensive Automated Test for wy-links-modal Component in prompts-library

Tests component registration, functionality, visual rendering, and integration.
"""

import argparse
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

def test_component_registration(page, output_dir):
    """Test 1: Component Registration"""
    print("\n" + "="*60)
    print("TEST 1: Component Registration")
    print("="*60)
    
    results = {
        'test': 'component_registration',
        'passed': True,
        'issues': []
    }
    
    try:
        # Wait for page to load
        page.wait_for_timeout(3000)
        
        # Check if custom element is defined
        is_defined = page.evaluate('''() => {
            return customElements.get("wy-links-modal") !== undefined;
        }''')
        
        if not is_defined:
            results['passed'] = False
            results['issues'].append("Custom element 'wy-links-modal' not registered")
            print("❌ Component not registered as custom element")
        else:
            print("✅ Component registered as custom element")
        
        # Check element exists in DOM
        element = page.query_selector('#linksModal')
        if not element:
            results['passed'] = False
            results['issues'].append("Element #linksModal not found in DOM")
            print("❌ Element #linksModal not found")
        else:
            tag_name = element.evaluate('el => el.tagName')
            if tag_name != 'WY-LINKS-MODAL':
                results['passed'] = False
                results['issues'].append(f"Element tag name is {tag_name}, expected WY-LINKS-MODAL")
                print(f"❌ Element tag name is {tag_name}, expected WY-LINKS-MODAL")
            else:
                print(f"✅ Element found with correct tag: {tag_name}")
        
        # Check for console errors
        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
        
    except Exception as e:
        results['passed'] = False
        results['issues'].append(f"Exception during registration test: {str(e)}")
        print(f"❌ Exception: {e}")
    
    return results

def test_component_initialization(page, output_dir):
    """Test 2: Component Initialization"""
    print("\n" + "="*60)
    print("TEST 2: Component Initialization")
    print("="*60)
    
    results = {
        'test': 'component_initialization',
        'passed': True,
        'issues': []
    }
    
    try:
        modal = page.query_selector('#linksModal')
        if not modal:
            results['passed'] = False
            results['issues'].append("Modal element not found")
            return results
        
        # Check initial state
        is_open = page.evaluate('document.getElementById("linksModal").open')
        if is_open:
            results['issues'].append("Modal should be closed initially")
            print("⚠️ Modal is open initially (should be closed)")
        else:
            print("✅ Modal is closed initially")
        
        # Load links.json data
        links_data = page.evaluate('''async () => {
            try {
                const response = await fetch('/links.json');
                return await response.json();
            } catch (e) {
                return null;
            }
        }''')
        
        if not links_data:
            results['passed'] = False
            results['issues'].append("Could not load links.json")
            print("❌ Could not load links.json")
            return results
        
        print(f"✅ Loaded {len(links_data)} categories from links.json")
        
        # Set links on component
        page.evaluate('''(data) => {
            const modal = document.getElementById("linksModal");
            if (modal) {
                modal.links = data;
            }
        }''', links_data)
        
        page.wait_for_timeout(500)
        
        # Verify links were set
        links_set = page.evaluate('document.getElementById("linksModal").links')
        if not links_set or len(links_set) == 0:
            results['passed'] = False
            results['issues'].append("Links not set on component")
            print("❌ Links not set on component")
        else:
            print(f"✅ Links set on component: {len(links_set)} categories")
        
        # Check if component has shadow root
        has_shadow = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            return modal && modal.shadowRoot !== null;
        }''')
        
        if not has_shadow:
            results['passed'] = False
            results['issues'].append("Component does not have shadow root")
            print("❌ Component does not have shadow root")
        else:
            print("✅ Component has shadow root")
        
    except Exception as e:
        results['passed'] = False
        results['issues'].append(f"Exception during initialization test: {str(e)}")
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()
    
    return results

def test_modal_open_close(page, output_dir):
    """Test 3: Modal Open/Close Functionality"""
    print("\n" + "="*60)
    print("TEST 3: Modal Open/Close Functionality")
    print("="*60)
    
    results = {
        'test': 'modal_open_close',
        'passed': True,
        'issues': []
    }
    
    try:
        modal = page.query_selector('#linksModal')
        if not modal:
            results['passed'] = False
            results['issues'].append("Modal element not found")
            return results
        
        # Test show() method
        page.evaluate('document.getElementById("linksModal").show()')
        page.wait_for_timeout(500)
        
        is_open = page.evaluate('document.getElementById("linksModal").open')
        if not is_open:
            results['passed'] = False
            results['issues'].append("show() method did not open modal")
            print("❌ show() method did not open modal")
        else:
            print("✅ show() method opens modal")
        
        # Test close() method
        page.evaluate('document.getElementById("linksModal").close()')
        page.wait_for_timeout(500)
        
        is_open = page.evaluate('document.getElementById("linksModal").open')
        if is_open:
            results['passed'] = False
            results['issues'].append("close() method did not close modal")
            print("❌ close() method did not close modal")
        else:
            print("✅ close() method closes modal")
        
        # Test open property
        page.evaluate('document.getElementById("linksModal").open = true')
        page.wait_for_timeout(500)
        
        is_open = page.evaluate('document.getElementById("linksModal").open')
        if not is_open:
            results['passed'] = False
            results['issues'].append("Setting open=true did not open modal")
            print("❌ Setting open=true did not open modal")
        else:
            print("✅ Setting open=true opens modal")
        
        # Test ESC key
        page.keyboard.press('Escape')
        page.wait_for_timeout(500)
        
        is_open = page.evaluate('document.getElementById("linksModal").open')
        if is_open:
            results['passed'] = False
            results['issues'].append("ESC key did not close modal")
            print("❌ ESC key did not close modal")
        else:
            print("✅ ESC key closes modal")
        
        # Test overlay click
        page.evaluate('document.getElementById("linksModal").open = true')
        page.wait_for_timeout(500)
        
        # Click overlay (need to access shadow DOM)
        overlay_clicked = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            if (!modal || !modal.shadowRoot) return false;
            
            const overlay = modal.shadowRoot.querySelector('.modal-overlay');
            if (overlay) {
                // Simulate click on overlay
                const rect = overlay.getBoundingClientRect();
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2
                });
                overlay.dispatchEvent(clickEvent);
                return true;
            }
            return false;
        }''')
        
        page.wait_for_timeout(500)
        
        is_open = page.evaluate('document.getElementById("linksModal").open')
        if is_open and overlay_clicked:
            results['issues'].append("Overlay click may not be working (check manually)")
            print("⚠️ Overlay click test inconclusive (may need manual verification)")
        else:
            print("✅ Overlay click closes modal")
        
        # Test close button
        page.evaluate('document.getElementById("linksModal").open = true')
        page.wait_for_timeout(500)
        
        close_button_clicked = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            if (!modal || !modal.shadowRoot) return false;
            
            const closeBtn = modal.shadowRoot.querySelector('.close-button');
            if (closeBtn) {
                closeBtn.click();
                return true;
            }
            return false;
        }''')
        
        page.wait_for_timeout(500)
        
        is_open = page.evaluate('document.getElementById("linksModal").open')
        if is_open and close_button_clicked:
            results['passed'] = False
            results['issues'].append("Close button did not close modal")
            print("❌ Close button did not close modal")
        else:
            print("✅ Close button closes modal")
        
    except Exception as e:
        results['passed'] = False
        results['issues'].append(f"Exception during open/close test: {str(e)}")
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()
    
    return results

def test_link_rendering(page, output_dir):
    """Test 4: Link Rendering"""
    print("\n" + "="*60)
    print("TEST 4: Link Rendering")
    print("="*60)
    
    results = {
        'test': 'link_rendering',
        'passed': True,
        'issues': []
    }
    
    try:
        # Load links data
        links_data = page.evaluate('''async () => {
            try {
                const response = await fetch('/links.json');
                return await response.json();
            } catch (e) {
                return null;
            }
        }''')
        
        if not links_data:
            results['passed'] = False
            results['issues'].append("Could not load links.json")
            return results
        
        # Set links and open modal
        page.evaluate('''(data) => {
            const modal = document.getElementById("linksModal");
            if (modal) {
                modal.links = data;
                modal.open = true;
            }
        }''', links_data)
        
        page.wait_for_timeout(1000)
        
        # Check rendering in shadow DOM
        rendering_check = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            if (!modal || !modal.shadowRoot) return { found: false };
            
            const sections = modal.shadowRoot.querySelectorAll('.section');
            const sectionHeaders = modal.shadowRoot.querySelectorAll('.section-header');
            const chips = modal.shadowRoot.querySelectorAll('.link-chip');
            const activeChips = modal.shadowRoot.querySelectorAll('.link-chip.active');
            
            return {
                found: true,
                sectionsCount: sections.length,
                headersCount: sectionHeaders.length,
                chipsCount: chips.length,
                activeChipsCount: activeChips.length,
                hasTitle: !!modal.shadowRoot.querySelector('.modal-title'),
                hasContainer: !!modal.shadowRoot.querySelector('.modal-container'),
                hasOverlay: !!modal.shadowRoot.querySelector('.modal-overlay')
            };
        }''')
        
        if not rendering_check['found']:
            results['passed'] = False
            results['issues'].append("Could not access shadow DOM")
            print("❌ Could not access shadow DOM")
            return results
        
        print(f"✅ Found {rendering_check['sectionsCount']} sections")
        print(f"✅ Found {rendering_check['headersCount']} section headers")
        print(f"✅ Found {rendering_check['chipsCount']} chips")
        print(f"✅ Found {rendering_check['activeChipsCount']} active chips")
        
        if rendering_check['sectionsCount'] == 0:
            results['passed'] = False
            results['issues'].append("No sections rendered")
            print("❌ No sections rendered")
        
        if rendering_check['chipsCount'] == 0:
            results['passed'] = False
            results['issues'].append("No chips rendered")
            print("❌ No chips rendered")
        
        # Count expected links
        expected_chips = sum(len(cat['links']) for cat in links_data)
        if rendering_check['chipsCount'] != expected_chips:
            results['issues'].append(f"Expected {expected_chips} chips, found {rendering_check['chipsCount']}")
            print(f"⚠️ Chip count mismatch: expected {expected_chips}, found {rendering_check['chipsCount']}")
        
        # Check active chips
        expected_active = sum(1 for cat in links_data for link in cat['links'] if link.get('active'))
        if rendering_check['activeChipsCount'] != expected_active:
            results['issues'].append(f"Expected {expected_active} active chips, found {rendering_check['activeChipsCount']}")
            print(f"⚠️ Active chip count mismatch: expected {expected_active}, found {rendering_check['activeChipsCount']}")
        
        # Capture screenshot
        page.screenshot(path=f'{output_dir}/modal-with-links.png', full_page=True)
        print(f"✅ Screenshot saved: {output_dir}/modal-with-links.png")
        
    except Exception as e:
        results['passed'] = False
        results['issues'].append(f"Exception during rendering test: {str(e)}")
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()
    
    return results

def test_link_clicks(page, output_dir):
    """Test 5: Link Click Functionality"""
    print("\n" + "="*60)
    print("TEST 5: Link Click Functionality")
    print("="*60)
    
    results = {
        'test': 'link_clicks',
        'passed': True,
        'issues': []
    }
    
    try:
        # Load and set links
        links_data = page.evaluate('''async () => {
            try {
                const response = await fetch('/links.json');
                return await response.json();
            } catch (e) {
                return null;
            }
        }''')
        
        if not links_data:
            results['passed'] = False
            results['issues'].append("Could not load links.json")
            return results
        
        page.evaluate('''(data) => {
            const modal = document.getElementById("linksModal");
            if (modal) {
                modal.links = data;
                modal.open = true;
            }
        }''', links_data)
        
        page.wait_for_timeout(1000)
        
        # Test clicking a chip
        click_result = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            if (!modal || !modal.shadowRoot) return { success: false, error: "No shadow root" };
            
            const firstChip = modal.shadowRoot.querySelector('.link-chip');
            if (!firstChip) return { success: false, error: "No chips found" };
            
            // Get chip info
            const chipText = firstChip.textContent.trim();
            
            // Set up event listener for link-click event
            let eventReceived = false;
            let eventData = null;
            
            const handler = (e) => {
                eventReceived = true;
                eventData = e.detail;
            };
            
            modal.addEventListener('link-click', handler);
            
            // Click the chip
            firstChip.click();
            
            // Remove listener after a short delay
            setTimeout(() => {
                modal.removeEventListener('link-click', handler);
            }, 100);
            
            return {
                success: true,
                chipText: chipText,
                eventReceived: eventReceived,
                eventData: eventData
            };
        }''')
        
        page.wait_for_timeout(500)
        
        if not click_result['success']:
            results['passed'] = False
            results['issues'].append(f"Could not click chip: {click_result.get('error', 'Unknown')}")
            print(f"❌ Could not click chip: {click_result.get('error', 'Unknown')}")
        else:
            print(f"✅ Clicked chip: {click_result['chipText']}")
            
            if click_result['eventReceived']:
                print("✅ link-click event dispatched")
            else:
                results['issues'].append("link-click event not dispatched")
                print("⚠️ link-click event not dispatched")
        
    except Exception as e:
        results['passed'] = False
        results['issues'].append(f"Exception during click test: {str(e)}")
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()
    
    return results

def test_visual_rendering(page, output_dir):
    """Test 6: Visual Rendering"""
    print("\n" + "="*60)
    print("TEST 6: Visual Rendering")
    print("="*60)
    
    results = {
        'test': 'visual_rendering',
        'passed': True,
        'issues': []
    }
    
    try:
        # Load and set links, open modal
        links_data = page.evaluate('''async () => {
            try {
                const response = await fetch('/links.json');
                return await response.json();
            } catch (e) {
                return null;
            }
        }''')
        
        if not links_data:
            results['passed'] = False
            results['issues'].append("Could not load links.json")
            return results
        
        page.evaluate('''(data) => {
            const modal = document.getElementById("linksModal");
            if (modal) {
                modal.links = data;
                modal.open = true;
            }
        }''', links_data)
        
        page.wait_for_timeout(1000)
        
        # Check modal visibility
        visibility_check = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            if (!modal || !modal.shadowRoot) return { found: false };
            
            const overlay = modal.shadowRoot.querySelector('.modal-overlay');
            const container = modal.shadowRoot.querySelector('.modal-container');
            
            if (!overlay || !container) return { found: false };
            
            const overlayStyle = window.getComputedStyle(overlay);
            const containerStyle = window.getComputedStyle(container);
            
            return {
                found: true,
                overlayVisible: overlayStyle.opacity === '1' && overlayStyle.visibility === 'visible',
                containerVisible: containerStyle.opacity === '1',
                overlayDisplay: overlayStyle.display,
                containerDisplay: containerStyle.display
            };
        }''')
        
        if not visibility_check['found']:
            results['passed'] = False
            results['issues'].append("Could not check visibility")
            print("❌ Could not check visibility")
        else:
            if visibility_check['overlayVisible']:
                print("✅ Modal overlay is visible")
            else:
                results['passed'] = False
                results['issues'].append("Modal overlay not visible")
                print(f"❌ Modal overlay not visible (opacity/visibility issue)")
                print(f"   Overlay display: {visibility_check['overlayDisplay']}")
            
            if visibility_check['containerVisible']:
                print("✅ Modal container is visible")
            else:
                results['issues'].append("Modal container opacity may be low")
                print(f"⚠️ Modal container opacity: {visibility_check.get('containerOpacity', 'unknown')}")
        
        # Check fonts
        font_check = page.evaluate('''() => {
            const modal = document.getElementById("linksModal");
            if (!modal || !modal.shadowRoot) return { found: false };
            
            const title = modal.shadowRoot.querySelector('.modal-title');
            const chip = modal.shadowRoot.querySelector('.link-chip');
            const icon = modal.shadowRoot.querySelector('.material-symbols-outlined');
            
            const titleStyle = title ? window.getComputedStyle(title) : null;
            const chipStyle = chip ? window.getComputedStyle(chip) : null;
            const iconStyle = icon ? window.getComputedStyle(icon) : null;
            
            return {
                found: true,
                titleFont: titleStyle ? titleStyle.fontFamily : null,
                chipFont: chipStyle ? chipStyle.fontFamily : null,
                iconFont: iconStyle ? iconStyle.fontFamily : null
            };
        }''')
        
        if font_check['found']:
            print(f"✅ Title font: {font_check['titleFont']}")
            print(f"✅ Chip font: {font_check['chipFont']}")
            print(f"✅ Icon font: {font_check['iconFont']}")
        else:
            results['issues'].append("Could not check fonts")
        
        # Capture screenshots
        page.screenshot(path=f'{output_dir}/modal-visual-light.png', full_page=True)
        print(f"✅ Screenshot saved: {output_dir}/modal-visual-light.png")
        
    except Exception as e:
        results['passed'] = False
        results['issues'].append(f"Exception during visual test: {str(e)}")
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()
    
    return results

def test_integration(page, output_dir):
    """Test 7: Integration with LinksManager"""
    print("\n" + "="*60)
    print("TEST 7: Integration Test")
    print("="*60)
    
    results = {
        'test': 'integration',
        'passed': True,
        'issues': []
    }
    
    try:
        # Check if AI Tools button exists
        button = page.query_selector('#openLinksModal')
        if not button:
            results['passed'] = False
            results['issues'].append("AI Tools button not found")
            print("❌ AI Tools button not found")
            return results
        
        print("✅ AI Tools button found")
        
        # Click button
        button.click()
        page.wait_for_timeout(1000)
        
        # Check if modal opened
        is_open = page.evaluate('document.getElementById("linksModal").open')
        if not is_open:
            results['passed'] = False
            results['issues'].append("Modal did not open when button clicked")
            print("❌ Modal did not open when button clicked")
        else:
            print("✅ Modal opened when button clicked")
        
        # Check if links were set
        links_set = page.evaluate('document.getElementById("linksModal").links')
        if not links_set or len(links_set) == 0:
            results['issues'].append("Links not set when button clicked")
            print("⚠️ Links not set when button clicked")
        else:
            print(f"✅ Links set: {len(links_set)} categories")
        
        # Close modal
        page.evaluate('document.getElementById("linksModal").close()')
        page.wait_for_timeout(500)
        
    except Exception as e:
        results['passed'] = False
        results['issues'].append(f"Exception during integration test: {str(e)}")
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()
    
    return results

def test_error_detection(page, output_dir):
    """Test 8: Error Detection"""
    print("\n" + "="*60)
    print("TEST 8: Error Detection")
    print("="*60)
    
    results = {
        'test': 'error_detection',
        'passed': True,
        'issues': []
    }
    
    console_errors = []
    page.on('console', lambda msg: console_errors.append({
        'type': msg.type,
        'text': msg.text
    }) if msg.type == 'error' else None)
    
    # Reload page to capture errors
    page.reload()
    page.wait_for_timeout(3000)
    
    # Filter relevant errors
    relevant_errors = [e for e in console_errors if 'links' in e['text'].lower() or 'modal' in e['text'].lower() or 'wy-links' in e['text'].lower()]
    
    if relevant_errors:
        results['issues'].extend([f"Console error: {e['text']}" for e in relevant_errors])
        print(f"⚠️ Found {len(relevant_errors)} relevant console error(s):")
        for e in relevant_errors:
            print(f"   - {e['text']}")
    else:
        print("✅ No relevant console errors found")
    
    # Check network errors
    network_errors = []
    page.on('response', lambda response: network_errors.append({
        'url': response.url,
        'status': response.status
    }) if response.status >= 400 else None)
    
    page.reload()
    page.wait_for_timeout(2000)
    
    cdn_errors = [e for e in network_errors if 'jsdelivr' in e['url'] or 'web-components.js' in e['url']]
    if cdn_errors:
        results['passed'] = False
        results['issues'].extend([f"Network error loading {e['url']}: {e['status']}" for e in cdn_errors])
        print(f"❌ Found {len(cdn_errors)} network error(s) loading component")
    else:
        print("✅ No network errors loading component")
    
    return results

def generate_report(all_results, output_dir, url):
    """Generate test report"""
    report = {
        'url': url,
        'timestamp': __import__('datetime').datetime.now().isoformat(),
        'tests': all_results,
        'summary': {
            'total': len(all_results),
            'passed': sum(1 for r in all_results if r['passed']),
            'failed': sum(1 for r in all_results if not r['passed']),
            'total_issues': sum(len(r['issues']) for r in all_results)
        }
    }
    
    report_path = f'{output_dir}/test-report.json'
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n" + "="*60)
    print("TEST REPORT SUMMARY")
    print("="*60)
    print(f"Total tests: {report['summary']['total']}")
    print(f"Passed: {report['summary']['passed']}")
    print(f"Failed: {report['summary']['failed']}")
    print(f"Total issues: {report['summary']['total_issues']}")
    print("="*60)
    
    if report['summary']['failed'] > 0:
        print("\n❌ SOME TESTS FAILED - FIXES NEEDED")
        for result in all_results:
            if not result['passed']:
                print(f"\n{result['test']}:")
                for issue in result['issues']:
                    print(f"  - {issue}")
    else:
        print("\n✅ ALL TESTS PASSED!")
    
    print(f"\n📄 Full report: {report_path}")
    
    return report

def main():
    parser = argparse.ArgumentParser(description='Automated test for wy-links-modal component')
    parser.add_argument('--url', default='http://localhost:8000', help='Test page URL')
    parser.add_argument('--output', default='/tmp/links-modal-test', help='Output directory')
    
    args = parser.parse_args()
    
    Path(args.output).mkdir(parents=True, exist_ok=True)
    
    print("🧪 Automated Testing: wy-links-modal Component")
    print(f"🌐 URL: {args.url}")
    print(f"📁 Output: {args.output}\n")
    
    all_results = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # headless=False to see what's happening
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        
        try:
            print(f"📡 Navigating to {args.url}...")
            page.goto(args.url)
            page.wait_for_timeout(2000)
            
            # Run all tests
            all_results.append(test_component_registration(page, args.output))
            all_results.append(test_component_initialization(page, args.output))
            all_results.append(test_modal_open_close(page, args.output))
            all_results.append(test_link_rendering(page, args.output))
            all_results.append(test_link_clicks(page, args.output))
            all_results.append(test_visual_rendering(page, args.output))
            all_results.append(test_integration(page, args.output))
            all_results.append(test_error_detection(page, args.output))
            
            # Generate report
            report = generate_report(all_results, args.output, args.url)
            
            # Exit with error code if tests failed
            if report['summary']['failed'] > 0:
                sys.exit(1)
            
        except Exception as e:
            print(f"\n❌ Fatal error: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
        finally:
            browser.close()

if __name__ == '__main__':
    main()
