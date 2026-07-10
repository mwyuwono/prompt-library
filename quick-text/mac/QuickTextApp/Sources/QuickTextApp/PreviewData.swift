import SwiftUI

/// Sample data for #Preview canvases only. Not used at runtime.
enum PreviewData {
    static let plainPhrase = Phrase(
        id: "preview-plain",
        categoryId: "personal",
        title: "Agent Brief",
        summary: "Direct task brief",
        value: "Act as a pragmatic local-first coding agent.",
        color: "brown-13",
        textColor: "brown-22",
        fontSize: nil,
        image: nil,
        favorite: true,
        visibility: .public,
        tags: ["agent"],
        createdAt: Date(),
        updatedAt: Date(),
        atoms: nil
    )

    static let addressPhrase = Phrase(
        id: "preview-address",
        categoryId: "personal",
        title: "Home",
        summary: "Home",
        value: "20 Mechanic Square, No. 5\nMarblehead, MA 01945 ",
        color: "brown-13",
        textColor: "brown-22",
        fontSize: nil,
        image: nil,
        favorite: false,
        visibility: .localOnly,
        tags: ["address"],
        createdAt: Date(),
        updatedAt: Date(),
        atoms: [
            Atom(id: "atom-street", start: 0, end: 18, label: nil),
            Atom(id: "atom-unit", start: 20, end: 25, label: nil),
            Atom(id: "atom-city", start: 26, end: 36, label: nil),
            Atom(id: "atom-state", start: 38, end: 40, label: nil),
            Atom(id: "atom-zip", start: 41, end: 46, label: nil)
        ]
    )

    static let variablePhrase = Phrase(
        id: "preview-variable",
        categoryId: "personal",
        title: "Follow-up",
        summary: "Follow-up",
        value: "Hi {{name}}, following up on {{topic}}. Please respond by {{urgent/end of week}}.",
        color: "brown-13",
        textColor: "brown-22",
        fontSize: nil,
        image: nil,
        favorite: false,
        visibility: .localOnly,
        tags: ["email"],
        createdAt: Date(),
        updatedAt: Date(),
        atoms: nil
    )

    /// Mixes a resolved `{{@}}` text reference, a resolved `{{@}}` choice reference, and
    /// a deliberately dangling one (no matching library entry below) to preview
    /// `ExpandedCardView`'s unresolved-chip styling alongside ordinary inline placeholders.
    static let libraryVariablePhrase = Phrase(
        id: "preview-library-variable",
        categoryId: "personal",
        title: "Library Greeting",
        summary: "Library Greeting",
        value: "Hi {{@customer name}}, thanks for reaching out about {{@topic}}. Status: {{@retired field}}.",
        color: "brown-13",
        textColor: "brown-22",
        fontSize: nil,
        image: nil,
        favorite: false,
        visibility: .localOnly,
        tags: ["email"],
        createdAt: Date(),
        updatedAt: Date(),
        atoms: nil
    )

    static let longMixedPhrase = Phrase(
        id: "preview-long-mixed",
        categoryId: "personal",
        title: "Proposal Follow-up",
        summary: "Long mixed phrase",
        value: "Please send the updated proposal to {{recipient}} by {{date}}. Include the revised timeline, open questions, and next steps so the team can review everything before Friday.",
        color: "brown-13",
        textColor: "brown-22",
        fontSize: nil,
        image: nil,
        favorite: false,
        visibility: .localOnly,
        tags: ["email"],
        createdAt: Date(),
        updatedAt: Date(),
        atoms: nil
    )

    static let cannedValuePhrase = Phrase(
        id: "preview-canned-value",
        categoryId: "personal",
        title: "Body Description",
        summary: "Canned value variable",
        value: "His body is the archetype of {{@body type}}.",
        color: "brown-13",
        textColor: "brown-22",
        fontSize: nil,
        image: nil,
        favorite: false,
        visibility: .localOnly,
        tags: ["variable"],
        createdAt: Date(),
        updatedAt: Date(),
        atoms: nil
    )

    static let store: CorpusStore = {
        let store = CorpusStore()
        store.corpus = QuickTextCorpus(
            version: 1,
            updatedAt: Date(),
            settings: Settings(defaultFontSize: 18, defaultTileColor: "brown-13", defaultTextColor: "brown-22", defaultFontFamily: "sans", paletteSource: "Robert Brown Fabric Collection"),
            categories: [Category(id: "personal", name: "Personal", sortOrder: 10)],
            phrases: [plainPhrase, addressPhrase, variablePhrase, libraryVariablePhrase],
            variables: [
                LibraryVariable(id: "var-customer-name", name: "customer name", type: .text, options: nil, value: nil),
                LibraryVariable(id: "var-topic", name: "topic", type: .choice, options: ["billing", "support", "onboarding"], value: nil),
                LibraryVariable(id: "var-body-type", name: "body type", type: .value, options: nil, value: "the ideal human form")
            ]
        )
        store.palette = Palette(
            name: "Robert Brown Fabric Collection",
            source: "",
            colors: [
                PaletteColor(id: "brown-13", name: "Invisible Green 56", hex: "#2E301D"),
                PaletteColor(id: "brown-22", name: "Sand Trap Lifted Midtone", hex: "#E2D6CF")
            ]
        )
        return store
    }()
}
