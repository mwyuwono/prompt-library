import XCTest
@testable import QuickTextApp

final class LineSegmentTests: XCTestCase {

    private func offsets(of needle: String, in value: String) -> (start: Int, end: Int) {
        guard let range = value.range(of: needle) else {
            XCTFail("\"\(needle)\" not found in \"\(value)\"")
            return (0, 0)
        }
        let start = value.distance(from: value.startIndex, to: range.lowerBound)
        let end = value.distance(from: value.startIndex, to: range.upperBound)
        return (start, end)
    }

    func testAtomAndVariableChipsMergeInDocumentOrder() {
        let value = "Hello {{name}}, visit 20 Main St today."
        let (start, end) = offsets(of: "20 Main St", in: value)
        let atom = Atom(id: "atom-1", start: start, end: end, label: nil)
        let variables = PhraseVariable.parse(value)

        let flat = LineSegment.lines(value: value, atoms: [atom], variables: variables).flatMap { $0 }

        let atomIndex = flat.firstIndex { $0.atom != nil }
        let variableIndex = flat.firstIndex { $0.variable != nil }
        XCTAssertNotNil(atomIndex)
        XCTAssertNotNil(variableIndex)
        XCTAssertLessThan(variableIndex!, atomIndex!, "the {{name}} chip appears before the atom chip in the source text")
    }

    func testOverlappingVariableIsDroppedInFavorOfAtom() {
        // Atom exactly covers the same range as the variable placeholder — atoms are
        // user-curated so they must win; the variable segment should be dropped
        // rather than double-rendered.
        let value = "{{name}}"
        let atom = Atom(id: "atom-1", start: 0, end: value.count, label: nil)
        let variables = PhraseVariable.parse(value)

        let flat = LineSegment.lines(value: value, atoms: [atom], variables: variables).flatMap { $0 }

        XCTAssertEqual(flat.count, 1)
        XCTAssertNotNil(flat[0].atom)
        XCTAssertNil(flat[0].variable)
    }

    func testNonOverlappingAtomAndVariableBothRender() {
        let value = "20 Main St, {{city}}"
        let (start, end) = offsets(of: "20 Main St", in: value)
        let atom = Atom(id: "atom-1", start: start, end: end, label: nil)
        let variables = PhraseVariable.parse(value)

        let flat = LineSegment.lines(value: value, atoms: [atom], variables: variables).flatMap { $0 }

        XCTAssertTrue(flat.contains { $0.atom != nil })
        XCTAssertTrue(flat.contains { $0.variable != nil })
    }

    func testNewlineSplitsIntoSeparateLines() {
        let lines = LineSegment.lines(value: "Line one\nLine two", atoms: [], variables: [])
        XCTAssertEqual(lines.count, 2)
    }

    func testPlainTextRemainsAContiguousRun() {
        let lines = LineSegment.lines(value: "one two three", atoms: [], variables: [])
        XCTAssertEqual(lines.count, 1)
        XCTAssertEqual(lines[0].map(\.text), ["one two three"])
    }

    func testPlainTextAroundChipPreservesPunctuationAndWhitespace() {
        let value = "Send to {{name}}, please."
        let lines = LineSegment.lines(value: value, atoms: [], variables: PhraseVariable.parse(value))

        XCTAssertEqual(lines[0].map(\.text), ["Send to ", "{{name}}", ", please."])
    }
}
