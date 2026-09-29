import XCTest
@testable import QuickTextApp

/// Covers the redesigned library's pure logic: section building (Favorites,
/// Recently Used, everything else), keyboard movement across sections, and
/// which phrases open the card instead of copying. Uses a throwaway
/// UserDefaults suite so recents never touch the real app's defaults.
final class LibrarySectionsTests: XCTestCase {
    private var defaults: UserDefaults!
    private var suiteName: String!

    override func setUp() {
        super.setUp()
        suiteName = "QuickTextTests-\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suiteName)
        super.tearDown()
    }

    private func phrase(_ id: String, category: String = "cat", favorite: Bool = false, value: String = "text", atoms: [Atom]? = nil) -> Phrase {
        Phrase(
            id: id,
            categoryId: category,
            title: id,
            summary: nil,
            value: value,
            color: nil,
            textColor: nil,
            fontSize: nil,
            image: nil,
            favorite: favorite,
            visibility: .private,
            tags: [],
            createdAt: Date(),
            updatedAt: Date(),
            atoms: atoms
        )
    }

    private func makeStore(_ phrases: [Phrase], variables: [LibraryVariable] = []) -> CorpusStore {
        let store = CorpusStore(defaults: defaults)
        store.corpus = QuickTextCorpus(
            version: 1,
            updatedAt: Date(),
            settings: Settings(defaultFontSize: 18, defaultTileColor: "a", defaultTextColor: "b", defaultFontFamily: "sans", paletteSource: ""),
            categories: [Category(id: "cat", name: "Cat", sortOrder: 10), Category(id: "other", name: "Other", sortOrder: 20)],
            phrases: phrases,
            variables: variables
        )
        store.librarySort = .manual
        return store
    }

    func testAllViewSectionsNeverRepeatAPhrase() {
        let store = makeStore([phrase("a", favorite: true), phrase("b"), phrase("c"), phrase("d")])
        store.recordUse(of: "a", at: Date(timeIntervalSince1970: 100))
        store.recordUse(of: "c", at: Date(timeIntervalSince1970: 200))

        let sections = store.sections
        XCTAssertEqual(sections.map(\.title), ["Favorites", "Recently Used", "Everything Else"])
        XCTAssertEqual(sections.map { $0.phrases.map(\.id) }, [["a"], ["c"], ["b", "d"]])
        XCTAssertEqual(store.displayedPhrases.map(\.id), ["a", "c", "b", "d"])
    }

    func testSingleSectionHasNoTitle() {
        let store = makeStore([phrase("a"), phrase("b")])
        XCTAssertEqual(store.sections.count, 1)
        XCTAssertNil(store.sections.first?.title)
    }

    func testRecentViewSortsByRecency() {
        let store = makeStore([phrase("a"), phrase("b"), phrase("c")])
        store.recordUse(of: "a", at: Date(timeIntervalSince1970: 100))
        store.recordUse(of: "b", at: Date(timeIntervalSince1970: 300))
        store.selectTab("recent")
        XCTAssertEqual(store.displayedPhrases.map(\.id), ["b", "a"])
    }

    func testCollectionAndSearchFilters() {
        let store = makeStore([phrase("a"), phrase("b", category: "other", value: "needle"), phrase("c", category: "other")])
        store.selectTab("other")
        XCTAssertEqual(store.displayedPhrases.map(\.id), ["b", "c"])
        store.searchTerm = "NEEDLE"
        XCTAssertEqual(store.sections.map(\.title), ["Results"])
        XCTAssertEqual(store.displayedPhrases.map(\.id), ["b"])
    }

    func testVerticalMovementKeepsColumnAcrossSections() {
        // Favorites: f1 f2 f3 | f4  — Everything Else: r1 r2 r3
        let favorites = (1...4).map { phrase("f\($0)", favorite: true) }
        let rest = (1...3).map { phrase("r\($0)") }
        let store = makeStore(favorites + rest)

        store.selectedPhraseID = "f2"
        XCTAssertTrue(store.moveSelectionVertically(1, columns: 3))
        XCTAssertEqual(store.selectedPhraseID, "f4", "Short last row clamps to its final tile")
        XCTAssertTrue(store.moveSelectionVertically(1, columns: 3))
        XCTAssertEqual(store.selectedPhraseID, "r1")
        XCTAssertFalse(store.moveSelectionVertically(1, columns: 3), "Bottom row reports no move")

        store.selectedPhraseID = "r3"
        XCTAssertTrue(store.moveSelectionVertically(-1, columns: 3))
        XCTAssertEqual(store.selectedPhraseID, "f4")
        XCTAssertTrue(store.moveSelectionVertically(-1, columns: 3))
        XCTAssertEqual(store.selectedPhraseID, "f1")
        XCTAssertFalse(store.moveSelectionVertically(-1, columns: 3), "Top row reports no move")
    }

    func testOpensCardOnlyForAtomsOrFillInVariables() {
        let library = [LibraryVariable(id: "v", name: "build", type: .value, options: nil, value: "a swimmer's build")]
        let store = makeStore([], variables: library)
        XCTAssertFalse(store.opensCard(phrase("plain")))
        XCTAssertTrue(store.opensCard(phrase("inline", value: "Hi {{name}}")))
        XCTAssertTrue(store.opensCard(phrase("atoms", value: "one two", atoms: [Atom(id: "x", start: 0, end: 3, label: nil)])))
        XCTAssertFalse(store.opensCard(phrase("canned", value: "Has {{@build}}.")))
        XCTAssertFalse(store.opensCard(phrase("dangling", value: "Has {{@missing}}.")))
    }

    func testCopyRecordsLastUsedAndPersists() {
        let store = makeStore([phrase("a")])
        store.copy(store.corpus.phrases[0])
        XCTAssertNotNil(store.lastUsed["a"])

        let reloaded = CorpusStore(defaults: defaults)
        XCTAssertNotNil(reloaded.lastUsed["a"])
    }
}
