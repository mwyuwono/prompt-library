import CoreAudio
import XCTest
@testable import QuickTextApp

/// Covers the per-take built-in mic preference: pick the built-in input over
/// Bluetooth, flip the system default for the take, restore the previous
/// input after, and recover when a take never restored. Hardware is faked;
/// only the decision + bookkeeping logic runs here.
final class MicrophonePreferenceTests: XCTestCase {

    private final class FakeHAL {
        var devices: [MicrophonePreference.InputDevice]
        var defaultID: AudioDeviceID?
        var setCalls: [AudioDeviceID] = []
        var setSucceeds = true

        init(devices: [MicrophonePreference.InputDevice], defaultID: AudioDeviceID?) {
            self.devices = devices
            self.defaultID = defaultID
        }

        var hal: MicrophonePreference.HAL {
            MicrophonePreference.HAL(
                inputDevices: { [self] in devices },
                defaultInputID: { [self] in defaultID },
                setDefaultInputID: { [self] in
                    setCalls.append($0)
                    if setSucceeds { defaultID = $0 }
                    return setSucceeds
                },
                deviceID: { [self] uid in devices.first(where: { $0.uid == uid })?.id }
            )
        }
    }

    private var airpods: MicrophonePreference.InputDevice {
        MicrophonePreference.InputDevice(id: 106, uid: "airpods-uid", isBuiltIn: false)
    }

    private var builtin: MicrophonePreference.InputDevice {
        MicrophonePreference.InputDevice(id: 78, uid: "builtin-uid", isBuiltIn: true)
    }

    private func makeDefaults() -> UserDefaults {
        UserDefaults(suiteName: "MicrophonePreferenceTests.\(UUID().uuidString)")!
    }

    // MARK: - Selection

    func testPrefersBuiltInOverBluetoothDefault() {
        XCTAssertEqual(
            MicrophonePreference.preferredInputID(devices: [airpods, builtin], defaultID: 106),
            78
        )
    }

    func testLeavesSystemUntouchedWithoutBuiltIn() {
        XCTAssertNil(MicrophonePreference.preferredInputID(devices: [airpods], defaultID: 106))
    }

    func testLeavesSystemUntouchedWhenBuiltInAlreadyDefault() {
        XCTAssertNil(MicrophonePreference.preferredInputID(devices: [airpods, builtin], defaultID: 78))
    }

    // MARK: - Begin / restore

    func testBeginFlipsToBuiltInAndPersistsPriorInput() {
        let fake = FakeHAL(devices: [airpods, builtin], defaultID: 106)
        let defaults = makeDefaults()
        let override = MicrophonePreference.beginPreferredInput(hal: fake.hal, defaults: defaults)
        XCTAssertEqual(override, MicrophonePreference.Override(previousDeviceUID: "airpods-uid"))
        XCTAssertEqual(fake.setCalls, [78])
        XCTAssertTrue(defaults.bool(forKey: MicrophonePreference.overrideActiveKey))
        XCTAssertEqual(defaults.string(forKey: MicrophonePreference.previousUIDKey), "airpods-uid")
    }

    func testBeginIsNoOpWhenAlreadyOnBuiltIn() {
        let fake = FakeHAL(devices: [airpods, builtin], defaultID: 78)
        let defaults = makeDefaults()
        XCTAssertNil(MicrophonePreference.beginPreferredInput(hal: fake.hal, defaults: defaults))
        XCTAssertTrue(fake.setCalls.isEmpty)
        XCTAssertFalse(defaults.bool(forKey: MicrophonePreference.overrideActiveKey))
    }

    func testBeginLeavesNoTraceWhenFlipFails() {
        let fake = FakeHAL(devices: [airpods, builtin], defaultID: 106)
        fake.setSucceeds = false
        let defaults = makeDefaults()
        XCTAssertNil(MicrophonePreference.beginPreferredInput(hal: fake.hal, defaults: defaults))
        XCTAssertFalse(defaults.bool(forKey: MicrophonePreference.overrideActiveKey))
    }

    func testRestorePutsBackPriorInputAndClearsFlag() {
        let fake = FakeHAL(devices: [airpods, builtin], defaultID: 106)
        let defaults = makeDefaults()
        let override = MicrophonePreference.beginPreferredInput(hal: fake.hal, defaults: defaults)
        MicrophonePreference.restore(override, hal: fake.hal, defaults: defaults)
        XCTAssertEqual(fake.setCalls, [78, 106])
        XCTAssertFalse(defaults.bool(forKey: MicrophonePreference.overrideActiveKey))
        XCTAssertNil(defaults.string(forKey: MicrophonePreference.previousUIDKey))
    }

    func testRestoreClearsFlagEvenWhenPriorDeviceIsGone() {
        let fake = FakeHAL(devices: [airpods, builtin], defaultID: 106)
        let defaults = makeDefaults()
        let override = MicrophonePreference.beginPreferredInput(hal: fake.hal, defaults: defaults)
        fake.devices = [builtin] // AirPods unplugged mid-take.
        MicrophonePreference.restore(override, hal: fake.hal, defaults: defaults)
        XCTAssertEqual(fake.setCalls, [78]) // No second flip to a ghost device.
        XCTAssertFalse(defaults.bool(forKey: MicrophonePreference.overrideActiveKey))
    }

    func testRestoreNilIsAHardwareNoOp() {
        let fake = FakeHAL(devices: [airpods, builtin], defaultID: 106)
        MicrophonePreference.restore(nil, hal: fake.hal, defaults: makeDefaults())
        XCTAssertTrue(fake.setCalls.isEmpty)
    }

    // MARK: - Interrupted recovery

    func testInterruptedOverrideRestoresOnNextLaunch() {
        let fake = FakeHAL(devices: [airpods, builtin], defaultID: 78) // Left flipped by a crash.
        let defaults = makeDefaults()
        defaults.set(true, forKey: MicrophonePreference.overrideActiveKey)
        defaults.set("airpods-uid", forKey: MicrophonePreference.previousUIDKey)
        MicrophonePreference.restoreInterruptedOverrideIfNeeded(hal: fake.hal, defaults: defaults)
        XCTAssertEqual(fake.setCalls, [106])
        XCTAssertFalse(defaults.bool(forKey: MicrophonePreference.overrideActiveKey))
    }

    func testNoInterruptedOverrideMeansNoTouch() {
        let fake = FakeHAL(devices: [airpods, builtin], defaultID: 106)
        let defaults = makeDefaults()
        MicrophonePreference.restoreInterruptedOverrideIfNeeded(hal: fake.hal, defaults: defaults)
        XCTAssertTrue(fake.setCalls.isEmpty)
    }
}
