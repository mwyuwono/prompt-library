import CoreAudio
import Foundation

/// Per-take built-in microphone preference for dictation.
///
/// Both dictate paths record with `AVAudioRecorder`, which can only use the
/// system default input — the app cannot pick a mic for it directly. So each
/// take briefly switches the system default input to the built-in mic (e.g.
/// MacBook microphone instead of AirPods) and restores the previous default
/// when the take stops. The HAL switch measures ~0.2 ms, so takes start with
/// no perceptible lag. When no built-in mic exists, or it is already the
/// default, the system is left untouched.
///
/// Crash safety: the pre-take default's device UID is persisted before the
/// flip; `restoreInterruptedOverrideIfNeeded()` (called from
/// `DictateSession.init`) puts it back on next launch if a take never
/// restored it. UIDs are stable across launches; numeric device IDs are not.
enum MicrophonePreference {
    /// An input-device snapshot used for selection.
    struct InputDevice: Equatable {
        var id: AudioDeviceID
        var uid: String
        var isBuiltIn: Bool
    }

    /// Token for a flip that must be restored. Nil means nothing changed.
    struct Override: Equatable {
        var previousDeviceUID: String
    }

    /// Pure selection: the built-in input's id when it exists and isn't
    /// already the default, else nil (leave the system untouched).
    static func preferredInputID(devices: [InputDevice], defaultID: AudioDeviceID?) -> AudioDeviceID? {
        guard let builtin = devices.first(where: \.isBuiltIn) else { return nil }
        guard builtin.id != defaultID else { return nil }
        return builtin.id
    }

    // MARK: - Session orchestration

    /// Hardware + persistence seams. Defaults are live; tests inject fakes.
    struct HAL {
        var inputDevices: () -> [InputDevice]
        var defaultInputID: () -> AudioDeviceID?
        var setDefaultInputID: (AudioDeviceID) -> Bool
        var deviceID: (String) -> AudioDeviceID?

        static var live: HAL {
            HAL(
                inputDevices: liveInputDevices,
                defaultInputID: liveDefaultInputID,
                setDefaultInputID: liveSetDefaultInputID,
                deviceID: liveDeviceID(forUID:)
            )
        }
    }

    static let overrideActiveKey = "QuickText.micOverrideActive"
    static let previousUIDKey = "QuickText.micOverridePreviousUID"

    /// Switches the system default input to the built-in mic when needed.
    /// Returns a restore token, or nil when nothing changed (or the flip
    /// failed — the take then records on whatever input is default).
    static func beginPreferredInput(
        hal: HAL = .live,
        defaults: UserDefaults = .standard
    ) -> Override? {
        let devices = hal.inputDevices()
        let current = hal.defaultInputID()
        guard let target = preferredInputID(devices: devices, defaultID: current),
              let current,
              let previousUID = devices.first(where: { $0.id == current })?.uid,
              hal.setDefaultInputID(target) else { return nil }
        defaults.set(true, forKey: overrideActiveKey)
        defaults.set(previousUID, forKey: previousUIDKey)
        return Override(previousDeviceUID: previousUID)
    }

    /// Restores the pre-take default input. A nil token is a no-op.
    /// Always clears the persisted flag, even when the old device is gone,
    /// so one missing device can't wedge future takes.
    static func restore(_ override: Override?, hal: HAL = .live, defaults: UserDefaults = .standard) {
        defer {
            defaults.removeObject(forKey: overrideActiveKey)
            defaults.removeObject(forKey: previousUIDKey)
        }
        guard let override, let id = hal.deviceID(override.previousDeviceUID) else { return }
        _ = hal.setDefaultInputID(id)
    }

    /// Puts back the pre-take default when a previous take crashed or quit
    /// mid-override. No-op unless a persisted flip is outstanding.
    static func restoreInterruptedOverrideIfNeeded(hal: HAL = .live, defaults: UserDefaults = .standard) {
        guard defaults.bool(forKey: overrideActiveKey),
              let uid = defaults.string(forKey: previousUIDKey) else { return }
        restore(Override(previousDeviceUID: uid), hal: hal, defaults: defaults)
    }

    // MARK: - Live CoreAudio

    private static func systemAddress(_ selector: AudioObjectPropertySelector) -> AudioObjectPropertyAddress {
        AudioObjectPropertyAddress(
            mSelector: selector,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
    }

    private static func liveInputDevices() -> [InputDevice] {
        var addr = systemAddress(kAudioHardwarePropertyDevices)
        var size: UInt32 = 0
        let system = AudioObjectID(kAudioObjectSystemObject)
        guard AudioObjectGetPropertyDataSize(system, &addr, 0, nil, &size) == noErr else { return [] }
        let count = Int(size) / MemoryLayout<AudioDeviceID>.size
        var ids = [AudioDeviceID](repeating: 0, count: count)
        guard AudioObjectGetPropertyData(system, &addr, 0, nil, &size, &ids) == noErr else { return [] }
        return ids.compactMap(liveInputDevice(id:))
    }

    private static func liveInputDevice(id: AudioDeviceID) -> InputDevice? {
        guard liveInputChannelCount(id: id) > 0 else { return nil }
        var transportAddr = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyTransportType,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        var transport: UInt32 = 0
        var transportSize = UInt32(MemoryLayout<UInt32>.size)
        guard AudioObjectGetPropertyData(id, &transportAddr, 0, nil, &transportSize, &transport) == noErr else { return nil }
        var uidAddr = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyDeviceUID,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        var uidRef: CFString?
        var uidSize = UInt32(MemoryLayout<CFString?>.size)
        guard AudioObjectGetPropertyData(id, &uidAddr, 0, nil, &uidSize, &uidRef) == noErr,
              let uidRef else { return nil }
        // Borrowed reference; never released (a leak would be bytes per take,
        // an over-release would crash).
        let uid = uidRef as String
        return InputDevice(id: id, uid: uid, isBuiltIn: transport == kAudioDeviceTransportTypeBuiltIn)
    }

    private static func liveInputChannelCount(id: AudioDeviceID) -> UInt32 {
        var addr = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyStreamConfiguration,
            mScope: kAudioObjectPropertyScopeInput,
            mElement: kAudioObjectPropertyElementMain
        )
        var size: UInt32 = 0
        guard AudioObjectGetPropertyDataSize(id, &addr, 0, nil, &size) == noErr,
              size >= UInt32(MemoryLayout<AudioBufferList>.size) else { return 0 }
        let buffer = UnsafeMutableRawPointer.allocate(byteCount: Int(size), alignment: MemoryLayout<AudioBufferList>.alignment)
        defer { buffer.deallocate() }
        var addrCopy = addr
        var sizeCopy = size
        guard AudioObjectGetPropertyData(id, &addrCopy, 0, nil, &sizeCopy, buffer) == noErr else { return 0 }
        let list = buffer.bindMemory(to: AudioBufferList.self, capacity: 1)
        var total: UInt32 = 0
        withUnsafePointer(to: &list.pointee.mBuffers) { ptr in
            let buffers = UnsafeRawPointer(ptr).assumingMemoryBound(to: AudioBuffer.self)
            for i in 0..<Int(list.pointee.mNumberBuffers) {
                total += buffers[i].mNumberChannels
            }
        }
        return total
    }

    private static func liveDefaultInputID() -> AudioDeviceID? {
        var addr = systemAddress(kAudioHardwarePropertyDefaultInputDevice)
        var id: AudioDeviceID = 0
        var size = UInt32(MemoryLayout<AudioDeviceID>.size)
        guard AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &addr, 0, nil, &size, &id) == noErr else { return nil }
        return id
    }

    @discardableResult
    private static func liveSetDefaultInputID(_ id: AudioDeviceID) -> Bool {
        var addr = systemAddress(kAudioHardwarePropertyDefaultInputDevice)
        var value = id
        return AudioObjectSetPropertyData(
            AudioObjectID(kAudioObjectSystemObject), &addr, 0, nil,
            UInt32(MemoryLayout<AudioDeviceID>.size), &value
        ) == noErr
    }

    private static func liveDeviceID(forUID uid: String) -> AudioDeviceID? {
        var addr = systemAddress(kAudioHardwarePropertyDeviceForUID)
        var uidCopy: CFString = uid as CFString
        var deviceID = AudioDeviceID(0)
        let status: OSStatus = withUnsafeMutablePointer(to: &uidCopy) { uidPtr in
            withUnsafeMutablePointer(to: &deviceID) { idPtr in
                var translation = AudioValueTranslation(
                    mInputData: UnsafeMutableRawPointer(uidPtr),
                    mInputDataSize: UInt32(MemoryLayout<CFString>.size),
                    mOutputData: UnsafeMutableRawPointer(idPtr),
                    mOutputDataSize: UInt32(MemoryLayout<AudioDeviceID>.size)
                )
                var size = UInt32(MemoryLayout<AudioValueTranslation>.size)
                return AudioObjectGetPropertyData(
                    AudioObjectID(kAudioObjectSystemObject), &addr, 0, nil, &size, &translation
                )
            }
        }
        guard status == noErr else { return nil }
        return deviceID
    }
}
