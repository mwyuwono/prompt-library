import XCTest
@testable import QuickTextApp

/// Locks down the grid/list eyebrow rule: cards show the phrase's text
/// replacement shortcut in place of the category name, as typed (never
/// uppercased), and leave the label blank when the phrase has no shortcut.
final class TileEyebrowTests: XCTestCase {

    private func makePhrase(shortcut: String?) -> Phrase {
        var phrase = Phrase(
            id: "p1",
            categoryId: "cat",
            title: "Brief",
            summary: "Direct task brief",
            value: "Act as a pragmatic local-first coding agent.",
            color: nil,
            textColor: nil,
            fontSize: nil,
            image: nil,
            favorite: false,
            visibility: .private,
            tags: [],
            createdAt: Date(),
            updatedAt: Date(),
            atoms: nil
        )
        if let shortcut {
            phrase.textReplacement = TextReplacementLink(
                shortcut: shortcut, syncEnabled: true, lastSyncedAt: nil, lastSyncedValue: nil
            )
        }
        return phrase
    }

    func testShortcutShownAsTyped() {
        XCTAssertEqual(makePhrase(shortcut: "xbrief").eyebrowShortcut, "xbrief")
    }

    func testShortcutIsNotUppercased() {
        XCTAssertNotEqual(makePhrase(shortcut: "xbrief").eyebrowShortcut, "XBRIEF")
    }

    func testMissingLinkLeavesLabelBlank() {
        XCTAssertEqual(makePhrase(shortcut: nil).eyebrowShortcut, "")
    }

    func testWhitespaceOnlyShortcutLeavesLabelBlank() {
        XCTAssertEqual(makePhrase(shortcut: "   ").eyebrowShortcut, "")
    }

    func testSurroundingWhitespaceIsTrimmed() {
        XCTAssertEqual(makePhrase(shortcut: "  xbrief\n").eyebrowShortcut, "xbrief")
    }
}
