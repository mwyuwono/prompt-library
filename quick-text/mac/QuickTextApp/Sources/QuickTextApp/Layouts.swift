import SwiftUI

struct MasonryGrid: Layout {
    let columnWidth: CGFloat
    let spacing: CGFloat

    private struct ItemPlacement {
        let size: CGSize
        let origin: CGPoint
    }

    private func layout(in width: CGFloat, subviews: Subviews) -> (placements: [ItemPlacement], size: CGSize) {
        let availableWidth = max(width, columnWidth)
        let columnCount = max(Int((availableWidth + spacing) / (columnWidth + spacing)), 1)
        let actualColumnWidth = (availableWidth - (CGFloat(columnCount - 1) * spacing)) / CGFloat(columnCount)
        var columnHeights = Array(repeating: CGFloat.zero, count: columnCount)
        var placements: [ItemPlacement] = []

        for subview in subviews {
            let size = subview.sizeThatFits(ProposedViewSize(width: actualColumnWidth, height: nil))
            let columnIndex = columnHeights.enumerated().min { $0.element < $1.element }?.offset ?? 0
            let origin = CGPoint(
                x: CGFloat(columnIndex) * (actualColumnWidth + spacing),
                y: columnHeights[columnIndex]
            )
            placements.append(ItemPlacement(size: CGSize(width: actualColumnWidth, height: size.height), origin: origin))
            columnHeights[columnIndex] += size.height + spacing
        }

        let height = max((columnHeights.max() ?? 0) - spacing, 0)
        return (placements, CGSize(width: availableWidth, height: height))
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        layout(in: proposal.width ?? columnWidth, subviews: subviews).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let placements = layout(in: bounds.width, subviews: subviews).placements
        for (placement, subview) in zip(placements, subviews) {
            subview.place(
                at: CGPoint(x: bounds.minX + placement.origin.x, y: bounds.minY + placement.origin.y),
                proposal: ProposedViewSize(width: placement.size.width, height: placement.size.height)
            )
        }
    }
}

/// Minimal left-to-right wrapping layout for a run of text/chip views.
struct FlowLayout: Layout {
    var spacing: CGFloat = 4

    /// A subview whose natural single-line width fits the container flows inline
    /// like any other token (short atom chips, words). One whose natural width
    /// would overflow — a long atom chip — is measured at the container's width
    /// instead (so it reports its true wrapped height) and always starts on its
    /// own line, so its wrapped block doesn't sit half-inline with neighbors.
    private struct Item {
        let size: CGSize
        let startsNewLine: Bool
    }

    private func items(for subviews: Subviews, maxWidth: CGFloat) -> [Item] {
        subviews.map { subview in
            let natural = subview.sizeThatFits(.unspecified)
            guard natural.width > maxWidth else { return Item(size: natural, startsNewLine: false) }
            let wrapped = subview.sizeThatFits(ProposedViewSize(width: maxWidth, height: nil))
            return Item(size: wrapped, startsNewLine: true)
        }
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var width: CGFloat = 0
        var height: CGFloat = 0
        var lineWidth: CGFloat = 0
        var lineHeight: CGFloat = 0
        for item in items(for: subviews, maxWidth: maxWidth) {
            if lineWidth > 0, item.startsNewLine || lineWidth + item.size.width > maxWidth {
                width = max(width, lineWidth)
                height += lineHeight + spacing
                lineWidth = 0
                lineHeight = 0
            }
            lineWidth += item.size.width + spacing
            lineHeight = max(lineHeight, item.size.height)
            if item.startsNewLine {
                width = max(width, lineWidth)
                height += lineHeight + spacing
                lineWidth = 0
                lineHeight = 0
            }
        }
        width = max(width, lineWidth)
        height += lineHeight
        return CGSize(width: min(width, maxWidth), height: max(height, 0))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var lineHeight: CGFloat = 0
        for (subview, item) in zip(subviews, items(for: subviews, maxWidth: bounds.width)) {
            if x > bounds.minX, item.startsNewLine || x + item.size.width > bounds.maxX {
                x = bounds.minX
                y += lineHeight + spacing
                lineHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(item.size))
            x += item.size.width + spacing
            lineHeight = max(lineHeight, item.size.height)
            if item.startsNewLine {
                x = bounds.minX
                y += lineHeight + spacing
                lineHeight = 0
            }
        }
    }
}

