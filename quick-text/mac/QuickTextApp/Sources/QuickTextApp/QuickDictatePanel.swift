import AppKit
import SwiftUI

/// Floating, non-activating pill for Quick Dictate. It never becomes key, so
/// the user's app keeps focus and the cursor stays where the text will land.
@MainActor
final class QuickDictatePanel: NSPanel {
    private static let size = NSSize(width: 460, height: 64)
    private static let bottomInset: CGFloat = 96

    init(controller: QuickDictateController) {
        super.init(
            contentRect: NSRect(origin: .zero, size: Self.size),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: true
        )
        isFloatingPanel = true
        level = .statusBar
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
        isOpaque = false
        backgroundColor = .clear
        hasShadow = false
        hidesOnDeactivate = false
        isMovableByWindowBackground = false
        becomesKeyOnlyIfNeeded = true
        let host = PillHostingView(rootView: QuickDictatePill(controller: controller))
        host.onHover = { [weak controller] in controller?.holdOpen($0) }
        host.sizingOptions = []
        host.frame = NSRect(origin: .zero, size: Self.size)
        contentView = host
    }

    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }

    func present() {
        let screen = NSScreen.screens.first { NSMouseInRect(NSEvent.mouseLocation, $0.frame, false) } ?? NSScreen.main
        if let visible = screen?.visibleFrame {
            setFrameOrigin(NSPoint(x: visible.midX - Self.size.width / 2, y: visible.minY + Self.bottomInset))
        }
        alphaValue = 0
        orderFrontRegardless()
        NSAnimationContext.runAnimationGroup { context in
            context.duration = 0.15
            animator().alphaValue = 1
        }
    }

    func dismiss() {
        NSAnimationContext.runAnimationGroup({ context in
            context.duration = 0.2
            animator().alphaValue = 0
        }, completionHandler: { [weak self] in
            Task { @MainActor in
                guard let self, self.alphaValue == 0 else { return }
                self.orderOut(nil)
            }
        })
    }
}

/// SwiftUI's `onHover` only fires while the app is active, and Quick
/// Dictate never activates. An always-on tracking area reports hover, and
/// first-mouse lets the pill's buttons respond to a single click.
final class PillHostingView: NSHostingView<QuickDictatePill> {
    var onHover: (Bool) -> Void = { _ in }
    private var hoverArea: NSTrackingArea?

    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        if let hoverArea { removeTrackingArea(hoverArea) }
        let area = NSTrackingArea(rect: .zero, options: [.mouseEnteredAndExited, .activeAlways, .inVisibleRect], owner: self)
        addTrackingArea(area)
        hoverArea = area
    }

    override func mouseEntered(with event: NSEvent) { onHover(true) }
    override func mouseExited(with event: NSEvent) { onHover(false) }
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
}

/// Pill content: matches the Dictate page's record dock (tile surface,
/// 16 pt radius, dock shadow, `rec` red while listening).
struct QuickDictatePill: View {
    @ObservedObject var controller: QuickDictateController
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        let shadows = Theme.dockShadow(scheme: scheme)
        HStack(spacing: 12) {
            content
        }
        .padding(.horizontal, 14)
        .frame(height: 48)
        .background(RoundedRectangle(cornerRadius: 16).fill(Theme.bgTile))
        .overlay(RoundedRectangle(cornerRadius: 16).strokeBorder(Theme.borderTile, lineWidth: 1))
        .shadow(color: shadows[0].color, radius: min(shadows[0].radius, 8), y: min(shadows[0].y, 4))
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .animation(Theme.Motion.fade, value: controller.phase)
    }

    @ViewBuilder
    private var content: some View {
        switch controller.phase {
        case .idle:
            EmptyView()
        case .listening(let handsFree):
            iconButton("xmark", label: "Cancel") { controller.cancel() }
            LevelBars(levels: controller.levels)
            if controller.liveText.isEmpty {
                Text(handsFree ? "Listening — tap again to finish" : "Listening — release to finish")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                Text(controller.liveText)
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                    .truncationMode(.head)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            Text(formatDuration(controller.elapsed))
                .font(.system(size: 13, weight: .medium))
                .monospacedDigit()
                .foregroundStyle(Theme.textSecondary)
            processMenu
            iconButton("checkmark", label: "Finish", tint: Theme.rec) { controller.finish() }
        case .transcribing, .processing:
            ProgressView().controlSize(.small)
            Text(controller.phase == .transcribing ? "Transcribing…" : "\(controller.processTitle)…")
                .font(.system(size: 13))
                .foregroundStyle(Theme.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)
            iconButton("xmark", label: "Cancel") { controller.cancel() }
        case .done(let outcome):
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(Theme.hl)
            Text(doneMessage(outcome))
                .font(.system(size: 13))
                .foregroundStyle(Theme.textPrimary)
                .lineLimit(1)
                .frame(maxWidth: .infinity, alignment: .leading)
            resultActions
        case .failed(let message):
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(Theme.error)
            Text(message)
                .font(.system(size: 12.5))
                .foregroundStyle(Theme.textPrimary)
                .lineLimit(2)
                .frame(maxWidth: .infinity, alignment: .leading)
            resultActions
        }
    }

    @ViewBuilder
    private var resultActions: some View {
        if controller.lastText != nil {
            iconButton("doc.on.doc", label: "Copy") { controller.copyLast() }
            iconButton("arrow.up.forward.app", label: "Open in Dictate") { controller.openInDictate() }
        }
        iconButton("xmark", label: "Dismiss") { controller.dismiss() }
    }

    private var processMenu: some View {
        Menu {
            ForEach(controller.processOptions) { option in
                Button {
                    controller.processID = option.id
                } label: {
                    if option.id == controller.processID {
                        Label(option.title, systemImage: "checkmark")
                    } else {
                        Text(option.title)
                    }
                }
            }
        } label: {
            Text(controller.processTitle)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Theme.textSecondary)
        }
        .menuStyle(.borderlessButton)
        .fixedSize()
        .help("Process As")
    }

    private func iconButton(_ symbol: String, label: String, tint: Color = Theme.textSecondary, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(tint)
        }
        .buttonStyle(IconButtonStyle(size: 28))
        .help(label)
        .accessibilityLabel(label)
    }

    private func doneMessage(_ outcome: TextInserter.Outcome) -> String {
        switch outcome {
        case .inserted: return "Inserted"
        case .copied(let reason): return reason ?? "Copied to clipboard"
        }
    }

    private func formatDuration(_ duration: TimeInterval) -> String {
        let totalSeconds = max(0, Int(duration.rounded(.down)))
        return String(format: "%d:%02d", totalSeconds / 60, totalSeconds % 60)
    }
}

/// Compact live level meter: newest sample on the right.
private struct LevelBars: View {
    let levels: [Float]
    private let count = 14

    var body: some View {
        let recent = Array(levels.suffix(count))
        let padded = Array(repeating: Float(0), count: max(0, count - recent.count)) + recent
        HStack(alignment: .center, spacing: 2) {
            ForEach(padded.indices, id: \.self) { index in
                Capsule()
                    .fill(Theme.rec)
                    .frame(width: 3, height: 4 + CGFloat(padded[index]) * 18)
            }
        }
        .frame(height: 22)
        .accessibilityHidden(true)
    }
}
