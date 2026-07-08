import XCTest
@testable import QuickTextApp

final class PhraseVariableTests: XCTestCase {

    // MARK: - parse

    func testParseInlinePlaceholder() {
        let variables = PhraseVariable.parse("Hello {{name}}")
        XCTAssertEqual(variables.count, 1)
        XCTAssertEqual(variables[0].key, "name")
        XCTAssertEqual(variables[0].displayLabel, "name")
        XCTAssertNil(variables[0].choices)
        XCTAssertFalse(variables[0].isLibraryReference)
    }

    func testParseChoicePlaceholder() {
        let variables = PhraseVariable.parse("{{option one/option two}}")
        XCTAssertEqual(variables.count, 1)
        XCTAssertEqual(variables[0].choices, ["option one", "option two"])
    }

    func testParseLibraryReferenceResolved() {
        let library = [LibraryVariable(id: "v1", name: "Customer Name", type: .text, options: nil, value: nil)]
        let variables = PhraseVariable.parse("Hi {{@customer name}}", library: library)
        XCTAssertEqual(variables.count, 1)
        XCTAssertFalse(variables[0].isUnresolved)
        XCTAssertEqual(variables[0].displayLabel, "Customer Name")
    }

    func testParseLibraryReferenceUnresolved() {
        let variables = PhraseVariable.parse("Hi {{@missing}}", library: [])
        XCTAssertEqual(variables.count, 1)
        XCTAssertTrue(variables[0].isUnresolved)
        XCTAssertEqual(variables[0].displayLabel, "missing")
    }

    func testParseLibraryReferenceCaseInsensitive() {
        let library = [LibraryVariable(id: "v1", name: "Topic", type: .text, options: nil, value: nil)]
        let variables = PhraseVariable.parse("{{@TOPIC}}", library: library)
        XCTAssertFalse(variables[0].isUnresolved)
    }

    func testParseWhitespaceIsTrimmed() {
        let variables = PhraseVariable.parse("{{  name  }}")
        XCTAssertEqual(variables[0].key, "name")
    }

    func testParseEmptyPlaceholderIsIgnored() {
        XCTAssertTrue(PhraseVariable.parse("{{}}").isEmpty)
        XCTAssertTrue(PhraseVariable.parse("{{   }}").isEmpty)
    }

    func testParseCannedValueLibraryReference() {
        let library = [LibraryVariable(id: "v1", name: "Signature", type: .value, options: nil, value: "Best, Matt")]
        let variables = PhraseVariable.parse("{{@signature}}", library: library)
        XCTAssertEqual(variables[0].libraryValue, "Best, Matt")
        XCTAssertTrue(variables[0].isCannedValue)
    }

    // MARK: - substitute

    func testSubstituteFillsKnownValues() {
        XCTAssertEqual(PhraseVariable.substitute("Hi {{name}}", values: ["name": "Matt"]), "Hi Matt")
    }

    func testSubstituteLeavesUnfilledPlaceholderLiteral() {
        XCTAssertEqual(PhraseVariable.substitute("Hi {{name}}", values: [:]), "Hi {{name}}")
    }

    func testSubstituteRepeatedKeySharesOneFill() {
        let result = PhraseVariable.substitute("{{name}} and {{name}} again", values: ["name": "Matt"])
        XCTAssertEqual(result, "Matt and Matt again")
    }

    func testSubstituteNormalizesLibraryReferenceKey() {
        // parse()'s key for a library reference is "@" + lowercased(name); substitute()
        // must apply the same normalization so a values dict keyed that way matches.
        let result = PhraseVariable.substitute("Hi {{@Name}}", values: ["@name": "Matt"])
        XCTAssertEqual(result, "Hi Matt")
    }

    // MARK: - renamingLibraryReferences

    func testRenamingLibraryReferencesCaseInsensitiveMatch() {
        let result = PhraseVariable.renamingLibraryReferences(in: "Hi {{@Customer Name}}", from: "customer name", to: "Client Name")
        XCTAssertEqual(result, "Hi {{@Client Name}}")
    }

    func testRenamingLibraryReferencesLeavesNonMatchingReferencesUntouched() {
        let result = PhraseVariable.renamingLibraryReferences(in: "Hi {{@topic}}", from: "customer name", to: "Client Name")
        XCTAssertEqual(result, "Hi {{@topic}}")
    }

    func testRenamingLibraryReferencesLeavesInlinePlaceholdersUntouched() {
        // Inline (non-"@") placeholders are never library references, so a rename
        // must not touch them even if the literal text matches.
        let result = PhraseVariable.renamingLibraryReferences(in: "Hi {{name}}", from: "name", to: "renamed")
        XCTAssertEqual(result, "Hi {{name}}")
    }
}
