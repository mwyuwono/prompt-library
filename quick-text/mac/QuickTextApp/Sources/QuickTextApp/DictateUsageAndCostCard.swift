import SwiftUI

/// Separate view permits empty, legacy-only and mixed-source preview/QA without
/// writing fixtures into the user's real defaults or corpus.
struct DictateUsageAndCostCard: View {
    @ObservedObject var statsStore: DictateStatsStore
    @State private var confirmReset = false

    private func cost(_ value: Double) -> String {
        if value > 0 && value < 1 { return String(format: "$%.4f", value) }
        return TokenUsage.formatCost(value)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Lifetime usage & cost").font(.subheadline.weight(.semibold))
                    Text(cost(statsStore.cumulativeEstimatedCost))
                        .font(.title3.monospacedDigit().weight(.semibold))
                    Text("Estimated · Google billing may differ")
                        .font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Button("Reset…") { confirmReset = true }
                    .buttonStyle(.glass).controlSize(.small).disabled(!statsStore.canReset)
            }
            Text("\(statsStore.cumulativeInputTokens.formatted()) input · \(statsStore.cumulativeOutputTokens.formatted()) output tokens")
                .font(.caption.monospacedDigit()).foregroundStyle(.secondary)

            Grid(alignment: .trailing, horizontalSpacing: 8, verticalSpacing: 8) {
                GridRow {
                    Text("Source").frame(maxWidth: .infinity, alignment: .leading)
                    Text("Calls")
                    Text("Input")
                    Text("Output")
                    Text("Est. cost")
                }.font(.caption2.weight(.semibold)).foregroundStyle(.secondary)
                ForEach(statsStore.buckets) { bucket in
                    GridRow {
                        Text(bucket.source.title).frame(maxWidth: .infinity, alignment: .leading)
                        Text(bucket.callCount.formatted())
                        Text(bucket.usage.inputTokens.formatted())
                        Text(bucket.usage.outputTokens.formatted())
                        Text(bucket.callCount > 0 && bucket.incompleteCalls == bucket.callCount && bucket.estimatedCost == 0 ? "Unknown" : cost(bucket.estimatedCost))
                    }.font(.caption2.monospacedDigit())
                }
                if statsStore.legacyBaseline.hasHistory {
                    GridRow {
                        Text("Earlier usage").frame(maxWidth: .infinity, alignment: .leading)
                        Text("—")
                        Text(statsStore.legacyBaseline.usage.inputTokens.formatted())
                        Text(statsStore.legacyBaseline.usage.outputTokens.formatted())
                        Text(cost(statsStore.legacyBaseline.estimatedCost))
                    }.font(.caption2.monospacedDigit()).foregroundStyle(.secondary)
                }
            }
            if statsStore.legacyBaseline.hasHistory {
                Text("Earlier usage has no source breakdown and may contain inaccurate estimates. Its original totals are preserved.")
                    .font(.caption2).foregroundStyle(.secondary)
            }
            Text("Source tracking since \(statsStore.accountingStartedAt.formatted(date: .abbreviated, time: .shortened)). Calls include failed attempts.")
                .font(.caption2).foregroundStyle(.secondary)
            if statsStore.incompleteCalls > 0 {
                Text("\(statsStore.incompleteCalls) \(statsStore.incompleteCalls == 1 ? "call has" : "calls have") missing or partial usage. The estimate includes only known costs.")
                    .font(.caption2).foregroundStyle(.secondary)
            }
            if let error = statsStore.persistenceError {
                Text(error).font(.caption).foregroundStyle(.secondary)
                Button("Retry saving usage") { statsStore.retrySaving() }.controlSize(.small)
            }
        }
        .padding(12)
        .background(RoundedRectangle(cornerRadius: QuickTextDesign.controlRadius).fill(Color.primary.opacity(0.03)))
        .overlay(RoundedRectangle(cornerRadius: QuickTextDesign.controlRadius).stroke(Color.primary.opacity(0.08), lineWidth: 1))
        .confirmationDialog("Reset lifetime usage and cost?", isPresented: $confirmReset) {
            Button("Reset Lifetime Stats", role: .destructive) { statsStore.reset() }
        } message: {
            Text("This clears local usage totals and source tracking. Google billing and saved transcripts are unchanged.")
        }
    }
}
