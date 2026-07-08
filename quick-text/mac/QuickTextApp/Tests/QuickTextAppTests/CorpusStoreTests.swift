import XCTest
import AppKit
@testable import QuickTextApp

/// Covers the pure-logic pieces of `CorpusStore` that don't require touching disk:
/// atom-slice copy math (document-order join, out-of-bounds guarding) and
/// `resolvedCopyText(for:)`'s value-variable substitution. These tests never call
/// `load()`/`writeCorpus()`, so they can't clobber the real corpus file.
final class CorpusStoreTests: XCTestCase {

    private func makePhrase(value: String, atoms: [Atom]? = nil) -> Phrase {
        Phrase(
            id: "p1",
            categoryId: "cat",
            title: "Test",
            summary: nil,
            value: value,
            color: nil,
            textColor: nil,
            fontSize: nil,
            image: nil,
            favorite: false,
            visibility: .private,
            tags: [],
            createdAt: Date(),
            updatedAt: Date(),
            atoms: atoms
        )
    }

    private func offsets(of needle: String, in value: String) -> (start: Int, end: Int) {
        guard let range = value.range(of: needle) else {
            XCTFail("\"\(needle)\" not found in \"\(value)\"")
            return (0, 0)
        }
        let start = value.distance(from: value.startIndex, to: range.lowerBound)
        let end = value.distance(from: value.startIndex, to: range.upperBound)
        return (start, end)
    }

    // MARK: - copyAtom / copyAtomSelection

    func testCopyAtomCopiesExactSlice() {
        let store = CorpusStore()
        let value = "20 Mechanic Square, Marblehead, MA 01945"
        let (start, end) = offsets(of: "Marblehead", in: value)
        let atom = Atom(id: "atom-1", start: start, end: end, label: nil)
        let phrase = makePhrase(value: value, atoms: [atom])

        store.copyAtom(atom, in: phrase)

        XCTAssertEqual(NSPasteboard.general.string(forType: .string), "Marblehead")
    }

    func testCopyAtomSelectionJoinsInDocumentOrderRegardlessOfClickOrder() {
        let store = CorpusStore()
        let value = "one two three"
        func atom(for word: String, id: String) -> Atom {
            let (start, end) = offsets(of: word, in: value)
            return Atom(id: id, start: start, end: end, label: nil)
        }
        let atomOne = atom(for: "one", id: "a1")
        let atomThree = atom(for: "three", id: "a3")
        let phrase = makePhrase(value: value, atoms: [atomOne, atomThree])

        // Passed in reverse (click) order — output must still be document order.
        store.copyAtomSelection([atomThree, atomOne], in: phrase)

        XCTAssertEqual(NSPasteboard.general.string(forType: .string), "one three")
    }

    func testCopyAtomIgnoresOutOfBoundsRangeRatherThanCrashing() {
        let store = CorpusStore()
        let value = "short"
        let badAtom = Atom(id: "bad", start: 0, end: 999, label: nil)
        let phrase = makePhrase(value: value, atoms: [badAtom])

        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString("sentinel", forType: .string)
        store.copyAtom(badAtom, in: phrase)

        XCTAssertEqual(NSPasteboard.general.string(forType: .string), "sentinel", "an invalid atom range must no-op, not copy garbage")
    }

    // MARK: - resolvedCopyText(for:)

    func testResolvedCopyTextSubstitutesCannedValueVariables() {
        let store = CorpusStore()
        store.corpus.variables = [LibraryVariable(id: "v1", name: "signature", type: .value, options: nil, value: "Best, Matt")]
        let phrase = makePhrase(value: "Thanks, {{@signature}}")

        XCTAssertEqual(store.resolvedCopyText(for: phrase), "Thanks, Best, Matt")
    }

    func testResolvedCopyTextLeavesInlinePlaceholdersLiteral() {
        let store = CorpusStore()
        let phrase = makePhrase(value: "Hi {{name}}")

        XCTAssertEqual(store.resolvedCopyText(for: phrase), "Hi {{name}}")
    }

    func testResolvedCopyTextLeavesUnresolvedLibraryReferenceLiteral() {
        let store = CorpusStore()
        let phrase = makePhrase(value: "Status: {{@retired field}}")

        XCTAssertEqual(store.resolvedCopyText(for: phrase), "Status: {{@retired field}}")
    }
}
