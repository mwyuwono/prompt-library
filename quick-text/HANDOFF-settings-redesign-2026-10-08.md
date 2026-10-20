# Handoff: Settings panel redesign + billing deep link (2026-10-08)

## Objective
1. Redesign Quick Text Mac app Settings panel: eliminate wasted space, impose section organization, optimize components. Mockups first (HTML prototype + SwiftUI plan, 2 directions), implement only after approval.
2. Add "Open Google Cloud Billing" deep link to Usage & Cost module: `https://console.cloud.google.com/billing/01C1D7-4513B5-767BD1/reports?project=gen-lang-client-0995209463`.

## Status
- Inspection completed 2026-10-08 against running `/Applications/Quick Text.app`. No code changed. Repo clean at `58c4aa2`.
- 3 reference screenshots captured (panel top / usage-cost middle / categories bottom) — NOT in repo (kept out of git): `/Users/mwy/Library/CloudStorage/GoogleDrive-matt@weaver-yuwono.com/My Drive/Bullfinch/Tools/quick-text/settings-redesign/`. Full meta prompt: `settings-ui-redesign-handoff.md` in same Bullfinch dir.

## Relevant context
- Panel: `quick-text/mac/QuickTextApp/Sources/QuickTextApp/SettingsEditor.swift` (structure L72-112; `settingsSection` L316; `primarySettingsColumn` L281; `dictationSection` L116; `textReplacementsSection` L208). Width `ContentView.swift` L80: `min(max(window*0.6,560),window*0.9)` — single narrow column inside (inner caps 280–480pt) leaves right ~40% empty beige at all scroll positions.
- Cost card: `DictateUsageAndCostCard.swift`; Quick Dictate: `QuickDictateSettingsSection.swift`; opener: `ContentView.swift` L882 `openSettingsPanel` (sidebar row).
- Observed values this Mac: lifetime $0.2365, 205,236 in / 21,919 out; buckets Real-time Live 224 (Unknown), After-take REST 33, REST fallback 1, Cleanup 29, Earlier usage; 228 incomplete calls; tracking since Oct 2 2026 11:38 AM; mode = After take; 34 managed shortcuts (synced last week); 8 categories; Mic/Accessibility/Input Monitoring all granted.
- Billing IDs from `quick-dictate-billing-handoff.md` (Bullfinch): account `01C1D7-4513B5-767BD1`, project `gen-lang-client-0995209463`, API-key owner. URL pattern corroborated by public console examples (UNVERIFIED: link not clicked through; billing-account access from Matt's browser untested).

## Constraints
- Don't push without Matt's OK; batch commits; `vercel-deployment-guardrails` if touching outside `quick-text/`.
- Install: `swift build -c release` → copy to `/Applications/Quick Text.app/Contents/MacOS/` → `xattr -cr` → `codesign --force --deep --sign 21491F0E64C2044CFA4A8CCF848486A657C5D3B3` (never ad-hoc).
- Preserve `quicktext.dictate.*` UserDefaults (history must not reset). Keep every existing control/behavior (Keychain Save/Test/Remove, 5 Quick Dictate pickers, permission deep links, Reset stats, Sync Now + preview sheet, category CRUD). Bookkeeping off Quick Dictate hot path. One-line status before long test loops.

## Decisions
- Mockups-before-code; approval gate before implementation (Matt's call).
- Billing link is adjunct to in-app estimate, not a replacement; exact URL pinned above.
- Screenshots/meta prompt live in Bullfinch tool dir, not repo, to avoid binary/commit noise.

## Open issues (UNVERIFIED unless noted)
- Whether new Claude session can read the Bullfinch GoogleDrive absolute screenshot paths (permission/sync). Fallback: re-capture via app (Settings sidebar row) or rebuild from source reads.
- Transcription mode is now After take; billing handoff (2026-10-02) recorded realTime — setting changed since; lifetime buckets unaffected.
- "Claude design" = user's term for Claude's design/mockup capability; no repo skill pins it.
- Scrollbar/track-click UI scripting needed for below-fold captures (wheel/keys did not scroll the panel).

## Next steps
1. Read this file + the 3 screenshots + `AGENTS.md`; verify claims against current source/running app; report discrepancies before designing.
2. Produce 2 mockup directions (HTML prototype + SwiftUI element map) for approval.
3. On approval: implement, `swift build`, reinstall/sign per constraints, screenshot new panel top/middle/bottom, run repo tests for touched area.
