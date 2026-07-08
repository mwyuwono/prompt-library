import XCTest
import SwiftUI
@testable import QuickTextApp

final class PaletteColorTests: XCTestCase {
    func testIsHexAcceptsValidHex() {
        XCTAssertTrue(PaletteColor.isHex("#AABBCC"))
        XCTAssertTrue(PaletteColor.isHex("#000000"))
        XCTAssertTrue(PaletteColor.isHex("#e2725b"))
    }

    func testIsHexRejectsInvalidValues() {
        XCTAssertFalse(PaletteColor.isHex("AABBCC"), "missing #")
        XCTAssertFalse(PaletteColor.isHex("#AABBC"), "too short")
        XCTAssertFalse(PaletteColor.isHex("#AABBCG"), "invalid hex digit")
        XCTAssertFalse(PaletteColor.isHex("brown-13"), "a palette swatch id, not a hex literal")
        XCTAssertFalse(PaletteColor.isHex(""))
    }
}

final class ColorHexRoundTripTests: XCTestCase {
    func testHexRoundTrips() {
        XCTAssertEqual(Color(hex: "#E2725B").hexString, "#E2725B")
        XCTAssertEqual(Color(hex: "#000000").hexString, "#000000")
        XCTAssertEqual(Color(hex: "#FFFFFF").hexString, "#FFFFFF")
    }
}
