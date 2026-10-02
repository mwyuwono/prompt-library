import AVFoundation
import SwiftUI

/// The three macOS permissions Quick Dictate leans on, with deep links into
/// System Settings. Grants are tied to the app's code signature, so the
/// install must be signed with a stable identity (see README).
enum QuickDictatePermission: CaseIterable, Identifiable {
    case microphone
    case accessibility
    case inputMonitoring

    var id: Self { self }

    var title: String {
        switch self {
        case .microphone: return "Microphone"
        case .accessibility: return "Accessibility"
        case .inputMonitoring: return "Input Monitoring"
        }
    }

    var purpose: String {
        switch self {
        case .microphone: return "Record your voice."
        case .accessibility: return "Insert text at the cursor in other apps."
        case .inputMonitoring: return "Hear the trigger key. Without it, use Opt-Shift-D."
        }
    }

    @MainActor var isGranted: Bool {
        switch self {
        case .microphone: return AVAudioApplication.shared.recordPermission == .granted
        case .accessibility: return TextInserter.isAccessibilityTrusted
        case .inputMonitoring: return TriggerKeyMonitor.hasInputMonitoringAccess
        }
    }

    private var settingsURL: URL? {
        let anchor: String
        switch self {
        case .microphone: anchor = "Privacy_Microphone"
        case .accessibility: anchor = "Privacy_Accessibility"
        case .inputMonitoring: anchor = "Privacy_ListenEvent"
        }
        return URL(string: "x-apple.systempreferences:com.apple.preference.security?\(anchor)")
    }

    /// Triggers the system prompt where one exists, then opens the pane.
    @MainActor func request() {
        switch self {
        case .microphone: AVAudioApplication.requestRecordPermission { _ in }
        case .accessibility: TextInserter.requestAccessibilityAccess()
        case .inputMonitoring: TriggerKeyMonitor.requestInputMonitoringAccess()
        }
        if let settingsURL { NSWorkspace.shared.open(settingsURL) }
    }
}

struct QuickDictateSettingsSection: View {
    @ObservedObject var controller: QuickDictateController
    @AppStorage(QuickDictateSettings.enabledKey) private var enabled = true
    @AppStorage(QuickDictateSettings.triggerKeyKey) private var triggerKey = QuickDictateTriggerKey.rightOption.rawValue
    @AppStorage(QuickDictateSettings.outputKey) private var output = QuickDictateOutput.insert.rawValue
    /// Bumped to re-read permission state after the user returns from System Settings.
    @State private var refreshToken = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Quick Dictate")
                    .font(.subheadline.weight(.semibold))
                Spacer()
                Toggle("Enabled", isOn: $enabled)
                    .toggleStyle(.switch)
                    .controlSize(.small)
                    .labelsHidden()
            }
            Text("Dictate into any app. Hold the trigger key to talk and release to insert, or tap it for hands-free and tap again to finish. Esc cancels. Opt-Shift-D works the same way without Input Monitoring.")
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(maxWidth: 480, alignment: .leading)

            Grid(alignment: .leading, horizontalSpacing: 16, verticalSpacing: 8) {
                GridRow {
                    Text("Trigger").font(.caption).foregroundStyle(.secondary)
                    Picker("Trigger", selection: $triggerKey) {
                        ForEach(QuickDictateTriggerKey.allCases) { key in
                            Text(key.title).tag(key.rawValue)
                        }
                    }
                    .labelsHidden()
                    .frame(maxWidth: 220)
                }
                GridRow {
                    Text("Output").font(.caption).foregroundStyle(.secondary)
                    Picker("Output", selection: $output) {
                        ForEach(QuickDictateOutput.allCases) { option in
                            Text(option.title).tag(option.rawValue)
                        }
                    }
                    .labelsHidden()
                    .frame(maxWidth: 220)
                }
                GridRow {
                    Text("Process As").font(.caption).foregroundStyle(.secondary)
                    Picker("Process As", selection: $controller.processID) {
                        ForEach(controller.processOptions) { option in
                            Text(option.title).tag(option.id)
                        }
                    }
                    .labelsHidden()
                    .frame(maxWidth: 220)
                }
            }
            .disabled(!enabled)

            VStack(alignment: .leading, spacing: 6) {
                ForEach(QuickDictatePermission.allCases) { permission in
                    permissionRow(permission)
                }
                if triggerKey == QuickDictateTriggerKey.fn.rawValue, FnKeyConflicts.systemDictationConflicts {
                    Label("macOS Dictation also responds to Fn. Set System Settings › Keyboard › Dictation › Shortcut to Off (or a non-Fn key).", systemImage: "exclamationmark.triangle")
                        .font(.caption)
                        .foregroundStyle(Theme.error)
                        .frame(maxWidth: 480, alignment: .leading)
                }
                if triggerKey == QuickDictateTriggerKey.fn.rawValue, FnKeyConflicts.globeKeyConflicts {
                    Label("Set System Settings › Keyboard › “Press 🌐 key to” to Do Nothing, or macOS will also react to each Fn press.", systemImage: "exclamationmark.triangle")
                        .font(.caption)
                        .foregroundStyle(Theme.error)
                        .frame(maxWidth: 480, alignment: .leading)
                }
            }
            .id(refreshToken)
        }
        .padding(12)
        .background(RoundedRectangle(cornerRadius: QuickTextDesign.controlRadius).fill(Color.primary.opacity(0.03)))
        .overlay(
            RoundedRectangle(cornerRadius: QuickTextDesign.controlRadius)
                .stroke(Color.primary.opacity(0.08), lineWidth: 1)
        )
        .onChange(of: enabled) { controller.refreshTriggerMonitor(); refreshToken += 1 }
        .onChange(of: triggerKey) { controller.refreshTriggerMonitor(); refreshToken += 1 }
        .onReceive(NotificationCenter.default.publisher(for: NSApplication.didBecomeActiveNotification)) { _ in
            refreshToken += 1
        }
    }

    private func permissionRow(_ permission: QuickDictatePermission) -> some View {
        let granted = permission.isGranted
        return HStack(spacing: 8) {
            Image(systemName: granted ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(granted ? Theme.hl : Theme.textTertiary)
            VStack(alignment: .leading, spacing: 1) {
                Text(permission.title).font(.caption.weight(.medium))
                Text(permission.purpose).font(.caption2).foregroundStyle(.secondary)
            }
            Spacer()
            if !granted {
                Button("Allow…") { permission.request() }
                    .buttonStyle(.glass)
                    .controlSize(.small)
            }
        }
        .frame(maxWidth: 480)
    }
}
