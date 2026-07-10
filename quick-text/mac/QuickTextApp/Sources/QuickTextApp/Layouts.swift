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

    private struct MeasuredSubview {
        let index: Int
        let size: CGSize
        let startsNewLine: Bool
        let baseline: CGFloat
    }

    private struct Row {
        let items: [MeasuredSubview]
        let width: CGFloat
        let ascent: CGFloat
        let descent: CGFloat

        var height: CGFloat { ascent + descent }
    }

    private func measuredSubviews(for subviews: Subviews, maxWidth: CGFloat) -> [MeasuredSubview] {
        subviews.enumerated().map { index, subview in
            let natural = subview.sizeThatFits(.unspecified)
            let baselineValue = subview.dimensions(in: .unspecified)[.firstTextBaseline]
            let baseline = baselineValue.isFinite ? baselineValue : natural.height
            guard natural.width > maxWidth else {
                return MeasuredSubview(index: index, size: natural, startsNewLine: false, baseline: baseline)
            }
            let wrapped = subview.sizeThatFits(ProposedViewSize(width: maxWidth, height: nil))
            let wrappedBaselineValue = subview.dimensions(in: ProposedViewSize(width: maxWidth, height: nil))[.firstTextBaseline]
            let wrappedBaseline = wrappedBaselineValue.isFinite ? wrappedBaselineValue : wrapped.height
            return MeasuredSubview(index: index, size: wrapped, startsNewLine: true, baseline: wrappedBaseline)
        }
    }

    private func rows(for subviews: Subviews, maxWidth: CGFloat) -> [Row] {
        let measured = measuredSubviews(for: subviews, maxWidth: maxWidth)
        var rows: [Row] = []
        var current: [MeasuredSubview] = []
        var currentWidth: CGFloat = 0

        func appendCurrent() {
            guard !current.isEmpty else { return }
            let width = current.reduce(CGFloat.zero) { partial, item in
                partial + item.size.width
            } + CGFloat(max(current.count - 1, 0)) * spacing
            let ascent = current.map(\.baseline).max() ?? 0
            let descent = current.map { max($0.size.height - $0.baseline, 0) }.max() ?? 0
            rows.append(Row(items: current, width: width, ascent: ascent, descent: descent))
            current.removeAll(keepingCapacity: true)
            currentWidth = 0
        }

        for item in measured {
            let proposedWidth = current.isEmpty ? item.size.width : currentWidth + spacing + item.size.width
            if !current.isEmpty && (item.startsNewLine || proposedWidth > maxWidth) {
                appendCurrent()
            }
            current.append(item)
            currentWidth = current.count == 1 ? item.size.width : currentWidth + spacing + item.size.width
            if item.startsNewLine {
                appendCurrent()
            }
        }
        appendCurrent()
        return rows
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        let rows = rows(for: subviews, maxWidth: maxWidth)
        let width = rows.map(\.width).max() ?? 0
        let height = rows.reduce(CGFloat.zero) { $0 + $1.height }
            + CGFloat(max(rows.count - 1, 0)) * spacing
        return CGSize(width: min(width, maxWidth), height: max(height, 0))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let rows = rows(for: subviews, maxWidth: bounds.width)
        var y = bounds.minY
        for row in rows {
            var x = bounds.minX
            let baselineY = y + row.ascent
            for item in row.items {
                let subview = subviews[item.index]
                let top = baselineY - item.baseline
                subview.place(
                    at: CGPoint(x: x, y: top),
                    proposal: ProposedViewSize(item.size)
                )
                x += item.size.width + spacing
            }
            y += row.height + spacing
        }
    }
}
