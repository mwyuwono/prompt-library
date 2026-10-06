import XCTest
import SwiftUI
import AppKit
import Combine
@testable import QuickTextApp

final class DictateAccountingTests: XCTestCase {
    @MainActor private func isolatedStore() -> (DictateStatsStore, UserDefaults, String) {
        let name = "test-accounting-\(UUID())"
        let defaults = UserDefaults(suiteName: name)!
        return (DictateStatsStore(defaults: defaults), defaults, name)
    }

    @MainActor private func awaitTake(_ session: DictateSession) async throws {
        for _ in 0..<100 {
            if let last = session.takes.last {
                switch last.status {
                case .ready, .failed: return
                default: break
                }
            }
            try await Task.sleep(nanoseconds: 20_000_000)
        }
        XCTFail("take did not settle")
    }

    @MainActor func testMigrationPreservesTotalsAndRepairsMirrorsWithoutDuplication() throws {
        let name = "test-migration-\(UUID())"
        let defaults = UserDefaults(suiteName: name)!
        defer { defaults.removePersistentDomain(forName: name) }
        defaults.set(155260, forKey: DictateStatsStore.inputKey)
        defaults.set(17257, forKey: DictateStatsStore.outputKey)
        defaults.set(0.181496, forKey: DictateStatsStore.costKey)
        let first = DictateStatsStore(defaults: defaults)
        let event = DictateUsageEvent(sessionID: UUID(), source: .afterTakeREST, modelID: GeminiClient.transcribeModel,
                                     usage: TokenUsage(inputTokens: 1000, outputTokens: 100))
        first.record(event)
        first.record(event)
        first.flushPersistence()
        defaults.set(99, forKey: DictateStatsStore.inputKey)
        let second = DictateStatsStore(defaults: defaults)
        XCTAssertEqual(second.legacyBaseline.usage, TokenUsage(inputTokens: 155260, outputTokens: 17257))
        XCTAssertEqual(second.legacyBaseline.estimatedCost, 0.181496, accuracy: 1e-12)
        XCTAssertEqual(second.events.count, 1)
        XCTAssertEqual(second.cumulativeInputTokens, 156260)
        XCTAssertEqual(second.cumulativeEstimatedCost, 0.181496 + event.estimatedCost!, accuracy: 1e-12)
        XCTAssertEqual(defaults.integer(forKey: DictateStatsStore.inputKey), 156260)
        XCTAssertEqual(second.buckets.reduce(0) { $0 + $1.estimatedCost } + second.legacyBaseline.estimatedCost,
                       second.cumulativeEstimatedCost, accuracy: 1e-12)
    }

    @MainActor func testCorruptAndFutureLedgersRemainUntouched() {
        for data in [Data("broken".utf8), Data("{\"version\":2}".utf8)] {
            let name = "test-corrupt-\(UUID())"
            let defaults = UserDefaults(suiteName: name)!
            defer { defaults.removePersistentDomain(forName: name) }
            defaults.set(data, forKey: DictateStatsStore.ledgerKey)
            defaults.set(155260, forKey: DictateStatsStore.inputKey)
            let store = DictateStatsStore(defaults: defaults)
            store.record(DictateUsageEvent(sessionID: UUID(), source: .processing, modelID: GeminiClient.processModel, usage: .zero))
            store.reset()
            store.flushPersistence()
            XCTAssertNotNil(store.persistenceError)
            XCTAssertEqual(store.cumulativeInputTokens, 155260)
            XCTAssertEqual(defaults.data(forKey: DictateStatsStore.ledgerKey), data)
        }
    }

    @MainActor func testFailedMigrationPreservesLegacyData() {
        let name = "test-failed-migration-\(UUID())"
        let defaults = UserDefaults(suiteName: name)!
        defer { defaults.removePersistentDomain(forName: name) }
        defaults.set(100, forKey: DictateStatsStore.inputKey)
        let store = DictateStatsStore(defaults: defaults, writer: { _ in throw CocoaError(.fileWriteUnknown) })
        XCTAssertNotNil(store.persistenceError)
        XCTAssertEqual(store.cumulativeInputTokens, 100)
        XCTAssertNil(defaults.data(forKey: DictateStatsStore.ledgerKey))
    }

    func testPricingFreezesRequestDateAcrossRateBoundaryAndUnknownModels() throws {
        let before = TokenUsage.ModelPricing.standardPricingEffectiveDate.addingTimeInterval(-1)
        let after = before.addingTimeInterval(2)
        let event = DictateUsageEvent(sessionID: UUID(), source: .afterTakeREST, modelID: GeminiClient.transcribeModel,
                                     startedAt: before, completedAt: after, usage: TokenUsage(inputTokens: 1000000, outputTokens: 1000000))
        XCTAssertEqual(event.estimatedCost!, 4.50, accuracy: 1e-12)
        let reload = try JSONDecoder().decode(DictateUsageEvent.self, from: JSONEncoder().encode(event))
        XCTAssertEqual(reload.estimatedCost, event.estimatedCost)
        let unknown = DictateUsageEvent(sessionID: UUID(), source: .processing, modelID: "future-model", usage: .zero)
        XCTAssertNil(unknown.estimatedCost)
    }

    @MainActor func testFallbackRetainsPartialLiveUsageAndIgnoresMidTakeModeChange() async throws {
        let (store, defaults, name) = isolatedStore()
        defer { store.flushPersistence(); defaults.removePersistentDomain(forName: name) }
        let oldMode = TranscriptionMode.stored
        defer { TranscriptionMode.stored = oldMode }
        TranscriptionMode.stored = .realTime
        let session = DictateSession()
        session.statsStore = store
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("fallback-\(UUID()).m4a")
        try Data("offline fixture".utf8).write(to: url)
        let take = DictateTake(audioURL: url, status: .recording)
        session.takes = [take]
        session.transcribe = { _, _ in
            TranscriptionMode.stored = .afterTake
            return GeminiResponse(text: "rest", usage: TokenUsage(inputTokens: 1000, outputTokens: 100))
        }
        let outcome = LiveTakeOutcome(usage: TokenUsage(inputTokens: 500, outputTokens: 10), errorMessage: "dropped")
        session.finalizeLiveTake(outcome, takeID: take.id, audioURL: url)
        session.finalizeLiveTake(outcome, takeID: take.id, audioURL: url)
        try await awaitTake(session)
        XCTAssertEqual(store.events.count, 2)
        XCTAssertEqual(store.events.map(\.source), [.realTimeLive, .realTimeRESTFallback])
        let expected = TokenUsage(inputTokens: 500, outputTokens: 10).estimatedCost(pricing: .liveTranscribe) +
                       TokenUsage(inputTokens: 1000, outputTokens: 100).estimatedCost(pricing: .flash)
        XCTAssertEqual(store.cumulativeEstimatedCost, expected, accuracy: 1e-12)
        XCTAssertEqual(session.sessionEstimatedCost, expected, accuracy: 1e-12)
        XCTAssertEqual(session.transcriptionTokenUsage, TokenUsage(inputTokens: 1500, outputTokens: 110))
        XCTAssertEqual(store.incompleteCalls, 1)
        session.deleteTake(session.takes[0])
        XCTAssertEqual(store.cumulativeEstimatedCost, expected, accuracy: 1e-12)
        XCTAssertEqual(session.sessionEstimatedCost, expected, accuracy: 1e-12)
    }

    @MainActor func testRestCompletingAfterModeChangeStillUsesFlash() async throws {
        let (store, defaults, name) = isolatedStore()
        defer { store.flushPersistence(); defaults.removePersistentDomain(forName: name) }
        let previous = TranscriptionMode.stored
        defer { TranscriptionMode.stored = previous }
        TranscriptionMode.stored = .afterTake
        let session = DictateSession(); session.statsStore = store
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("mode-change-\(UUID()).m4a")
        try Data("fixture".utf8).write(to: url)
        session.takes = [DictateTake(audioURL: url, status: .recording)]
        session.transcribe = { _, _ in
            TranscriptionMode.stored = .realTime
            return GeminiResponse(text: "rest", usage: TokenUsage(inputTokens: 1000, outputTokens: 100))
        }
        session.stopRecording()
        try await awaitTake(session)
        XCTAssertEqual(store.events.first?.source, .afterTakeREST)
        XCTAssertEqual(store.cumulativeEstimatedCost, 0.001125, accuracy: 1e-12)
    }

    @MainActor func testFailedLivePumpRecordsUsageEvenWhenTakeWasDeleted() async throws {
        let (store, defaults, name) = isolatedStore()
        defer { store.flushPersistence(); defaults.removePersistentDomain(forName: name) }
        let session = DictateSession(); session.statsStore = store
        let take = DictateTake(audioURL: nil, status: .recording)
        session.takes = [take]
        let driver = AccountingLiveDriver()
        driver.onStart = { session.deleteTake(take) }
        let outcome = await session.pumpLiveTake(driver: driver, takeID: take.id, apiKey: "offline")
        session.finalizeLiveTake(outcome, takeID: take.id, audioURL: nil)
        XCTAssertTrue(session.takes.isEmpty)
        XCTAssertEqual(store.events.count, 1)
        XCTAssertEqual(store.events.first?.usage, TokenUsage(inputTokens: 100, outputTokens: 10))
        XCTAssertEqual(store.events.first?.usageStatus, .partial)
        XCTAssertEqual(store.incompleteCalls, 1)
    }

    @MainActor func testFailedDeferredWriteCanRetryWithoutLosingOrDuplicatingEvents() async throws {
        let name = "test-retry-persistence-\(UUID())"
        let defaults = UserDefaults(suiteName: name)!
        let gate = AccountingWriteGate()
        let store = DictateStatsStore(defaults: defaults, writer: { _ in try gate.check() })
        defer { store.flushPersistence(); defaults.removePersistentDomain(forName: name) }
        gate.setFailure(true)
        store.record(DictateUsageEvent(sessionID: UUID(), source: .processing, modelID: GeminiClient.processModel,
                                      usage: TokenUsage(inputTokens: 1000, outputTokens: 100)))
        store.flushPersistence()
        try await Task.sleep(nanoseconds: 20_000_000)
        XCTAssertNotNil(store.persistenceError)
        XCTAssertEqual(DictateStatsStore(defaults: defaults).events.count, 0)
        gate.setFailure(false)
        store.retrySaving()
        store.flushPersistence()
        try await Task.sleep(nanoseconds: 20_000_000)
        XCTAssertNil(store.persistenceError)
        let reloaded = DictateStatsStore(defaults: defaults)
        XCTAssertEqual(reloaded.events.count, 1)
        XCTAssertEqual(reloaded.cumulativeInputTokens, 1000)
        let oldEvent = reloaded.events[0]
        reloaded.reset()
        reloaded.record(oldEvent)
        reloaded.flushPersistence()
        XCTAssertEqual(DictateStatsStore(defaults: defaults).events.count, 0, "late duplicate must not resurrect reset usage")
    }

    @MainActor func testSuccessfulLiveUsesLivePriceWhenSettingsHasChanged() {
        let (store, defaults, name) = isolatedStore()
        defer { store.flushPersistence(); defaults.removePersistentDomain(forName: name) }
        let previous = TranscriptionMode.stored
        defer { TranscriptionMode.stored = previous }
        TranscriptionMode.stored = .afterTake
        let session = DictateSession()
        session.statsStore = store
        let take = DictateTake(audioURL: nil, status: .recording)
        session.takes = [take]
        let usage = TokenUsage(inputTokens: 1000, outputTokens: 100)
        let outcome = LiveTakeOutcome(text: "live", usage: usage, receivedFinal: true)
        session.finalizeLiveTake(outcome, takeID: take.id, audioURL: nil)
        session.finalizeLiveTake(outcome, takeID: take.id, audioURL: nil)
        XCTAssertEqual(store.events.count, 1)
        XCTAssertEqual(store.cumulativeEstimatedCost, usage.estimatedCost(pricing: .liveTranscribe), accuracy: 1e-12)
    }

    @MainActor func testMissingUsageAndReportedZeroAreDifferentAndResetSurvivesReload() {
        let (store, defaults, name) = isolatedStore()
        defer { store.flushPersistence(); defaults.removePersistentDomain(forName: name) }
        store.record(DictateUsageEvent(sessionID: UUID(), source: .realTimeLive, modelID: GeminiLiveClient.liveModel, outcome: .failed, usage: nil))
        store.record(DictateUsageEvent(sessionID: UUID(), source: .processing, modelID: GeminiClient.processModel, usage: .zero))
        XCTAssertEqual(store.events[0].usageStatus, .missing)
        XCTAssertNil(store.events[0].estimatedCost)
        XCTAssertEqual(store.events[1].usageStatus, .reported)
        XCTAssertEqual(store.events[1].estimatedCost, 0)
        XCTAssertEqual(store.incompleteCalls, 1)
        XCTAssertTrue(store.canReset)
        store.reset()
        store.flushPersistence()
        XCTAssertEqual(DictateStatsStore(defaults: defaults).events.count, 0)
        XCTAssertEqual(defaults.integer(forKey: DictateStatsStore.inputKey), 0)
    }

    @MainActor func testDeletedInFlightRestStillCountsAndRetryKeepsFallbackSource() async throws {
        let (store, defaults, name) = isolatedStore()
        defer { store.flushPersistence(); defaults.removePersistentDomain(forName: name) }
        let session = DictateSession()
        session.statsStore = store
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("retry-\(UUID()).m4a")
        try Data("fixture".utf8).write(to: url)
        var take = DictateTake(audioURL: url, status: .failed("retry"))
        take.restSource = .realTimeRESTFallback
        session.takes = [take]
        session.transcribe = { _, _ in
            session.deleteTake(take)
            return GeminiResponse(text: "deleted", usage: TokenUsage(inputTokens: 100, outputTokens: 10))
        }
        session.retryTake(take)
        for _ in 0..<100 {
            if !store.events.isEmpty { break }
            try await Task.sleep(nanoseconds: 20_000_000)
        }
        XCTAssertTrue(session.takes.isEmpty)
        XCTAssertEqual(store.events.first?.source, .realTimeRESTFallback)
        XCTAssertEqual(store.cumulativeInputTokens, 100)
    }

    @MainActor func testAdoptionAndArchiveSnapshotsDoNotRechargeAndRetainEventIdentity() throws {
        let (store, defaults, name) = isolatedStore()
        defer { store.flushPersistence(); defaults.removePersistentDomain(forName: name) }
        let quick = DictateSession()
        quick.statsStore = store
        let take = DictateTake(audioURL: nil, status: .recording)
        quick.takes = [take]
        quick.finalizeLiveTake(LiveTakeOutcome(text: "hello", usage: TokenUsage(inputTokens: 100, outputTokens: 10)), takeID: take.id, audioURL: nil)
        let page = DictateSession()
        page.statsStore = store
        page.adoptQuickTake(quick.takes[0], result: nil)
        page.adoptQuickTake(quick.takes[0], result: nil)
        XCTAssertEqual(page.takes.count, 1)
        XCTAssertEqual(store.events.count, 1)
        XCTAssertEqual(page.sessionEstimatedCost, quick.sessionEstimatedCost, accuracy: 1e-12)
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("event-archive-\(UUID())")
        defer { try? FileManager.default.removeItem(at: dir) }
        for _ in 0..<2 {
            let url = try TranscriptStore.saveSession(takes: ["hello"], result: "hello", usageEvents: quick.usageEvents,
                takeEventReferences: [TranscriptStore.TakeEventReference(takeID: take.id, eventIDs: quick.usageEvents.map(\.id))], in: dir)
            let decoder = JSONDecoder(); decoder.dateDecodingStrategy = .iso8601
            let record = try decoder.decode(TranscriptStore.SessionRecord.self, from: Data(contentsOf: url))
            XCTAssertEqual(record.usageEvents?.first?.id, store.events.first?.id)
            XCTAssertEqual(record.takeEventReferences?.first?.takeID, take.id)
            XCTAssertEqual(record.accountingVersion, 1)
        }
        XCTAssertEqual(store.events.count, 1)
    }

    func testResponseMissingUsageIsNotReportedZero() throws {
        let response = try GeminiClient.extractResponse(from: Data("{\"outputs\":[{\"type\":\"text\",\"text\":\"hello\"}]}".utf8))
        XCTAssertFalse(response.usageReported)
        XCTAssertEqual(response.usage, .zero)
    }

    @MainActor func testUsageCardRendersEmptyLegacyAndMixedFixtures() throws {
        for fixture in ["empty", "legacy", "mixed"] {
            let name = "test-card-\(UUID())"
            let defaults = UserDefaults(suiteName: name)!
            if fixture != "empty" {
                defaults.set(155260, forKey: DictateStatsStore.inputKey)
                defaults.set(17257, forKey: DictateStatsStore.outputKey)
                defaults.set(0.181496, forKey: DictateStatsStore.costKey)
            }
            let store = DictateStatsStore(defaults: defaults)
            defer { store.flushPersistence(); defaults.removePersistentDomain(forName: name) }
            if fixture == "mixed" {
                for source in DictateUsageSource.allCases {
                    store.record(DictateUsageEvent(sessionID: UUID(), source: source,
                        modelID: source == .realTimeLive ? GeminiLiveClient.liveModel : GeminiClient.processModel,
                        usage: TokenUsage(inputTokens: 12345, outputTokens: 678)))
                }
                store.record(DictateUsageEvent(sessionID: UUID(), source: .realTimeLive, modelID: GeminiLiveClient.liveModel, outcome: .failed, usage: nil))
            }
            let content = DictateUsageAndCostCard(statsStore: store).padding(16).frame(width: 440)
                .fixedSize(horizontal: false, vertical: true).environment(\.colorScheme, .light).background(Color.white)
            let renderer = ImageRenderer(content: content)
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage)
            let rep = NSBitmapImageRep(cgImage: image)
            try XCTUnwrap(rep.representation(using: .png, properties: [:])).write(to: URL(fileURLWithPath: "/tmp/quick-dictate-cost-\(fixture).png"))
            XCTAssertGreaterThan(image.height, 400)
        }
    }
}

private final class AccountingWriteGate: @unchecked Sendable {
    private let lock = NSLock()
    private var fail = false
    func setFailure(_ value: Bool) { lock.withLock { fail = value } }
    func check() throws { if lock.withLock({ fail }) { throw CocoaError(.fileWriteUnknown) } }
}

private final class AccountingLiveDriver: LiveTranscriptionDriver {
    var onStart: (() -> Void)?
    func start(apiKey: String) async throws { onStart?() }
    func sendAudio(_ pcmChunk: Data) {}
    func stop() {}
    func events() -> AsyncStream<GeminiLiveClient.LiveEvent> {
        AsyncStream { stream in
            stream.yield(.usage(TokenUsage(inputTokens: 100, outputTokens: 10)))
            stream.yield(.error(DictateError.badResponse("offline interrupted stream")))
            stream.finish()
        }
    }
}
