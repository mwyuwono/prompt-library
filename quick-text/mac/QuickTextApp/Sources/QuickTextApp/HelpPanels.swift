import SwiftUI

struct KeyboardShortcutsView: View {
    let width: CGFloat

    private let sections: [ShortcutSection] = [
        ShortcutSection(
            title: "App",
            shortcuts: [
                ShortcutItem(keys: "Cmd-Shift-Space", action: "Open Quick Text"),
                ShortcutItem(keys: "Cmd-N", action: "New snippet"),
                ShortcutItem(keys: "Cmd-E", action: "Edit selected snippet"),
                ShortcutItem(keys: "Cmd-K / Cmd-F / /", action: "Focus search"),
                ShortcutItem(keys: "Cmd-C", action: "Copy selected snippet"),
                ShortcutItem(keys: "Cmd-D", action: "Dictate")
            ]
        ),
        ShortcutSection(
            title: "Library",
            shortcuts: [
                ShortcutItem(keys: "Click", action: "Open the snippet"),
                ShortcutItem(keys: "Double-click / Space", action: "Open the snippet"),
                ShortcutItem(keys: "Return", action: "Copy the selected snippet"),
                ShortcutItem(keys: "Arrow keys", action: "Move through the grid, or the sidebar when it has focus"),
                ShortcutItem(keys: "Tab / Shift-Tab", action: "Move between sidebar, search, and snippets"),
                ShortcutItem(keys: "Escape", action: "Close panels, then the open snippet, then clear search, then the selection")
            ]
        ),
        ShortcutSection(
            title: "Open Snippet",
            shortcuts: [
                ShortcutItem(keys: "Tab / Shift-Tab", action: "Next or previous field"),
                ShortcutItem(keys: "Left / Right", action: "Step through a choice field's options"),
                ShortcutItem(keys: "Return", action: "Copy the filled snippet and close"),
                ShortcutItem(keys: "Click part", action: "Copy that part (atom)"),
                ShortcutItem(keys: "Shift-click parts", action: "Select several parts and copy them in document order"),
                ShortcutItem(keys: "Escape", action: "Close")
            ]
        )
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Quick reference for keyboard and pointer actions.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                ForEach(sections) { section in
                    VStack(alignment: .leading, spacing: 10) {
                        Text(section.title)
                            .font(.headline.weight(.semibold))
                        ForEach(section.shortcuts) { shortcut in
                            HStack(alignment: .firstTextBaseline, spacing: 12) {
                                Text(shortcut.keys)
                                    .font(.caption.monospaced().weight(.semibold))
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color(nsColor: .windowBackgroundColor).opacity(0.32), in: RoundedRectangle(cornerRadius: 6))
                                    .frame(width: 140, alignment: .leading)
                                Text(shortcut.action)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .quickTextSectionSurface()
                }
            }
            .padding(18)
        }
        .frame(width: width)
        .frame(minHeight: 360, maxHeight: 620)
    }
}

struct ShortcutSection: Identifiable {
    let id = UUID()
    let title: String
    let shortcuts: [ShortcutItem]
}

struct ShortcutItem: Identifiable {
    let id = UUID()
    let keys: String
    let action: String
}

struct GlossaryView: View {
    let width: CGFloat

    private let sections: [GlossarySection] = [
        GlossarySection(
            title: "Core Objects",
            terms: [
                GlossaryTerm(name: "Phrase", definition: "A saved reusable text item. This is the canonical name for what the app stores and copies."),
                GlossaryTerm(name: "Card", definition: "The visual tile for a phrase in the main grid."),
                GlossaryTerm(name: "Expanded card", definition: "The open snippet: a sheet over the library showing the full value, with a Fill in panel when the phrase has variables. Opens on click for phrases with atoms or variables, and on Space or double-click for any phrase."),
                GlossaryTerm(name: "Value", definition: "The full stored text of a phrase. Full-card copy uses the value, with filled variables substituted."),
                GlossaryTerm(name: "Category", definition: "A group used to filter and color phrases.")
            ]
        ),
        GlossarySection(
            title: "Copy Parts",
            terms: [
                GlossaryTerm(name: "Atom", definition: "A fixed slice of a phrase value that can be copied on its own. Atoms copy literal text and do not change when variables are filled."),
                GlossaryTerm(name: "Atom chip", definition: "The clickable chip shown for an atom inside an expanded card."),
                GlossaryTerm(name: "Full copy", definition: "Copying the phrase value as a whole instead of copying one atom or chip.")
            ]
        ),
        GlossarySection(
            title: "Variables",
            terms: [
                GlossaryTerm(name: "Inline variable", definition: "A phrase-local fill-in placeholder written as {{name}}."),
                GlossaryTerm(name: "Choice variable", definition: "A phrase-local option picker written as {{option one/option two}}."),
                GlossaryTerm(name: "Library variable", definition: "A shared variable referenced from phrases with {{@name}} and managed in the Variables Library."),
                GlossaryTerm(name: "Value variable", definition: "A library variable with a fixed stored value that substitutes automatically. Use this term instead of atomic variable."),
                GlossaryTerm(name: "Variable chip", definition: "The clickable fill-in or display chip for a variable inside an expanded card."),
                GlossaryTerm(name: "Unresolved variable", definition: "A {{@name}} reference that no longer matches a library variable. It copies through as literal text until fixed.")
            ]
        ),
        GlossarySection(
            title: "Visibility",
            terms: [
                GlossaryTerm(name: "Private", definition: "Kept in the local corpus and not included in the public export."),
                GlossaryTerm(name: "Public", definition: "Included when generating the public Quick Text corpus."),
                GlossaryTerm(name: "Favorite", definition: "A phrase pinned into the Favorites tab.")
            ]
        )
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Shared terminology for Quick Text authoring and support.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                ForEach(sections) { section in
                    VStack(alignment: .leading, spacing: 10) {
                        Text(section.title)
                            .font(.headline.weight(.semibold))
                        ForEach(section.terms) { term in
                            VStack(alignment: .leading, spacing: 3) {
                                Text(term.name)
                                    .font(.subheadline.weight(.semibold))
                                Text(term.definition)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            .padding(.vertical, 2)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .quickTextSectionSurface()
                }
            }
            .padding(18)
        }
        .frame(width: width)
        .frame(minHeight: 420, maxHeight: 640)
    }
}

struct GlossarySection: Identifiable {
    let id = UUID()
    let title: String
    let terms: [GlossaryTerm]
}

struct GlossaryTerm: Identifiable {
    let id = UUID()
    let name: String
    let definition: String
}

#Preview("Phase 4 — Keyboard Shortcuts") {
    KeyboardShortcutsView(width: 640)
}

#Preview("Phase 4 — Glossary") {
    GlossaryView(width: 640)
}
