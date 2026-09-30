# Handoff: Real-time Dictate still drops — "socket is not connected" (part 2)

Supersedes `HANDOFF-dictate-live-drop-2026-09-29.md` (steps 1 done; its step 2–3 still open).

## Objective

Fix Real-time take falling back with "socket is not connected". Done = a Real-time take streams interim words and finalizes from the stream with no fallback notice, or a conclusive root cause with a fix.

## Status

- Done: fallback notice appends `outcome.errorMessage` (`DictateSession.finalizeLiveTake`); handshake fix below; `DictateTests` 45/45 green; release rebuilt, installed to `/Applications/Quick Text.app` (+ repo wrapper copy), re-signed ~21:35 local 2026-09-29.
- Done: handshake fix — `LiveSocketOpener` rendezvous in `GeminiLiveClient.swift`: dedicated `URLSession` with delegate, `start()` waits for `didOpen` (10 s timeout → `DictateError.network(URLError(.timedOut))`) before setup send; `stop()` invalidates session; `waitForOpen` resumes continuation on task cancel (bare `CheckedContinuation` ignores cancellation and deadlocked the timeout test — fixed, both new tests pass).
- NOT fixed: Matt repro after reinstall still reports realtime can't complete, socket not connected.
- Nothing committed (all changes uncommitted, branch `dictate-full-page`).

## Context

- Repo: `/Users/mwy/Library/Mobile Documents/com~apple~CloudDocs/Projects/prompts-library/quick-text`; sources `mac/QuickTextApp/Sources/QuickTextApp/`; tests `mac/QuickTextApp/Tests/QuickTextAppTests/DictateTests.swift`.
- Uncommitted: `DictateSession.swift` (notice), `GeminiLiveClient.swift` (untracked: opener + driver rework), `TranscriptionMode.swift` (untracked), `DictateTests.swift` (+3 tests), `App/DictateView/SettingsEditor.swift`, corpus json + baks, both `QuickTextApp` binaries, `DockIcon.png`.
- Rebuild: `cd mac/QuickTextApp && swift build -c release`; binary `.build/out/Products/Release/QuickTextApp`; `xattr -cr`; copy to `/Applications/Quick Text.app/Contents/MacOS/QuickTextApp` + repo wrapper same path; `codesign --force --deep --sign -`.
- Tests (iCloud quirk): `swift build --build-tests` (codesign step fails, ignore); `xattr -cr` + `codesign --force --sign -` the `.xctest`; `xcrun xctest -XCTest DictateTests <bundle>`. Never `swift test`. Run new/single tests with a hard kill deadline (a hung test strands the shell session; terminate via `bash_input`).
- Key in login Keychain only; REST path is default and working.

## Constraints

- Never commit/push unless asked. REST default must keep working; Live stays a switchable alternative.
- Durable offline-only tests required for behavior changes (`DictateTests`; no mic/network/Keychain).
- Report observed facts only.

## Decisions

- Wait-for-`didOpen` chosen over send-retry: deterministic; a dead handshake surfaces as a timeout error in the same notice instead of masking it.
- 10 s open timeout: recording continues on the parallel file meanwhile, so slow open costs latency, never audio.
- Error-source tagging deferred (see Next step 1).

## Open issues

- UNVERIFIED: whether Matt's repro ran the 21:35 binary (relaunch after reinstall unconfirmed; stale-process run would show the old code path exactly as reported).
- UNVERIFIED: which throw site produced the message — setup `send()`, open timeout, or `receiveLoop` `.error` event. `outcome.errorMessage` records no stage; all three converge on the same notice text.
- UNVERIFIED: endpoint/auth/model/field shapes (`GeminiLiveClient` VERIFY markers) against the live API reference. If the handshake itself is rejected (wrong path/auth), no client-side timing fix helps; ENOTCONN at send is still consistent with a failed handshake.
- New untracked file `corpus/quick-text.json 2.bak` appeared (not created by agent; left alone).

## Next step

1. First: confirm the running app is the 21:35 build (compare `md5` of `/Applications/Quick Text.app/Contents/MacOS/QuickTextApp` vs `.build/out/Products/Release/QuickTextApp`; ensure quit + reopen after install), then one Real-time take. If the error persists:
2. Tag the error stage: prefix `outcome.errorMessage` at each producer (`open-timeout:`, `setup-send:`, `receive:`) in `pumpLiveTake`/`start()`; add offline test; rebuild, reinstall, one live run, read stage.
3. Then: verify endpoint/auth/model/fields against the live API reference; fix; re-run `DictateTests`; manual live run.
