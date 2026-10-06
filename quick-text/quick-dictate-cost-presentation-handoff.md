# Quick Dictate cost presentation — handoff (2026-10-02)

## Objective
- Make Dictate lifetime cost accurate and legible.
- Present lifetime cost by transcription type/source; plain-language labels, token/call/cost totals, and clear estimated-versus-billed distinction.

## Status
- Steps 1–4 implemented and tested 2026-10-02. Release installed with the original Quick Text Local signing requirement; production migration preserved every lifetime total. Installed Settings inspection is pending macOS Keychain authorization; fixture presentation QA passed.
- Read-only external verification complete; prior technical handoff: `/Users/mwy/Library/CloudStorage/GoogleDrive-matt@weaver-yuwono.com/My Drive/Bullfinch/Tools/quick-text/quick-dictate-billing-handoff.md`.

## Relevant context
- [Verified 2026-10-02] Keychain Dictate key is AI Studio key `quick text app - dictation transcription`; project `gen-lang-client-0995209463`, Tier 2; billing account `01C1D7-4513B5-767BD1`.
- [Verified 2026-10-02] Key-filtered AI Studio cost, Sep. 5–Oct. 2: $0.20; no savings. App lifetime estimate: $0.181496.
- [Verified 2026-10-02] Project billing shows 3.8 Flash audio/text and 3.5 Transcribe Live audio SKUs; no negotiated savings. Live text-output SKU is present on page 2: `8645-1B43-E2A6`, 173 tokens, displayed $0.00. The prior absence claim was incomplete pagination.

## Constraints
- Preserve existing lifetime totals; do not silently rewrite historic cost.
- Label pre-correction lifetime history as potentially inaccurate when relevant.
- Keep bookkeeping off the capture/release path; no push without Matt's approval.
- Do not change Google billing, project settings, API keys, or spend caps.

## Decisions
- Preferred breakdown: Real-time Live; After-take REST; Real-time REST fallback; Cleanup/Process As.
- Each event is priced by actual model/source at event time; display existing lifetime total as legacy-inclusive until a correction baseline is defined.
- UI: compact summary total + per-source table; show calls, input/output tokens, estimated cost, and optional audio duration/cost-per-minute only when reliably captured.

## Open issues
- [Unverified] Whether partial failed Live streams incur billable audio usage. Live text output has a separate billing SKU; exact agreement between API usage metadata and billed counts remains unverified.
- [Unverified] Exact source of the $0.018504 difference between AI Studio's rounded $0.20 and app $0.181496; billing lag, rounding, other historic calls, and known defects are possible contributors.
- Historic archives do not support exact per-take source reconstruction.

## Next steps
1. COMPLETE — Re-read and verify the prior technical handoff against current source/tests; translate source facts into a migration-safe event/bucket data model. See audit and contract below.
2. COMPLETE — Model-at-call-time events, source buckets, persistence, legacy migration, and regression tests implemented.
3. COMPLETE — Settings summary/source table implemented; empty, legacy-only, and mixed-source fixtures rendered and inspected. Installed Settings check pending Keychain prompt.
4. COMPLETE — All 162 Swift tests passed; Quick Text corpus validation passed (one existing qsb shortcut-convention warning); complete change list below. No commit or push.


## Step 1 audit — 2026-10-02

Evidence checked directly this turn; older handoff claims superseded where noted. This section records the pre-change audit at HEAD 1813a2e; the implementation completion section below supersedes descriptions of current source behavior.

### Repository, app, local records
- Editable repo: `/Users/mwy/Library/Mobile Documents/com~apple~CloudDocs/Projects/prompts-library`; `main` / remote `main` both `1813a2e6b42922e17963572a4e8881f9bedbab54` (remote checked with `git ls-remote`). No accounting implementation or tracked source changes. This presentation handoff was already untracked at task start.
- Installed app is running from `/Applications/Quick Text.app/Contents/MacOS/QuickTextApp`; signature authority `Quick Text Local`, no Team ID. Developer-ID signing claims are stale. `security find-identity -v -p codesigning` reports zero valid identities; the old install command's certificate fingerprint was not established as usable. Installation is outside step 1.
- Production preference plist: `realTime`; 155,260 input / 17,257 output / 172,517 total tokens; estimated $0.181496 (stored Double $0.18149600000000002). Same values after tests.
- **Correction:** current Quick Dictate Process As is Raw (`quicktext.quickDictate.processID = ""`). Clean Transcript is the unset-preference default, not the current selection. Raw invokes no processing model; cleanup, when invoked, uses Flash.
- 371 JSON archives; 356 with `takeUsages` / `processingTurns`; 164 with aggregate `liveTranscriptionUsage`; 370 with `estimatedCost`. No per-take source, model, request identity, pricing date, or duration fields. Takes are stored as strings. Parallel `compactMap` arrays are not a reliable take identity map. Repeated processing saves cumulative session snapshots; summing archives would double-count usage. Archives prune after 15 days and are not a lifetime ledger.
- Current 12-hour latency log: **16** `live-stream-ended` events from the installed QuickTextApp binary, all with final text and no error; no installed-app `rest-fallback` events. Six fallback marks came from XCTest processes and were excluded. The earlier 12-take observation is an older bounded sample, not a lifetime fallback guarantee.

### Source and test verification
Paths below are relative to `quick-text/mac/QuickTextApp/` at the verified commit.

| Claim | Current evidence / verdict |
|---|---|
| One undifferentiated lifetime bucket | `Sources/QuickTextApp/TokenUsage.swift:176–230`: three cumulative defaults keys; no model/source/call split; zero-token usage is skipped. Confirmed. |
| Three stats call sites | `DictateSession.swift:511,598,730`: Live finalize, REST completion, processing. Confirmed. |
| REST fallback uses Live pricing when Real-time is selected | REST model is `GeminiClient.transcribeModel = gemini-3.8-flash`; completion reads `TranscriptionMode.stored.pricing`. Confirmed source defect. Input overstatement 3.50/0.75 = 4.667×; output 21/3.75 = 5.6×; combined ratio depends on token mix. “About 4.7×” is only the input ratio. No evidence of a historic billed fallback. |
| Mode change during a take can misprice | Live and REST completion read global stored mode; source route is selected at capture start. Confirmed. |
| Empty Live outcome drops reported usage | `DictateSession.swift:495–504` falls back before recording `outcome.usage`; REST subsequently replaces take usage. Confirmed omission; billability of failed streaming remains unknown. |
| Session/archive estimate mixes sources | `DictateSession.swift:184–188` prices aggregate transcription using current mode, ignoring `isLive`; `TranscriptStore.swift:79–95` does the same fallback computation. Confirmed. |
| Saved history reprices later | **Not supported:** new archive saves pass a computed estimate; fallback uses supplied `date` / `savedAt`. Session estimates can still change before save, and calls crossing the rate boundary currently use completion/computation time. |
| Thought/audio accounting matches billing | `GeminiClient.swift:174–232` folds input modalities into input totals and normalizes thought output; `GeminiLiveClient.swift:231–240` uses that parser. No preserved raw modality totals. `pumpLiveTake` adds each usage update. Real provider incremental-versus-cumulative semantics and exact billed agreement are not established by scripted tests. |
| Settings presentation is already source-aware | **False:** `SettingsEditor.swift:202–257` shows four aggregate rows plus pricing prose. Desired source table is still step 3. |

- `swift test --filter DictateTests`: initial iCloud XCTest resource-fork signing failure; stripped attributes from `.build` and ad-hoc signed **only the test bundle**, then `swift test --skip-build --filter DictateTests`: **81 tests passed, 0 failures** (includes QuickDictateTests). No microphone or paid workload performed; installed app signing unchanged.
- `testSessionEstimatedCostFollowsSelectedTranscriptionModel` (951) and `testSaveSessionFallbackFollowsSelectedModel` (972) explicitly assert the defective mode-dependent behavior. Replace their expectations in step 2.
- Existing fake-driver fallback/success tests verify transcript routing, not correct lifetime cost/source, missing failed-Live usage, or migration. Those cases need regression coverage in step 2. Passing baseline tests do not prove billing accuracy.

### External billing and public rates
- Keychain suffix matched the AI Studio row `quick text app - dictation transcription` without printing/transmitting the full key: project `gen-lang-client-0995209463` / paid-tier / Tier 2, billing account `01C1D7-4513B5-767BD1`. Local gcloud project remains unrelated `ebaysniper-440711`.
- [AI Studio Spend](https://aistudio.google.com/spend): 28 Days, Sep 5–Oct 2, 2026; only the Dictate key selected; cost $0.20, savings $0.00, total $0.20; warning of up to 24-hour reporting lag. Difference from app estimate is arithmetically $0.018504; exact cause remains unverified. Rounded provider total and nonmatching lifetime/window coverage prevent exact reconciliation.
- [Google Cloud Billing report](https://console.cloud.google.com/billing/01C1D7-4513B5-767BD1/reports): Last month (Sep 1–30), Group by SKU, project paid-tier only; inspected both pages, all 15 rows. Relevant SKUs: Flash audio input `C56A-11A2-AACF` (136,356 tokens / $0.10); Flash text output `C5EE-B267-EE7E` (15,620 / $0.06); Flash text input `4F40-96C8-648E` (14,222 / $0.01); Live audio input `DCAD-DF59-FB57` (2,821 / $0.01); **Live text output `8645-1B43-E2A6` (173 / $0.00)**. All project rows show $0.00 negotiated/other savings and no savings programs. These are project-wide, not Dictate-key-only counts.
- [Official pricing](https://ai.google.dev/gemini-api/docs/pricing) re-read: Flash Standard $0.75 input / $3.75 output per 1M through Dec 31, 2026, then $1.50 / $7.50 from Jan 1, 2027; Live Transcribe Standard $3.50 audio input / $21 text output per 1M. Live ~$0.009/min is a published assumption-based estimate, not a measured app rate. Code constants match. Rounded billing SKU costs are compatible with public rates, but do not independently establish exact account-effective unit prices.
- Separate Live output reporting is now confirmed. Partial failed-stream billing, usage-frame semantics, and per-call billing agreement remain open; no billing export or reconciliation workload enabled.

### Push constraint correction
- Vercel read-only project inspection confirms Git-linked project `prompts`, production branch `main`, root repo; retention 7 days for all four types.
- **Provider setting differs from local config:** `commandForIgnoringBuildStep` is `git diff --quiet HEAD^ HEAD -- . ':!rb-fabric-collection'`; local `vercel.json` excludes `quick-text`. Therefore the old handoff's unconditional “Quick Text-only push skips deployment” claim is not established. Keep explicit push approval; no deployment/provider changes in this task. Local `.vercel/project.json` has a stale project name but the ID resolves to `prompts`.

## Step 1 data model contract — ready for step 2

Proposed types/fields below; no Swift implementation in this step.

### Immutable call event
`DictateUsageEvent` (Codable):
- `id: UUID` — generated once per submitted model attempt; retry gets a new ID; fallback gets another ID.
- `sessionID: UUID`, `takeID: UUID?`, `processingTurnID: UUID?` — stable identities; no transcript or audio payload.
- `source: DictateUsageSource` — `realTimeLive`, `afterTakeREST`, `realTimeRESTFallback`, `processing`.
- `modelID: String` — copied from the actual request/driver model, never inferred from current Settings.
- `startedAt: Date`, `completedAt: Date`, `outcome: succeeded | failed | cancelled`.
- `usage: TokenUsage?`, `usageStatus: reported | missing | partial` — missing is not reported zero. Preserve available usage even when transcript/network completion fails.
- `pricingSnapshot` — model, USD input/output rates, rate version, effective interval and pricing date (`startedAt`). Freeze estimated amount at event finalization. A take that spans a rate boundary retains its request-start schedule; exact provider boundary semantics remain a reconciliation question.
- `estimatedCostUSD: Double?` — tokens × frozen rates; nil for missing usage or unsupported pricing. Reported partial cost remains an estimate with incomplete coverage. Never name it billed cost.
- `capturedDurationSeconds: Double?`, `streamedDurationSeconds: Double?` — optional and distinct. Take elapsed duration exists in memory but is not proven transmitted/billed duration. Omit cost/min until a matching reliable duration exists; fallback must not duplicate audio minutes across a take summary.

### Four source buckets and legacy baseline
- `DictateUsageBucket`: source; `callCount`; reported input/output tokens; sum of known frozen estimated costs; failed-call count; missing/partial-usage counts. Calls count submitted model attempts, including failures; no-speech/Raw-without-processing produce no processing calls. Missing usage is visible, not priced as free.
- Display labels: **Real-time Live**, **After-take REST**, **Real-time REST fallback**, **Cleanup / Process As**. Model is a separate event dimension, allowing later model changes within a source without repricing old events.
- `DictateLegacyBaseline`: immutable snapshot of existing cumulative input/output/cost; migration date; source/call count unknown (`nil`, not zero). Label **Earlier usage — source unavailable; estimate may be inaccurate**. No guessed bucket assignment, repricing, archive summation, or automatic billing adjustment.
- `DictateUsageLedgerV1`: schema version; `legacyBaseline`; corrected-accounting start date; immutable events keyed by event ID. Buckets are derived projections, not another independently updated authority. Lifetime displayed totals = baseline + known post-migration event totals. Preserve Double precision; round only for display.
- Persist one versioned Codable ledger under a new defaults key, e.g. `quicktext.dictate.usageLedger.v1`; no API key, transcript, or audio. Keep old cumulative keys as compatibility mirrors after ledger persistence; never use them as an additional amount once v1 exists.

### Migration and lifecycle invariants
1. Initialize/migrate before capture, once. If v1 is absent, read the three old totals and freeze them together in the baseline; new events initially empty. Repeat initialization loads v1 without adding the baseline again. Migration failure or unreadable/unsupported schema preserves existing data and surfaces unavailable accounting; never reset/replace it silently.
2. Capture request context (model/source/date/ID) at submission. REST called after failed Live remains fallback even if Settings changes or REST is retried; keep that route on the take. Settings only selects future capture behavior. Processing captures its own Flash context.
3. Record a failed/empty Live attempt's reported usage once, then record any REST fallback separately. Successful Live finalization also records once. A cancelled/deleted take must not erase already-incurred lifetime usage; responses with usage must be accounted for even when their take is no longer in the UI. If transport exposes no usage, mark missing instead of estimating from audio duration.
4. Preserve `DictateTake` identity and event IDs; one take can own multiple events. Processing turns reference their event IDs. Adopt Quick Take transfers references, not new lifetime charges. Session/archive estimated totals sum unique frozen event IDs, without reading `.stored`; include failed attempts belonging to the session even if no transcript survives.
5. Extend SessionRecord with optional schema version and usage events/take-event references; old records continue decoding. Existing archive estimated totals remain untouched. Archive snapshots are history views and never replayed into lifetime stats.
6. Deduplicate by event ID. Serial persistence, with versioned ledger as authority and compatibility mirrors repaired from it on load, prevents baseline duplication and mirror-write double counting. Publish lightweight in-memory accounting at completion; schedule encoding/storage away from capture/release and cursor insertion. Surface persistence failures and flush pending writes on orderly termination; crash before a deferred write remains a documented durability boundary, not billed certainty.
7. No automatic reset/re-baseline. Keep the existing user-invoked reset behavior coherent with both ledger and mirrors in step 2; historical archives must not repopulate reset stats. No new billing settings or monthly UI in this scope.

### Step 2 regression acceptance
- Legacy-only migration preserves 155,260 / 17,257 / $0.181496; repeated launch/migration does not duplicate; missing/unsupported/corrupt ledger preserves legacy data.
- Real-time REST fallback uses Flash and fallback source; failed Live reported usage is retained separately; missing usage remains unknown. Mid-take mode changes never affect either price.
- Mixed Live/REST/processing calls sum frozen costs; rate-boundary tests pin dates; old archive decode still succeeds; later Settings/date changes do not reprice events.
- Retry, duplicate callback, adoption, deleted take and repeated archive saves do not add a prior event twice or remove lifetime spend. No-speech and Raw-without-cleanup add no processing call.
- Persistence errors and reload preserve the authoritative baseline/events without mirror double counting; bucket sum + legacy equals displayed totals. Empty/legacy-only/mixed presentation QA remains step 3.

## Steps 2–4 completion — 2026-10-02

### Complete change list (before commit/push)
Paths relative to `quick-text/`:
- `mac/QuickTextApp/Sources/QuickTextApp/DictateAccounting.swift` (new): versioned call-event ledger, frozen model/date pricing, four derived buckets, original-total baseline, duplicate protection, serialized background writes, compatibility mirrors, reset/retry/termination flush. Corrupt or unsupported data is preserved and surfaced.
- `mac/QuickTextApp/Sources/QuickTextApp/DictateSession.swift`: request context captured before submission; Live/REST fallback/processing attempts accounted separately; available failed/deleted-take usage retained; session estimates and archive/adoption references use unique events. Settings changes cannot reprice completed attempts.
- `mac/QuickTextApp/Sources/QuickTextApp/GeminiClient.swift`: response distinguishes missing usage metadata from reported zero usage.
- `mac/QuickTextApp/Sources/QuickTextApp/GeminiLiveClient.swift`: driver exposes actual model identity; reported zero usage frames retained.
- `mac/QuickTextApp/Sources/QuickTextApp/TokenUsage.swift`: usage made Sendable; stats store moved to dedicated accounting file; rate constants unchanged.
- `mac/QuickTextApp/Sources/QuickTextApp/TranscriptStore.swift`: optional accounting schema/events/stable take references, frozen event estimates, source-aware fallback for old data. Old record decoding and saved estimates preserved.
- `mac/QuickTextApp/Sources/QuickTextApp/App.swift`: migrate before capture; flush queued usage on orderly termination.
- `mac/QuickTextApp/Sources/QuickTextApp/DictateUsageAndCostCard.swift` (new): compact estimated total and source/calls/input/output/cost table, original earlier-usage row, tracking date, incomplete-usage notice, persistence error/retry, reset confirmation.
- `mac/QuickTextApp/Sources/QuickTextApp/SettingsEditor.swift`: embeds new card; explanation follows actual per-attempt model pricing.
- `mac/QuickTextApp/Sources/QuickTextApp/TranscriptionMode.swift`: clarify selected route is not an accounting authority.
- `mac/QuickTextApp/Tests/QuickTextAppTests/DictateAccountingTests.swift` (new): migration/reload/mirrors, corrupt/future schemas, write errors/retry/reset, frozen rate boundary, failed Live plus fallback, retries, deleted in-flight takes, mid-call mode changes, adoption/archive deduplication, missing/zero usage, three presentation fixtures.
- `mac/QuickTextApp/Tests/QuickTextAppTests/DictateTests.swift`: replace two mode-dependent pricing assertions with actual-source assertions.
- `README.md`: explain estimated cost, original earlier usage, source tracking, and reset.
- `quick-dictate-cost-presentation-handoff.md`: current-state audit, data model contract, completion evidence and remaining boundaries. This handoff was already untracked at task start.

### Validation and installation
- All 162 Swift tests passed, zero failures. iCloud resource-fork recovery applied to the test bundle only; installed app is not ad-hoc signed. Full log `/tmp/quick-dictate-all-tests.log`.
- `npm run quicktext:validate`: 46 phrases, 8 categories, 1 variable; passed, existing `qsb` shortcut warning. `git diff --check` passed.
- Empty/legacy-only/mixed cards rendered with isolated defaults and inspected at 440 logical pixels: `/tmp/quick-dictate-cost-empty.png`, `/tmp/quick-dictate-cost-legacy.png`, `/tmp/quick-dictate-cost-mixed.png`. No fixtures were written to production preferences.
- Release build passed; installed `/Applications/Quick Text.app`, retaining designated requirement `identifier "com.weaveryuwono.quicktext" and certificate leaf = H"21491f0e64c2044cfa4a8ccf848486a657c5d3b3"`. Deep/strict signature verification passed. Backup `/tmp/Quick Text-before-cost-ledger.app`.
- Installed launch created v1 with no new call events and exact original legacy values: 155260 input / 17257 output / Double 0.18149600000000002. Compatibility mirrors unchanged. Installed process path verified.
- Installed Settings inspection currently waits in existing `GeminiKeychain.hasKey`/`SecItemCopyMatching` on macOS authorization. Computer Use refuses SecurityAgent. Matt must handle this prompt; no Keychain permission change performed.

### Remaining boundaries and reconciliation plan
- No microphone capture or paid requests used in these tests; build, signing and fake-driver tests do not establish real provider billing agreement.
- Historic usage cannot be exactly repaired. Earlier totals stay intact with an uncertainty label. Captured duration is optional; transmitted/billed duration and cost per minute omitted.
- Live usage-frame aggregation retains the existing sum behavior; multiple-frame incremental/cumulative semantics and partial failed-stream billing remain unverified. Estimates do not claim billed accuracy.
- Next billing check requires a separately authorized nonsensitive workload and Google destination: capture starting ledger/SKU totals, run known successful Live/REST/cleanup calls with request IDs/times and raw usage (no secrets), wait for provider reporting lag up to 24 hours, compare model input/output SKU deltas against event estimates. Isolate other project traffic or record interference; rounded cents and tiny workloads cannot establish precise agreement. No rate change without evidence.
- No BigQuery export, Google settings/key/spend-cap change, commit, push, or deployment performed. Explicit commit/push approval remains required; Vercel provider ignore-rule discrepancy remains unresolved.
