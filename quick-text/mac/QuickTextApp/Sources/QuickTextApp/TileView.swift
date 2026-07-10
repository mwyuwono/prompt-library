import SwiftUI

/// Shared "Copied" feedback for every copy action in the app (tiles, atom chips,
/// expanded-card copies): pops in fast, then fades out rapidly. Whole interaction
/// stays under `CorpusStore.copyFeedbackDuration` plus this animation's tail.
struct CopiedBadge: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let isVisible: Bool
    var color: Color = .primary

    var body: some View {
        VStack {
            Spacer(minLength: 0)
            Text("Copied")
                .font(.system(size: 15, weight: .semibold, design: .rounded))
                .foregroundStyle(color)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .glassEffect(.regular, in: Capsule())
                .scaleEffect(isVisible || reduceMotion ? 1 : 0.96)
                .offset(y: isVisible || reduceMotion ? 0 : 4)
                .opacity(isVisible ? 1 : 0)
                .shadow(color: .black.opacity(isVisible ? 0.16 : 0), radius: 12, y: 5)
                .animation(reduceMotion ? nil : (isVisible ? QuickTextMotion.micro : QuickTextMotion.standard), value: isVisible)
                .padding(.bottom, 18)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .allowsHitTesting(false)
    }
}

struct TileView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let phrase: Phrase
    let imageURL: URL?
    let backgroundColor: Color
    let textColor: Color
    let fontSize: Int
    let fontFamily: String
    var cardWidth: CGFloat = Settings.defaultCardWidth
    let isSelected: Bool
    let isCopied: Bool
    var highlightColor: Color = Color(hex: Settings.defaultHighlightColor)
    @State private var isHovering = false

    // Keeps the tile's proportions consistent as the card-size slider changes
    // (112/164 matches the original fixed tile dimensions).
    private var tileMinHeight: CGFloat { cardWidth * (112.0 / 164.0) }
    private var typography: CardTypography { CardTypography(baseSize: CGFloat(fontSize), family: fontFamily) }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if let imageURL {
                PhrasePreviewImage(url: imageURL)
            }
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(phrase.summary?.isEmpty == false ? phrase.summary! : phrase.title)
                    .font(typography.tileFont)
                    .foregroundStyle(isSelected ? highlightColor.readableForeground : textColor)
                    .lineLimit(imageURL == nil ? 4 : 3)
                    .minimumScaleFactor(0.62)
                    .lineSpacing(CGFloat(fontSize) * 0.12)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
        .padding(14)
        .frame(minHeight: tileMinHeight, alignment: .topLeading)
        .background(isSelected ? highlightColor : (isHovering ? backgroundColor.opacity(0.86) : backgroundColor))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isSelected ? highlightColor : (isHovering ? textColor.opacity(0.28) : Color.clear), lineWidth: isSelected ? 3 : 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay {
            CopiedBadge(isVisible: isCopied, color: highlightColor)
        }
        .contentShape(RoundedRectangle(cornerRadius: 8))
        .onHover { isHovering = $0 }
        .scaleEffect(isHovering && !isSelected && !reduceMotion ? 1.008 : 1)
        .animation(reduceMotion ? nil : QuickTextMotion.micro, value: isHovering)
        .animation(reduceMotion ? nil : QuickTextMotion.standard, value: isSelected)
    }
}

struct PhrasePreviewImage: View {
    let url: URL

    var body: some View {
        Group {
            if url.isFileURL, let image = NSImage(contentsOf: url) {
                Image(nsImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().scaledToFill()
                    case .failure:
                        previewFallback(systemName: "photo.badge.exclamationmark")
                    case .empty:
                        previewFallback(systemName: "photo")
                    @unknown default:
                        previewFallback(systemName: "photo")
                    }
                }
            }
        }
        .aspectRatio(16.0 / 9.0, contentMode: .fit)
        .frame(maxWidth: .infinity)
        .clipShape(RoundedRectangle(cornerRadius: 6))
        .overlay(
            RoundedRectangle(cornerRadius: 6)
                .stroke(Color.black.opacity(0.16), lineWidth: 1)
        )
    }

    private func previewFallback(systemName: String) -> some View {
        ZStack {
            Color.black.opacity(0.14)
            Image(systemName: systemName)
                .font(.title3)
                .foregroundStyle(.secondary)
        }
    }
}

#Preview("Tile - Plain") {
    TileView(
        phrase: PreviewData.plainPhrase,
        imageURL: nil,
        backgroundColor: Color(hex: "#2E301D"),
        textColor: Color(hex: "#E2D6CF"),
        fontSize: 18,
        fontFamily: "sans",
        isSelected: false,
        isCopied: false
    )
    .frame(width: 200, height: 112)
    .padding()
}

#Preview("Tile - Atomic") {
    TileView(
        phrase: PreviewData.addressPhrase,
        imageURL: nil,
        backgroundColor: Color(hex: "#2E301D"),
        textColor: Color(hex: "#E2D6CF"),
        fontSize: 18,
        fontFamily: "sans",
        isSelected: false,
        isCopied: false
    )
    .frame(width: 200, height: 112)
    .padding()
}

#Preview("Phase 3 — Tile Matrix") {
    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
        TileView(phrase: PreviewData.plainPhrase, imageURL: nil, backgroundColor: Color(hex: "#2E301D"), textColor: Color(hex: "#E2D6CF"), fontSize: 14, fontFamily: "serif", cardWidth: 164, isSelected: false, isCopied: false)
        TileView(phrase: PreviewData.plainPhrase, imageURL: nil, backgroundColor: Color(hex: "#2E301D"), textColor: Color(hex: "#E2D6CF"), fontSize: 22, fontFamily: "sans", cardWidth: 260, isSelected: true, isCopied: false)
        TileView(phrase: PreviewData.addressPhrase, imageURL: nil, backgroundColor: Color(hex: "#2E301D"), textColor: Color(hex: "#E2D6CF"), fontSize: 14, fontFamily: "sans", cardWidth: 164, isSelected: false, isCopied: true)
        TileView(phrase: PreviewData.longMixedPhrase, imageURL: nil, backgroundColor: Color(hex: "#E2D6CF"), textColor: Color(hex: "#2E301D"), fontSize: 22, fontFamily: "serif", cardWidth: 260, isSelected: false, isCopied: false)
    }
    .padding(24)
    .frame(width: 600)
}
