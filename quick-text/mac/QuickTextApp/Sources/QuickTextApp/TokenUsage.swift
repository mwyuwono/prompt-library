import Foundation
import Combine

/// Tracks token counts from Gemini Interactions API calls.
public struct TokenUsage: Codable, Equatable, Hashable {
    public var inputTokens: Int
    public var outputTokens: Int

    public init(inputTokens: Int = 0, outputTokens: Int = 0) {
        self.inputTokens = max(0, inputTokens)
        self.outputTokens = max(0, outputTokens)
    }

    public var totalTokens: Int {
        inputTokens + outputTokens
    }

    public static let zero = TokenUsage(inputTokens: 0, outputTokens: 0)

    public static func + (lhs: TokenUsage, rhs: TokenUsage) -> TokenUsage {
        TokenUsage(
            inputTokens: lhs.inputTokens + rhs.inputTokens,
            outputTokens: lhs.outputTokens + rhs.outputTokens
        )
    }

    public static func += (lhs: inout TokenUsage, rhs: TokenUsage) {
        lhs = lhs + rhs
    }

    // MARK: - Cost Calculation
    //
    // gemini-3.8-flash (used for both transcription takes and synthesis/processing):
    //   Introductory pricing (through Dec 31, 2026):
    //     Input:   $0.75 / 1,000,000 tokens
    //     Output:  $3.75 / 1,000,000 tokens
    //   Standard pricing (effective Jan 1, 2027):
    //     Input:   $1.50 / 1,000,000 tokens
    //     Output:  $7.50 / 1,000,000 tokens
    //   Source: https://ai.google.dev/gemini-api/docs/latest-model
    //
    public enum ModelPricing: Equatable {
        case transcribe   // gemini-3.8-flash (introductory through 2026, standard from 2027)
        case flash        // gemini-3.8-flash (introductory through 2026, standard from 2027)
        case introductory // gemini-3.8-flash introductory ($0.75 / $3.75 per 1M)
        case standard     // gemini-3.8-flash standard ($1.50 / $7.50 per 1M)

        /// Standard pricing effective date: Jan 1, 2027 00:00:00 UTC
        public static let standardPricingEffectiveDate: Date = {
            var components = DateComponents()
            components.year = 2027
            components.month = 1
            components.day = 1
            components.hour = 0
            components.minute = 0
            components.second = 0
            components.timeZone = TimeZone(identifier: "UTC")
            return Calendar(identifier: .gregorian).date(from: components)!
        }()

        public var inputRatePerToken: Double {
            inputRatePerToken(at: Date())
        }

        public func inputRatePerToken(at date: Date = Date()) -> Double {
            switch self {
            case .introductory:
                return 0.75 / 1_000_000.0
            case .standard:
                return 1.50 / 1_000_000.0
            case .transcribe, .flash:
                return date >= Self.standardPricingEffectiveDate ? (1.50 / 1_000_000.0) : (0.75 / 1_000_000.0)
            }
        }

        public var outputRatePerToken: Double {
            outputRatePerToken(at: Date())
        }

        public func outputRatePerToken(at date: Date = Date()) -> Double {
            switch self {
            case .introductory:
                return 3.75 / 1_000_000.0
            case .standard:
                return 7.50 / 1_000_000.0
            case .transcribe, .flash:
                return date >= Self.standardPricingEffectiveDate ? (7.50 / 1_000_000.0) : (3.75 / 1_000_000.0)
            }
        }
    }

    // Legacy constants kept for tests and display that don't distinguish model.
    // These reflect gemini-3.8-flash (the synthesis model).
    public static var inputRatePerToken: Double { ModelPricing.flash.inputRatePerToken }
    public static var outputRatePerToken: Double { ModelPricing.flash.outputRatePerToken }

    public static func estimatedCost(inputTokens: Int, outputTokens: Int, pricing: ModelPricing = .flash, at date: Date = Date()) -> Double {
        (Double(inputTokens) * pricing.inputRatePerToken(at: date)) + (Double(outputTokens) * pricing.outputRatePerToken(at: date))
    }

    public var estimatedCost: Double {
        Self.estimatedCost(inputTokens: inputTokens, outputTokens: outputTokens)
    }

    public func estimatedCost(pricing: ModelPricing, at date: Date = Date()) -> Double {
        Self.estimatedCost(inputTokens: inputTokens, outputTokens: outputTokens, pricing: pricing, at: date)
    }

    /// Formats estimated cost as currency, e.g. `$0.00`, `$0.0034`, `< $0.01`, or `$1.25`.
    public static func formatCost(_ amount: Double, subCentPrecision: Bool = true) -> String {
        guard amount > 0 else { return "$0.00" }

        if !subCentPrecision {
            if amount < 0.01 {
                return "< $0.01"
            }
            return String(format: "$%.2f", amount)
        }

        if amount < 0.0001 {
            return "< $0.0001"
        }

        if amount < 0.01 {
            let str = String(format: "$%.4f", amount)
            if str.hasSuffix("0") {
                return String(format: "$%.3f", amount)
            }
            return str
        }

        return String(format: "$%.2f", amount)
    }
}

/// A billable model turn in a Dictate session. Keeping turns separate prevents a
/// later reprocess/refinement from replacing the usage of an earlier one.
public struct DictateProcessingTurn: Codable, Equatable, Identifiable {
    public enum Kind: String, Codable, CaseIterable {
        case reprocessTakes
        case refineResult
    }

    public var id: UUID
    public var kind: Kind
    public var createdAt: Date
    public var usage: TokenUsage
    public var estimatedCost: Double

    public init(
        id: UUID = UUID(),
        kind: Kind,
        createdAt: Date = Date(),
        usage: TokenUsage,
        estimatedCost: Double
    ) {
        self.id = id
        self.kind = kind
        self.createdAt = createdAt
        self.usage = usage
        self.estimatedCost = estimatedCost
    }
}

/// Manages cumulative lifetime token usage and spend across all Dictate sessions.
/// Persisted in `UserDefaults` so local usage does not dirty `quick-text.json`.
@MainActor
public final class DictateStatsStore: ObservableObject {
    public static let shared = DictateStatsStore()

    private let defaults: UserDefaults
    private let inputKey = "quicktext.dictate.cumulativeInputTokens"
    private let outputKey = "quicktext.dictate.cumulativeOutputTokens"
    private let costKey = "quicktext.dictate.cumulativeEstimatedCost"

    @Published public private(set) var cumulativeInputTokens: Int
    @Published public private(set) var cumulativeOutputTokens: Int
    @Published public private(set) var cumulativeEstimatedCost: Double

    public init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        self.cumulativeInputTokens = defaults.integer(forKey: inputKey)
        self.cumulativeOutputTokens = defaults.integer(forKey: outputKey)
        self.cumulativeEstimatedCost = defaults.double(forKey: costKey)
    }

    public var cumulativeTotalTokens: Int {
        cumulativeInputTokens + cumulativeOutputTokens
    }

    public func recordUsage(_ usage: TokenUsage) {
        recordUsage(usage, pricing: .flash)
    }

    public func recordUsage(_ usage: TokenUsage, pricing: TokenUsage.ModelPricing) {
        guard usage.inputTokens > 0 || usage.outputTokens > 0 else { return }
        cumulativeInputTokens += usage.inputTokens
        cumulativeOutputTokens += usage.outputTokens
        cumulativeEstimatedCost += usage.estimatedCost(pricing: pricing)
        defaults.set(cumulativeInputTokens, forKey: inputKey)
        defaults.set(cumulativeOutputTokens, forKey: outputKey)
        defaults.set(cumulativeEstimatedCost, forKey: costKey)
    }

    public func reset() {
        cumulativeInputTokens = 0
        cumulativeOutputTokens = 0
        cumulativeEstimatedCost = 0
        defaults.set(0, forKey: inputKey)
        defaults.set(0, forKey: outputKey)
        defaults.set(0, forKey: costKey)
    }
}
