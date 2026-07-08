import SwiftUI

/// Generic floating card used for both the Settings panel and the Variables Library
/// panel — same header/close/drag chrome, just a different title/icon and content.
struct FloatingPanel<Content: View>: View {
    var title: String = "Settings"
    var systemImage: String = "slider.horizontal.3"
    let onClose: () -> Void
    let onDragEnded: () -> Void
    @Binding var dragOffset: CGSize
    @ViewBuilder let content: Content

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                Image(systemName: systemImage)
                    .foregroundStyle(.secondary)
                Text(title)
                    .font(.headline)
                Spacer()
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .frame(width: 28, height: 28)
                }
                .buttonStyle(.plain)
                .help("Close")
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .contentShape(Rectangle())
            .gesture(
                DragGesture()
                    .onChanged { dragOffset = $0.translation }
                    .onEnded { _ in onDragEnded() }
            )

            Divider()
            content
        }
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color.primary.opacity(0.12), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.28), radius: 24, y: 12)
    }
}

/// Every control here writes straight through to `store.corpus.settings` on
/// change (via `settings`, a computed `Binding`) — there's no draft state and
/// no Save button, so text size, card size, colors, and font apply live.
struct SettingsEditor: View {
    @EnvironmentObject private var store: CorpusStore
    let width: CGFloat
    @State private var editingColorTarget: ColorEditTarget?
    @State private var didCopyPath = false

    private var usesTwoColumns: Bool { width >= 760 }
    private var primaryColumnWidth: CGFloat { usesTwoColumns ? 320 : width - 44 }
    private var colorsColumnWidth: CGFloat { usesTwoColumns ? max(width - primaryColumnWidth - 62, 300) : width - 44 }

    private var settings: Binding<Settings> {
        Binding(
            get: { store.corpus.settings },
            set: { store.saveSettings($0) }
        )
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                if usesTwoColumns {
                    HStack(alignment: .top, spacing: 18) {
                        primarySettingsColumn
                            .frame(width: primaryColumnWidth, alignment: .topLeading)

                        settingsSection("Colors") {
                            colorControls
                        }
                        .frame(width: colorsColumnWidth, alignment: .topLeading)
                    }
                } else {
                    primarySettingsColumn
                    settingsSection("Colors") {
                        colorControls
                    }
                }

                settingsSection("Categories") {
                    CategoryManagerSection()
                }
            }
            .padding(22)
        }
        .frame(width: width)
        .frame(minHeight: 420, maxHeight: 720)
    }

    private var primarySettingsColumn: some View {
        VStack(alignment: .leading, spacing: 14) {
            settingsSection("Display") {
                textSizeControl
                cardSizeControl
                Picker("Font", selection: settings.defaultFontFamily) {
                    Text("Sans").tag("sans")
                    Text("Serif").tag("serif")
                }
                .frame(maxWidth: 220, alignment: .leading)
            }

            settingsSection("Behavior") {
                Toggle("Close card automatically after copying", isOn: Binding(
                    get: { settings.wrappedValue.closeCardOnCopy ?? Settings.defaultCloseCardOnCopy },
                    set: { settings.wrappedValue.closeCardOnCopy = $0 }
                ))
                Button {
                    copyCorpusPath()
                } label: {
                    Label(didCopyPath ? "Path copied" : "Copy corpus file path", systemImage: didCopyPath ? "checkmark" : "doc.on.doc")
                }
                .buttonStyle(.glass)
                .help("Copies the path to quick-text.json, for handing off to a coding agent for bulk edits.")
            }
        }
    }

    private func settingsSection<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.headline)
            content()
        }
        .padding(14)
        .background(Color(nsColor: .windowBackgroundColor).opacity(0.24), in: RoundedRectangle(cornerRadius: 10))
    }

    private var textSizeControl: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Text size: \(settings.wrappedValue.defaultFontSize)").font(.caption).foregroundStyle(.secondary)
            Slider(
                value: Binding(
                    get: { Double(settings.wrappedValue.defaultFontSize) },
                    set: { settings.wrappedValue.defaultFontSize = Int($0.rounded()) }
                ),
                in: 14...44,
                step: 1
            )
        }
    }

    private var cardSizeControl: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Card size: \(Int(settings.wrappedValue.cardWidth ?? Settings.defaultCardWidth))").font(.caption).foregroundStyle(.secondary)
            Slider(
                value: Binding(
                    get: { settings.wrappedValue.cardWidth ?? Settings.defaultCardWidth },
                    set: { settings.wrappedValue.cardWidth = $0 }
                ),
                in: 120...320,
                step: 4
            )
        }
    }

    private var colorControls: some View {
        VStack(alignment: .leading, spacing: 8) {
            ColorSwatchField(
                title: "Default tile background",
                selection: settings.defaultTileColor,
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .background)
            )
            ColorSwatchField(
                title: "Default tile text",
                selection: settings.defaultTextColor,
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .text)
            )
            ColorSwatchField(
                title: "Highlight",
                selection: Binding(
                    get: { settings.wrappedValue.highlightColor ?? Settings.defaultHighlightColor },
                    set: { settings.wrappedValue.highlightColor = $0 }
                ),
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .highlight)
            )
            .help("Atom-chip selection, copy pulses, hover tints, the active category chip, and card/copy-badge selection highlights.")
            HStack(spacing: 8) {
                ColorSwatchField(
                    title: "Grid background",
                    selection: Binding(
                        get: { store.corpus.settings.gridBackgroundColor ?? "" },
                        set: { settings.wrappedValue.gridBackgroundColor = $0 }
                    ),
                    colors: store.palette.colors,
                    isEditing: colorEditingBinding(for: .gridBackground)
                )
                if store.corpus.settings.gridBackgroundColor != nil {
                    Button("System") {
                        settings.wrappedValue.gridBackgroundColor = nil
                    }
                    .buttonStyle(.glass)
                    .help("Use system default")
                }
            }
            ColorSwatchField(
                title: "Expanded card background",
                selection: Binding(
                    get: { settings.wrappedValue.expandedCardBackgroundColor ?? Settings.defaultExpandedCardBackgroundColor },
                    set: { settings.wrappedValue.expandedCardBackgroundColor = $0 }
                ),
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .expandedCardBackground)
            )
            ColorSwatchField(
                title: "Expanded card text",
                selection: Binding(
                    get: { settings.wrappedValue.expandedCardTextColor ?? Settings.defaultExpandedCardTextColor },
                    set: { settings.wrappedValue.expandedCardTextColor = $0 }
                ),
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .expandedCardText)
            )
            ColorSwatchField(
                title: "Expanded card chip",
                selection: Binding(
                    get: { settings.wrappedValue.expandedCardChipColor ?? Settings.defaultExpandedCardChipColor },
                    set: { settings.wrappedValue.expandedCardChipColor = $0 }
                ),
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .expandedCardChip)
            )
        }
    }

    private func colorEditingBinding(for target: ColorEditTarget) -> Binding<Bool> {
        Binding(
            get: { editingColorTarget == target },
            set: { editingColorTarget = $0 ? target : (editingColorTarget == target ? nil : editingColorTarget) }
        )
    }

    private func copyCorpusPath() {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(store.corpusPath, forType: .string)
        didCopyPath = true
        DispatchQueue.main.asyncAfter(deadline: .now() + CorpusStore.copyFeedbackDuration) {
            didCopyPath = false
        }
    }
}

/// Lists every category with inline rename/color/delete, plus an add-row.
/// Category colors are a fallback tier between a phrase's own color and the
/// global default (see `CorpusStore.color(for:)`), so editing one here
/// re-tints every card in that category that hasn't set its own color.
struct CategoryManagerSection: View {
    @EnvironmentObject private var store: CorpusStore
    @State private var newCategoryName = ""

    var body: some View {
        ForEach(store.corpus.categories.sorted { $0.sortOrder < $1.sortOrder }) { category in
            CategoryRow(category: category)
        }
        HStack(spacing: 8) {
            TextField("New category", text: $newCategoryName)
                .textFieldStyle(.plain)
                .onSubmit(addCategory)
                .frame(minWidth: 240)
            Button("Add", action: addCategory)
                .buttonStyle(.glass)
                .disabled(newCategoryName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
    }

    private func addCategory() {
        let name = newCategoryName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else { return }
        store.addCategory(name: name)
        newCategoryName = ""
    }
}

struct CategoryRow: View {
    @EnvironmentObject private var store: CorpusStore
    let category: Category
    @State private var editingColorTarget: ColorEditTarget?

    var body: some View {
        HStack(spacing: 8) {
            TextField("Name", text: nameBinding)
                .textFieldStyle(.plain)
                .frame(width: 240)
            ColorSwatchField(
                title: "BG",
                selection: colorBinding,
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .background)
            )
            .frame(width: 240)
            ColorSwatchField(
                title: "Text",
                selection: textColorBinding,
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .text)
            )
            .frame(width: 240)
            Button {
                store.deleteCategory(category.id)
            } label: {
                Image(systemName: "trash")
            }
            .buttonStyle(.glass)
            .disabled(store.corpus.categories.count <= 1)
            .help(store.corpus.categories.count <= 1 ? "At least one category is required" : "Delete category (its cards move to another category)")
        }
    }

    private var nameBinding: Binding<String> {
        Binding(
            get: { category.name },
            set: { store.renameCategory(category.id, name: $0) }
        )
    }

    private var colorBinding: Binding<String> {
        Binding(
            get: { category.color ?? store.corpus.settings.defaultTileColor },
            set: { store.updateCategoryColor(category.id, color: $0) }
        )
    }

    private var textColorBinding: Binding<String> {
        Binding(
            get: { category.textColor ?? store.corpus.settings.defaultTextColor },
            set: { store.updateCategoryTextColor(category.id, textColor: $0) }
        )
    }

    private func colorEditingBinding(for target: ColorEditTarget) -> Binding<Bool> {
        Binding(
            get: { editingColorTarget == target },
            set: { editingColorTarget = $0 ? target : (editingColorTarget == target ? nil : editingColorTarget) }
        )
    }
}

enum ColorEditTarget {
    case background
    case text
    case highlight
    case gridBackground
    case expandedCardBackground
    case expandedCardText
    case expandedCardChip
}

/// Collapsed color field: shows the current swatch, expands into a `SwatchPicker`
/// popover on click. SwiftUI popovers dismiss automatically on an outside click,
/// and only one of a pair (background/text) is ever open since callers share a
/// single `editingColorTarget` state.
struct ColorSwatchField: View {
    let title: String
    @Binding var selection: String
    let colors: [PaletteColor]
    @Binding var isEditing: Bool

    private var currentColor: PaletteColor? { colors.first { $0.id == selection } }
    private var isCustomHex: Bool { PaletteColor.isHex(selection) }

    var body: some View {
        Button {
            isEditing.toggle()
        } label: {
            HStack(spacing: 8) {
                Circle()
                    .fill(isCustomHex ? Color(hex: selection) : (currentColor.map { Color(hex: $0.hex) } ?? Color.secondary))
                    .frame(width: 18, height: 18)
                    .overlay(Circle().stroke(Color.black.opacity(0.18), lineWidth: 1))
                Text(title)
                Spacer()
                Text(isCustomHex ? selection.uppercased() : (currentColor?.name ?? "Select"))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Image(systemName: "chevron.down")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.glass)
        .popover(isPresented: $isEditing, arrowEdge: .bottom) {
            SwatchPicker(title: title, selection: $selection, colors: colors)
                .padding()
                .frame(width: 240)
        }
    }
}

struct SwatchPicker: View {
    let title: String
    @Binding var selection: String
    let colors: [PaletteColor]

    @State private var hexDraft: String = ""

    private let columns = [GridItem(.adaptive(minimum: 28), spacing: 8)]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.caption).foregroundStyle(.secondary)
            LazyVGrid(columns: columns, alignment: .leading, spacing: 8) {
                ForEach(colors) { item in
                    Button {
                        selection = item.id
                    } label: {
                        Circle()
                            .fill(Color(hex: item.hex))
                            .frame(width: 26, height: 26)
                            .overlay(
                                Circle()
                                    .stroke(selection == item.id ? Color.primary : Color.clear, lineWidth: 3)
                            )
                            .overlay(
                                Circle()
                                    .stroke(Color.black.opacity(0.18), lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                    .help(item.name)
                }
            }
            Divider()
            Text("Custom hex").font(.caption).foregroundStyle(.secondary)
            HStack(spacing: 8) {
                Circle()
                    .fill(PaletteColor.isHex(hexDraft) ? Color(hex: hexDraft) : Color.secondary.opacity(0.2))
                    .frame(width: 20, height: 20)
                    .overlay(Circle().stroke(Color.black.opacity(0.18), lineWidth: 1))
                TextField("#RRGGBB", text: $hexDraft)
                    .textFieldStyle(.plain)
                    .font(.system(.caption, design: .monospaced))
                    .onSubmit(applyHex)
                Button("Apply", action: applyHex)
                    .buttonStyle(.glass)
                    .disabled(!PaletteColor.isHex(hexDraft))
            }
            Divider()
            // Opens the system color panel — palettes, crayons, sliders, and the
            // magnifier/eyedropper — as another way in, alongside the presets above.
            ColorPicker("System color panel", selection: systemPickerBinding, supportsOpacity: false)
                .font(.caption)
        }
        .onAppear {
            if PaletteColor.isHex(selection) { hexDraft = selection }
        }
    }

    private var systemPickerBinding: Binding<Color> {
        Binding(
            get: {
                if PaletteColor.isHex(selection) { return Color(hex: selection) }
                return colors.first { $0.id == selection }.map { Color(hex: $0.hex) } ?? Color.secondary
            },
            set: { newColor in
                let hex = newColor.hexString
                selection = hex
                hexDraft = hex
            }
        )
    }

    private func applyHex() {
        guard PaletteColor.isHex(hexDraft) else { return }
        selection = hexDraft.uppercased()
    }
}

