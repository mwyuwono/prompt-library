import XCTest
@testable import QuickTextMobile

final class MobileLibraryTests: XCTestCase {
    private func fixture() throws -> Data {
        let bundle = Bundle(for: Self.self)
        return try Data(contentsOf: XCTUnwrap(bundle.url(forResource: "sample-library", withExtension: "json")))
    }
    func testEditingPreservesUnknownMetadataAndClearsInvalidAtoms() throws {
        var raw = try JSONSerialization.jsonObject(with: fixture()) as! [String: Any]
        raw["futureRoot"] = ["keep": true]
        var phrases = raw["phrases"] as! [[String: Any]]
        phrases[0]["futurePhrase"] = "preserve me"
        phrases[0]["atoms"] = [["id": "atom", "start": 0, "end": 2]]
        raw["phrases"] = phrases
        var document = try MobileLibraryDocument(data: JSONSerialization.data(withJSONObject: raw))
        var phrase = try document.corpus.phrases[0]
        phrase.value = "New text"
        try document.upsert(phrase)
        let output = try JSONSerialization.jsonObject(with: document.data()) as! [String: Any]
        XCTAssertNotNil(output["futureRoot"])
        let saved = (output["phrases"] as! [[String: Any]])[0]
        XCTAssertEqual(saved["futurePhrase"] as? String, "preserve me")
        XCTAssertNil(saved["atoms"])
    }
    func testFavoriteDoesNotInvalidateAtoms() throws {
        var raw = try JSONSerialization.jsonObject(with: fixture()) as! [String: Any]
        var phrases = raw["phrases"] as! [[String: Any]]
        phrases[0]["atoms"] = [["id": "atom", "start": 0, "end": 2]]
        raw["phrases"] = phrases
        var document = try MobileLibraryDocument(data: JSONSerialization.data(withJSONObject: raw))
        try document.toggleFavorite("mobile-welcome")
        XCTAssertEqual(try document.corpus.phrases[0].atoms?.count, 1)
        XCTAssertFalse(try document.corpus.phrases[0].favorite)
    }
    func testRejectsDuplicateIDsAndFutureSchema() throws {
        var raw = try JSONSerialization.jsonObject(with: fixture()) as! [String: Any]
        let phrases = raw["phrases"] as! [[String: Any]]
        raw["phrases"] = [phrases[0], phrases[0]]
        XCTAssertThrowsError(try MobileLibraryDocument(data: JSONSerialization.data(withJSONObject: raw)))
        raw["phrases"] = phrases; raw["version"] = 2
        XCTAssertThrowsError(try MobileLibraryDocument(data: JSONSerialization.data(withJSONObject: raw)))
    }
    func testUnicodeAndRepeatedVariableResolution() {
        let value = "🎨 {{name}} — {{@Voice}} / {{@voice}} / {{missing}}"
        let library = [LibraryVariable(id: "v", name: "voice", type: .value, options: nil, value: "plain")]
        let variables = PhraseVariable.parse(value, library: library)
        var fills = ["name": "Matt"]
        for variable in variables { if let fixed = variable.libraryValue { fills[variable.key] = fixed } }
        XCTAssertEqual(PhraseVariable.substitute(value, values: fills), "🎨 Matt — plain / plain / {{missing}}")
    }
    @MainActor func testCorruptOnDeviceLibraryIsNotOverwritten() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }
        let file = root.appendingPathComponent("quick-text.json")
        let broken = Data("broken original".utf8)
        try broken.write(to: file)
        let store = MobileLibrary(directory: root)
        XCTAssertFalse(store.writable)
        store.save(try MobileLibraryDocument(data: fixture()).corpus.phrases[0])
        XCTAssertEqual(try Data(contentsOf: file), broken)
    }
    @MainActor func testImportBacksUpPreviousLibraryAndPersistsEdits() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }
        let original = try fixture()
        try original.write(to: root.appendingPathComponent("quick-text.json"))
        let store = MobileLibrary(directory: root)
        try store.importLibrary(MobileLibraryDocument(data: original))
        let backups = try FileManager.default.contentsOfDirectory(at: root, includingPropertiesForKeys: nil).filter { $0.lastPathComponent.hasPrefix("library-backup-") }
        XCTAssertEqual(backups.count, 1)
        XCTAssertEqual(try Data(contentsOf: backups[0]), original)
        store.toggleFavorite("mobile-welcome")
        XCTAssertFalse(MobileLibrary(directory: root).corpus.phrases[0].favorite)
    }
}
