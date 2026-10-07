import AppKit
import SwiftUI

/// Floating, non-activating pill for Quick Dictate. It never becomes key, so
/// the user's app keeps focus and the cursor stays where the text will land.
/// The window is larger than the card (see `bleed`); only the card itself
/// takes the mouse, so the transparent margin never blocks the menu bar or Dock.
@MainActor
final class QuickDictatePanel: NSPanel {
    private weak var controller: QuickDictateController?
    /// Card frame in the content view, top-left origin, as SwiftUI reports it.
    private var cardRect: CGRect = .zero
    private var isHoveringCard = false
    private var mouseMonitors: [Any] = []

    /// Gap between the card edge and the usable screen edge (below the menu
    /// bar, above the Dock).
    private static let edgeInset: CGFloat = 12
    /// Transparent margin around the card so the glow and shadow are never
    /// clipped by the window edge. Must exceed blur radius + shadow offset.
    static let bleed: CGFloat = 48

    /// Window = card at its largest + bleed on every side. Regular fits four
    /// transcript lines.
    private static func size(for style: QuickDictateHUDStyle) -> NSSize {
        switch style {
        case .regular: return NSSize(width: 440 + bleed * 2, height: 176 + bleed * 2)
        case .compact: return NSSize(width: 360 + bleed * 2, height: 48 + bleed * 2)
        }
    }

    init(controller: QuickDictateController) {
        let size = Self.size(for: QuickDictateSettings.hudStyle)
        super.init(
            contentRect: NSRect(origin: .zero, size: size),
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
        ignoresMouseEvents = true
        self.controller = controller
        let host = PillHostingView(rootView: QuickDictateHUD(controller: controller) { [weak self] rect in
            self?.cardRect = rect
            self?.updateMouseTarget()
        })
        host.sizingOptions = []
        host.frame = NSRect(origin: .zero, size: size)
        contentView = host
    }

    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }

    /// The bleed deliberately overhangs the screen edge; don't let AppKit
    /// push the window back on screen and shift the card off its inset.
    override func constrainFrameRect(_ frameRect: NSRect, to screen: NSScreen?) -> NSRect { frameRect }

    private var cardScreenRect: NSRect {
        NSRect(x: frame.minX + cardRect.minX, y: frame.maxY - cardRect.maxY, width: cardRect.width, height: cardRect.height)
    }

    /// Takes the mouse only while it is over the card, and drives hover-to-hold
    /// from the same check.
    private func updateMouseTarget() {
        guard isVisible else { return }
        let inside = !cardRect.isEmpty && cardScreenRect.contains(NSEvent.mouseLocation)
        ignoresMouseEvents = !inside
        if inside != isHoveringCard {
            isHoveringCard = inside
            controller?.holdOpen(inside)
        }
    }

    private func startMouseTracking() {
        guard mouseMonitors.isEmpty else { return }
        let mask: NSEvent.EventTypeMask = [.mouseMoved, .leftMouseDragged]
        if let global = NSEvent.addGlobalMonitorForEvents(matching: mask, handler: { [weak self] _ in
            MainActor.assumeIsolated { self?.updateMouseTarget() }
        }) {
            mouseMonitors.append(global)
        }
        if let local = NSEvent.addLocalMonitorForEvents(matching: mask, handler: { [weak self] event in
            self?.updateMouseTarget()
            return event
        }) {
            mouseMonitors.append(local)
        }
    }

    private func stopMouseTracking() {
        mouseMonitors.forEach(NSEvent.removeMonitor)
        mouseMonitors.removeAll()
        isHoveringCard = false
        ignoresMouseEvents = true
    }

    func present() {
        let size = Self.size(for: QuickDictateSettings.hudStyle)
        setContentSize(size)
        let screen = NSScreen.screens.first { NSMouseInRect(NSEvent.mouseLocation, $0.frame, false) } ?? NSScreen.main
        if let visible = screen?.visibleFrame {
            setFrameOrigin(QuickDictateSettings.hudPosition.origin(windowSize: size, in: visible, edgeInset: Self.edgeInset, bleed: Self.bleed))
        }
        alphaValue = 0
        orderFrontRegardless()
        startMouseTracking()
        updateMouseTarget()
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
                self.stopMouseTracking()
            }
        })
    }
}

/// First-mouse lets the pill's buttons respond to a single click, since
/// Quick Dictate never activates. Hover is tracked by the panel against the
/// card frame, because SwiftUI's `onHover` only fires while the app is active.
final class PillHostingView: NSHostingView<QuickDictateHUD> {
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
}

/// HUD content. Two styles share one set of states: the regular card shows a
/// multi-line live transcript, the compact pill keeps a single line. Both sit
/// on a system material with an animated gradient edge while active.
struct QuickDictateHUD: View {
    @ObservedObject var controller: QuickDictateController
    /// Reports the card's frame so the panel can pass clicks through the bleed.
    var onCardFrame: (CGRect) -> Void = { _ in }
    @AppStorage(QuickDictateSettings.hudStyleKey) private var styleRaw = QuickDictateHUDStyle.regular.rawValue
    @AppStorage(QuickDictateSettings.hudPositionKey) private var positionRaw = QuickDictateHUDPosition.topCenter.rawValue

    var body: some View {
        let style = QuickDictateHUDStyle(rawValue: styleRaw) ?? .regular
        let position = QuickDictateHUDPosition(rawValue: positionRaw) ?? .topCenter
        Group {
            if style == .compact {
                QuickDictateCompactPill(controller: controller)
            } else {
                QuickDictateCard(controller: controller)
            }
        }
        .onGeometryChange(for: CGRect.self) { $0.frame(in: .global) } action: { onCardFrame($0) }
        // The card hugs the screen edge it sits on and grows away from it.
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: position.isTop ? .top : .bottom)
        .padding(QuickDictatePanel.bleed)
        .animation(Theme.Motion.fade, value: controller.phase)
    }
}

private enum HUDGlow {
    static let colors: [Color] = [
        Color(red: 1.00, green: 0.27, blue: 0.23), Color(red: 1.00, green: 0.62, blue: 0.04),
        Color(red: 1.00, green: 0.22, blue: 0.37), Color(red: 0.75, green: 0.35, blue: 0.95),
        Color(red: 1.00, green: 0.62, blue: 0.04), Color(red: 1.00, green: 0.27, blue: 0.23)
    ]
    static let doneColors: [Color] = [
        Color(red: 0.19, green: 0.82, blue: 0.35), Color(red: 0.39, green: 0.82, blue: 1.0),
        Color(red: 0.19, green: 0.82, blue: 0.35)
    ]
}

/// Material surface with a rotating gradient edge and soft outer glow.
/// Rotation stops under Reduce Motion; it slows once listening has ended.
private struct HUDSurface<S: InsettableShape>: ViewModifier {
    let shape: S
    let phase: QuickDictateController.Phase
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var mode: (colors: [Color], period: Double, strength: Double) {
        switch phase {
        case .listening: return (HUDGlow.colors, 6, 1)
        case .transcribing, .processing: return (HUDGlow.colors, 14, 0.5)
        case .done: return (HUDGlow.doneColors, 6, 0.5)
        case .idle, .failed: return (HUDGlow.colors, 6, 0)
        }
    }

    func body(content: Content) -> some View {
        let mode = mode
        content
            .background(shape.fill(.regularMaterial))
            .background {
                TimelineView(.animation(paused: reduceMotion)) { timeline in
                    let t = timeline.date.timeIntervalSinceReferenceDate
                    let angle = reduceMotion ? 0 : (t / mode.period).truncatingRemainder(dividingBy: 1) * 360
                    let gradient = AngularGradient(colors: mode.colors, center: .center, angle: .degrees(angle))
                    ZStack {
                        shape.stroke(gradient, lineWidth: 5).blur(radius: 8).opacity(0.7 * mode.strength)
                        shape.stroke(gradient, lineWidth: 1.5).opacity(mode.strength)
                    }
                }
            }
            .overlay(shape.strokeBorder(Color.primary.opacity(0.12), lineWidth: 0.5))
            .shadow(color: .black.opacity(0.28), radius: 14, y: 6)
    }
}

/// Shared state content, parameterised by layout.
@MainActor
private struct HUDParts {
    let controller: QuickDictateController

    var phase: QuickDictateController.Phase { controller.phase }

    func button(_ symbol: String, label: String, tint: Color = Theme.textSecondary, prominent: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(prominent ? Theme.onRec : tint)
                .frame(width: 26, height: 26)
                .background(Circle().fill(prominent ? Theme.rec : Color.primary.opacity(0.07)))
                .contentShape(Circle())
        }
        .buttonStyle(.plain)
        .help(label)
        .accessibilityLabel(label)
    }

    var gearMenu: some View {
        Menu {
            Section("Process as") {
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
            }
        } label: {
            Image(systemName: "gearshape")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Theme.textSecondary)
                .frame(width: 26, height: 26)
                .background(Circle().fill(Color.primary.opacity(0.07)))
        }
        .menuStyle(.button)
        .buttonStyle(.plain)
        .menuIndicator(.hidden)
        .fixedSize()
        .help("Process as: \(controller.processTitle)")
        .accessibilityLabel("Process as")
    }

    @ViewBuilder
    var resultActions: some View {
        if controller.lastText != nil {
            button("doc.on.doc", label: "Copy") { controller.copyLast() }
            button("arrow.up.forward.app", label: "Open in Dictate") { controller.openInDictate() }
        }
        button("xmark", label: "Dismiss") { controller.dismiss() }
    }

    func doneMessage(_ outcome: TextInserter.Outcome) -> String {
        switch outcome {
        case .inserted: return "Inserted"
        case .copied(let reason): return reason ?? "Copied to clipboard"
        }
    }

    func formatDuration(_ duration: TimeInterval) -> String {
        let totalSeconds = max(0, Int(duration.rounded(.down)))
        return String(format: "%d:%02d", totalSeconds / 60, totalSeconds % 60)
    }
}

/// Regular style: header row, up to four lines of live transcript, key hint.
private struct QuickDictateCard: View {
    @ObservedObject var controller: QuickDictateController
    private let lineHeight: CGFloat = 21

    var body: some View {
        let parts = HUDParts(controller: controller)
        VStack(alignment: .leading, spacing: 8) {
            switch controller.phase {
            case .idle:
                EmptyView()
            case .listening(let handsFree):
                HStack(spacing: 10) {
                    if handsFree { parts.button("xmark", label: "Cancel") { controller.cancel() } }
                    LevelBars(levels: controller.levels)
                    Text("Listening").font(.system(size: 13, weight: .semibold))
                    Spacer(minLength: 8)
                    Text(parts.formatDuration(controller.elapsed))
                        .font(.system(size: 12.5, weight: .medium)).monospacedDigit()
                        .foregroundStyle(Theme.textSecondary)
                    parts.gearMenu
                    if handsFree { parts.button("checkmark", label: "Finish", prominent: true) { controller.finish() } }
                }
                transcript(controller.liveText, placeholder: "Start speaking…")
                Divider().opacity(0.5)
                Text(handsFree ? "Tap the trigger key again to finish · Esc cancels" : "Release the trigger key to finish · Esc cancels")
                    .font(.system(size: 11.5))
                    .foregroundStyle(Theme.textSecondary)
            case .transcribing, .processing:
                HStack(spacing: 10) {
                    ProgressView().controlSize(.small)
                    Text(controller.phase == .transcribing ? "Transcribing…" : "\(controller.processTitle)…")
                        .font(.system(size: 13, weight: .semibold))
                    Spacer(minLength: 8)
                    parts.button("xmark", label: "Cancel") { controller.cancel() }
                }
                if !controller.liveText.isEmpty { transcript(controller.liveText, placeholder: "", lines: 2) }
            case .done(let outcome):
                HStack(spacing: 10) {
                    Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                    Text(parts.doneMessage(outcome))
                        .font(.system(size: 13, weight: .semibold)).lineLimit(1)
                    Spacer(minLength: 8)
                    parts.resultActions
                }
                if let text = controller.lastText, !text.isEmpty {
                    Text(text).font(.system(size: 14)).foregroundStyle(Theme.textSecondary).lineLimit(2)
                }
            case .failed(let message):
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(Theme.error)
                    Text(message).font(.system(size: 12.5)).lineLimit(3)
                    Spacer(minLength: 8)
                    parts.resultActions
                }
            }
        }
        .padding(EdgeInsets(top: 14, leading: 16, bottom: 12, trailing: 16))
        .frame(width: 440)
        .modifier(HUDSurface(shape: RoundedRectangle(cornerRadius: 22, style: .continuous), phase: controller.phase))
    }

    /// Newest words stay visible: the text is bottom-aligned in a fixed-max
    /// window and older lines fade out at the top.
    private func transcript(_ text: String, placeholder: String, lines: Int = 4) -> some View {
        let empty = text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        return Text(empty ? placeholder : text)
            .font(.system(size: 15))
            .lineSpacing(3)
            .foregroundStyle(empty ? Theme.textSecondary : Theme.textPrimary)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, maxHeight: lineHeight * CGFloat(lines), alignment: .bottomLeading)
            .clipped()
            .mask(LinearGradient(stops: [.init(color: .clear, location: 0), .init(color: .black, location: 0.28)], startPoint: .top, endPoint: .bottom))
    }
}

/// Compact style: one capsule, one line of live text.
private struct QuickDictateCompactPill: View {
    @ObservedObject var controller: QuickDictateController

    var body: some View {
        let parts = HUDParts(controller: controller)
        HStack(spacing: 10) {
            switch controller.phase {
            case .idle:
                EmptyView()
            case .listening(let handsFree):
                if handsFree { parts.button("xmark", label: "Cancel") { controller.cancel() } }
                LevelBars(levels: controller.levels)
                Text(controller.liveText.isEmpty ? (handsFree ? "Listening — tap again to finish" : "Listening") : controller.liveText)
                    .font(.system(size: 13))
                    .foregroundStyle(controller.liveText.isEmpty ? Theme.textSecondary : Theme.textPrimary)
                    .lineLimit(1)
                    .truncationMode(.head)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text(parts.formatDuration(controller.elapsed))
                    .font(.system(size: 12.5, weight: .medium)).monospacedDigit()
                    .foregroundStyle(Theme.textSecondary)
                parts.gearMenu
                if handsFree { parts.button("checkmark", label: "Finish", prominent: true) { controller.finish() } }
            case .transcribing, .processing:
                ProgressView().controlSize(.small)
                Text(controller.phase == .transcribing ? "Transcribing…" : "\(controller.processTitle)…")
                    .font(.system(size: 13)).foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                parts.button("xmark", label: "Cancel") { controller.cancel() }
            case .done(let outcome):
                Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                Text(parts.doneMessage(outcome)).font(.system(size: 13, weight: .medium)).lineLimit(1)
                    .frame(maxWidth: .infinity, alignment: .leading)
                parts.resultActions
            case .failed(let message):
                Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(Theme.error)
                Text(message).font(.system(size: 12.5)).lineLimit(2)
                    .frame(maxWidth: .infinity, alignment: .leading)
                parts.resultActions
            }
        }
        .padding(.horizontal, 14)
        .frame(width: 360, height: 48)
        .modifier(HUDSurface(shape: Capsule(style: .continuous), phase: controller.phase))
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
