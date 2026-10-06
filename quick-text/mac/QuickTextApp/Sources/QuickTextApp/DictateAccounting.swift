import Foundation
import Combine

public enum DictateUsageSource: String, Codable, CaseIterable, Identifiable, Sendable {
    case realTimeLive, afterTakeREST, realTimeRESTFallback, processing
    public var id: String { rawValue }
    public var title: String {
        switch self {
        case .realTimeLive: return "Real-time Live"
        case .afterTakeREST: return "After-take REST"
        case .realTimeRESTFallback: return "Real-time REST fallback"
        case .processing: return "Cleanup / Process As"
        }
    }
}

public struct DictatePricingSnapshot: Codable, Equatable, Sendable {
    public var modelID: String
    public var pricedAt: Date
    public var rateVersion: String
    public var inputRate: Double
    public var outputRate: Double

    public init(modelID: String, at date: Date) {
        self.modelID = modelID
        pricedAt = date
        let live = modelID.hasSuffix("gemini-3.5-transcribe-live")
        let pricing: TokenUsage.ModelPricing = live ? .liveTranscribe : .flash
        rateVersion = live ? "live-standard" : (date < TokenUsage.ModelPricing.standardPricingEffectiveDate ? "flash-2026" : "flash-2027")
        inputRate = pricing.inputRatePerToken(at: date)
        outputRate = pricing.outputRatePerToken(at: date)
    }

    public var isSupported: Bool {
        modelID == "gemini-3.8-flash" || modelID == "gemini-3.5-transcribe-live" || modelID == "models/gemini-3.5-transcribe-live"
    }
    public func cost(_ usage: TokenUsage) -> Double? {
        guard isSupported else { return nil }
        return Double(usage.inputTokens) * inputRate + Double(usage.outputTokens) * outputRate
    }
}

public struct DictateUsageEvent: Codable, Equatable, Identifiable, Sendable {
    public enum Outcome: String, Codable, Sendable { case succeeded, failed, cancelled }
    public enum UsageStatus: String, Codable, Sendable { case reported, missing, partial }
    public var id: UUID
    public var sessionID: UUID
    public var takeID: UUID?
    public var processingTurnID: UUID?
    public var source: DictateUsageSource
    public var modelID: String
    public var startedAt: Date
    public var completedAt: Date
    public var outcome: Outcome
    public var usage: TokenUsage?
    public var usageStatus: UsageStatus
    public var pricing: DictatePricingSnapshot
    public var estimatedCost: Double?
    public var capturedDurationSeconds: Double?

    public init(id: UUID = UUID(), sessionID: UUID, takeID: UUID? = nil, processingTurnID: UUID? = nil,
                source: DictateUsageSource, modelID: String, startedAt: Date = Date(),
                completedAt: Date = Date(), outcome: Outcome = .succeeded, usage: TokenUsage?,
                capturedDurationSeconds: Double? = nil) {
        self.id = id
        self.sessionID = sessionID
        self.takeID = takeID
        self.processingTurnID = processingTurnID
        self.source = source
        self.modelID = modelID
        self.startedAt = startedAt
        self.completedAt = completedAt
        self.outcome = outcome
        self.usage = usage
        usageStatus = usage == nil ? .missing : (outcome == .succeeded ? .reported : .partial)
        pricing = DictatePricingSnapshot(modelID: modelID, at: startedAt)
        estimatedCost = usage.flatMap { pricing.cost($0) }
        self.capturedDurationSeconds = capturedDurationSeconds
    }
}

public struct DictateUsageBucket: Identifiable, Equatable {
    public var source: DictateUsageSource
    public var id: String { source.rawValue }
    public var callCount = 0
    public var usage: TokenUsage = .zero
    public var estimatedCost: Double = 0
    public var incompleteCalls = 0
    public var failedCalls = 0
}

public struct DictateLegacyBaseline: Codable, Equatable, Sendable {
    public var usage: TokenUsage
    public var estimatedCost: Double
    public var hasHistory: Bool { usage.totalTokens > 0 || estimatedCost > 0 }
}

struct DictateUsageLedger: Codable, Sendable {
    var version = 1
    var startedAt: Date
    var legacy: DictateLegacyBaseline
    var events: [DictateUsageEvent] = []
    var retiredEventIDs: [UUID]? = nil
}

private struct AccountingDefaults: @unchecked Sendable {
    let value: UserDefaults // UserDefaults is documented thread safe.
}

/// The versioned ledger is authoritative; old totals are compatibility mirrors.
/// Encoding/writes are serialized off the main actor, never on capture/release.
@MainActor
public final class DictateStatsStore: ObservableObject {
    public static let shared = DictateStatsStore()
    nonisolated static let ledgerKey = "quicktext.dictate.usageLedger.v1"
    nonisolated static let inputKey = "quicktext.dictate.cumulativeInputTokens"
    nonisolated static let outputKey = "quicktext.dictate.cumulativeOutputTokens"
    nonisolated static let costKey = "quicktext.dictate.cumulativeEstimatedCost"
    private let defaults: UserDefaults
    private let queue = DispatchQueue(label: "com.weaveryuwono.quicktext.accounting")
    private let writer: (@Sendable (Data) throws -> Void)?
    private var ledger: DictateUsageLedger
    private var writable = true
    private var knownIDs: Set<UUID>
    @Published public private(set) var persistenceError: String?
    @Published public private(set) var cumulativeInputTokens: Int
    @Published public private(set) var cumulativeOutputTokens: Int
    @Published public private(set) var cumulativeEstimatedCost: Double
    @Published public private(set) var buckets: [DictateUsageBucket] = []
    public var legacyBaseline: DictateLegacyBaseline { ledger.legacy }
    public var accountingStartedAt: Date { ledger.startedAt }
    public var events: [DictateUsageEvent] { ledger.events }
    public var cumulativeTotalTokens: Int { cumulativeInputTokens + cumulativeOutputTokens }
    public var incompleteCalls: Int { buckets.reduce(0) { $0 + $1.incompleteCalls } }
    public var canReset: Bool { writable && (cumulativeTotalTokens > 0 || cumulativeEstimatedCost > 0 || !ledger.events.isEmpty) }

    public convenience init(defaults: UserDefaults = .standard) {
        self.init(defaults: defaults, writer: nil)
    }

    init(defaults: UserDefaults, writer: (@Sendable (Data) throws -> Void)?) {
        self.defaults = defaults
        self.writer = writer
        let baseline = DictateLegacyBaseline(usage: TokenUsage(inputTokens: defaults.integer(forKey: Self.inputKey),
                                                               outputTokens: defaults.integer(forKey: Self.outputKey)),
                                              estimatedCost: defaults.double(forKey: Self.costKey))
        var initial = DictateUsageLedger(startedAt: Date(), legacy: baseline)
        if let stored = defaults.object(forKey: Self.ledgerKey) {
            if let data = stored as? Data, let decoded = try? JSONDecoder().decode(DictateUsageLedger.self, from: data), decoded.version == 1 {
                initial = decoded
            } else {
                writable = false
                persistenceError = "Saved usage could not be read. Existing totals are preserved; new usage cannot be saved."
            }
        }
        ledger = initial
        knownIDs = Set(initial.events.map(\.id) + (initial.retiredEventIDs ?? []))
        cumulativeInputTokens = initial.legacy.usage.inputTokens
        cumulativeOutputTokens = initial.legacy.usage.outputTokens
        cumulativeEstimatedCost = initial.legacy.estimatedCost
        refreshTotals()
        // Finish migration before any new call can arrive, then mirror repair.
        if writable {
            do { try persistSnapshot(initial) }
            catch {
                writable = false
                persistenceError = "Usage migration could not be saved. Existing totals are preserved."
            }
        }
    }

    public func record(_ event: DictateUsageEvent) {
        guard writable, knownIDs.insert(event.id).inserted else { return }
        ledger.events.append(event)
        refreshTotals()
        schedulePersistence()
    }

    /// Compatibility for older callers; production calls supply explicit events.
    public func recordUsage(_ usage: TokenUsage, pricing: TokenUsage.ModelPricing = .flash) {
        guard usage.totalTokens > 0 else { return }
        let model = pricing == .liveTranscribe ? "gemini-3.5-transcribe-live" : "gemini-3.8-flash"
        var event = DictateUsageEvent(sessionID: UUID(), source: pricing == .liveTranscribe ? .realTimeLive : .processing,
                                     modelID: model, usage: usage)
        event.pricing.inputRate = pricing.inputRatePerToken(at: event.startedAt)
        event.pricing.outputRate = pricing.outputRatePerToken(at: event.startedAt)
        event.estimatedCost = event.pricing.cost(usage)
        record(event)
    }

    public func reset() {
        guard writable else { return }
        ledger = DictateUsageLedger(startedAt: Date(), legacy: DictateLegacyBaseline(usage: .zero, estimatedCost: 0), retiredEventIDs: Array(knownIDs))
        refreshTotals()
        schedulePersistence()
    }

    private func refreshTotals() {
        buckets = DictateUsageSource.allCases.map { source in
            var bucket = DictateUsageBucket(source: source)
            for event in ledger.events where event.source == source {
                bucket.callCount += 1
                bucket.usage += event.usage ?? .zero
                bucket.estimatedCost += event.estimatedCost ?? 0
                if event.usageStatus != .reported || event.estimatedCost == nil { bucket.incompleteCalls += 1 }
                if event.outcome != .succeeded { bucket.failedCalls += 1 }
            }
            return bucket
        }
        cumulativeInputTokens = ledger.legacy.usage.inputTokens + buckets.reduce(0) { $0 + $1.usage.inputTokens }
        cumulativeOutputTokens = ledger.legacy.usage.outputTokens + buckets.reduce(0) { $0 + $1.usage.outputTokens }
        cumulativeEstimatedCost = ledger.legacy.estimatedCost + buckets.reduce(0) { $0 + $1.estimatedCost }
    }

    private func persistSnapshot(_ snapshot: DictateUsageLedger) throws {
        let data = try JSONEncoder().encode(snapshot)
        if let writer { try writer(data) }
        defaults.set(data, forKey: Self.ledgerKey)
        defaults.set(snapshot.legacy.usage.inputTokens + snapshot.events.reduce(0) { $0 + ($1.usage?.inputTokens ?? 0) }, forKey: Self.inputKey)
        defaults.set(snapshot.legacy.usage.outputTokens + snapshot.events.reduce(0) { $0 + ($1.usage?.outputTokens ?? 0) }, forKey: Self.outputKey)
        defaults.set(snapshot.legacy.estimatedCost + snapshot.events.reduce(0) { $0 + ($1.estimatedCost ?? 0) }, forKey: Self.costKey)
    }

    private func schedulePersistence() {
        let snapshot = ledger
        let defaultsBox = AccountingDefaults(value: defaults)
        let writer = writer
        queue.async { [weak self] in
            let defaults = defaultsBox.value
            do {
                let data = try JSONEncoder().encode(snapshot)
                if let writer { try writer(data) }
                defaults.set(data, forKey: Self.ledgerKey)
                defaults.set(snapshot.legacy.usage.inputTokens + snapshot.events.reduce(0) { $0 + ($1.usage?.inputTokens ?? 0) }, forKey: Self.inputKey)
                defaults.set(snapshot.legacy.usage.outputTokens + snapshot.events.reduce(0) { $0 + ($1.usage?.outputTokens ?? 0) }, forKey: Self.outputKey)
                defaults.set(snapshot.legacy.estimatedCost + snapshot.events.reduce(0) { $0 + ($1.estimatedCost ?? 0) }, forKey: Self.costKey)
                Task { @MainActor [weak self] in self?.persistenceError = nil }
            } catch {
                Task { @MainActor [weak self] in self?.persistenceError = "New usage has not been saved. Keep the app open and retry saving." }
            }
        }
    }

    public func retrySaving() { if writable { schedulePersistence() } }
    public func flushPersistence() { queue.sync {} }
}
