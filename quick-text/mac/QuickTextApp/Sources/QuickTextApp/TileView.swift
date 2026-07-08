import SwiftUI

/// Shared "Copied" feedback for every copy action in the app (tiles, atom chips,
/// expanded-card copies): pops in fast, then fades out rapidly. Whole interaction
/// stays under `CorpusStore.copyFeedbackDuration` plus this animation's tail.
struct CopiedBadge: View {
    let isVisible: Bool
    var color: Color = .primary

    var body: some View {
        VStack {
            Spacer(minLength: 0)
            Text("Copied")
                .font(.system(size: 40, weight: .heavy, design: .rounded))
                .foregroundStyle(color)
                .padding(.horizontal, 26)
                .padding(.vertical, 12)
                .glassEffect(.regular, in: Capsule())
                .scaleEffect(isVisible ? 1 : 0.5)
                .opacity(isVisible ? 1 : 0)
                .animation(isVisible ? .spring(response: 0.16, dampingFraction: 0.6) : .easeOut(duration: 0.22), value: isVisible)
                .padding(.bottom, 18)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .allowsHitTesting(false)
    }
}

struct TileView: View {
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

    // Keeps the tile's proportions consistent as the card-size slider changes
    // (112/164 matches the original fixed tile dimensions).
    private var tileMinHeight: CGFloat { cardWidth * (112.0 / 164.0) }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if let imageURL {
                PhrasePreviewImage(url: imageURL)
            }
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(phrase.summary?.isEmpty == false ? phrase.summary! : phrase.title)
                    .font(tileFont)
                    .foregroundStyle(isSelected ? highlightColor.readableForeground : textColor)
                    .lineLimit(imageURL == nil ? 4 : 3)
                    .minimumScaleFactor(0.72)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
        .padding(12)
        .frame(minHeight: tileMinHeight, alignment: .topLeading)
        .background(isSelected ? highlightColor : backgroundColor)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isSelected ? highlightColor : Color.clear, lineWidth: 3)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay {
            CopiedBadge(isVisible: isCopied, color: highlightColor)
        }
    }

    private var tileFont: Font {
        if fontFamily == "serif" {
            return .custom("Palatino", size: CGFloat(fontSize)).weight(.bold)
        }
        return .system(size: CGFloat(fontSize), weight: .bold)
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

