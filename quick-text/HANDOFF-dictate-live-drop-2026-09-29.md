# Handoff: Real-time Dictate transcription drops at Stop

## Objective

Diagnose why stopping a Real-time take shows "Real-time transcription dropped — transcribing after take." Done = a Real-time take streams interim words and finalizes from the stream with no fallback notice, or a conclusive root cause with a fix.

## Status

- Finished: takes-overflow fix, "Process Takes" rename, txt Dock icon, Live-as-alternative feature, release binary rebuilt + installed to `/Applications/Quick Text.app` + re-signed (verified). `DictateTests` 42/42 green from a clean build.
- Partly done: Live path ships but is unverified against the live API; first real run hit the fallback branch.
- Not started: diagnosing the drop; nothing committed (all changes uncommitted in working tree).

## Context

- Repo: `/Users/mwy/Library/Mobile Documents/com~apple~CloudDocs/Projects/prompts-library/quick-text` (`mac/QuickTextApp/Sources/QuickTextApp/`).
- Key files: `GeminiLiveClient.swift` (endpoint:13, model:15, setup:36, accumulate:65, parse:74, `GeminiLiveWebSocketDriver`), `TranscriptionMode.swift` (default `.afterTake`), `DictateSession.swift` (`LiveTakeOutcome`:23, `beginLiveCapture`:218, `stopLiveCapture`:300, `pumpLiveTake`:333, `finalizeLiveTake`:366), `DictateView.swift` (recording-card interim text), `SettingsEditor.swift` (Transcription picker), `DictateTests.swift` (6 Live tests + `FakeLiveDriver`).
- Rebuild: `cd mac/QuickTextApp && swift build -c release`; binary at `.build/out/Products/Release/QuickTextApp`; `xattr -cr` it; copy to `/Applications/Quick Text.app/Contents/MacOS/QuickTextApp` (+ repo wrapper same path); copy `DockIcon.png` to `.../Contents/Resources/`; `codesign --force --deep --sign -`.
- Tests (iCloud codesign quirk): `swift build --build-tests`, `xattr -cr` + `codesign --force --sign -` the `.xctest`, run via `xcrun xctest -XCTest DictateTests <bundle>`. `swift test` re-signs and fails; never use it here.
- Key in login Keychain only (`GeminiKeychain`); REST transcribe path is the fallback and was working before this change.

## Constraints

- Never commit/push unless asked. REST path is default and must keep working; Live stays a switchable alternative.
- Durable tests required for behavior changes (`DictateTests`, offline only: no mic/network/Keychain).
- Report facts observed; do not fabricate passing results.

## Decisions

- One mic tap feeds socket (16 kHz PCM), parallel AAC file, and meter — gives a free REST fallback. Rejected: socket-only capture (loses takes on drops).
- Missing API key fails fast in Live instead of recording a doomed take.
- Interim transcript replaces on cumulative prefix else appends (`accumulate`) — handles both server styles.
- Model speech/`outputTranscription` ignored — model text must never pollute the take.
- `stop()` sends turnComplete, waits 3 s, closes; a lost final falls back (safe, possibly premature — see below).
- Fallback notices shown as inline rows; underlying stream error currently discarded in the empty-text branch.

## Open issues

- UNVERIFIED: endpoint/auth/model/field shapes in `GeminiLiveClient` (marked VERIFY in code) — never tested against the live API. Prime suspect.
- Key deduction from the symptom: the "transcribing after take" notice (DictateSession.swift:370) fires only when streamed text is EMPTY, so zero transcript chunks were ever accumulated — points to connect/setup/auth failure or total parse mismatch, not a late final.
- UNVERIFIED whether the fallback REST transcript arrived after the notice.
- Diagnostic gap: empty-text branch drops `outcome.errorMessage`; the real error is unrecoverable after the fact.
- Possible secondary cause: 3 s grace window may close before the final arrives even when streaming worked.

## Next step

1. First: in `finalizeLiveTake` empty-text branch, append `outcome.errorMessage` to the notice so the next repro captures the real error; rebuild, reinstall, reproduce one Real-time take, read the error.
2. Then: verify endpoint/auth/model/fields against the live API reference; fix client; re-run `DictateTests`; manual live run.
3. If streaming works but finals go missing: lengthen the grace window / wait for `isFinal` before closing.
