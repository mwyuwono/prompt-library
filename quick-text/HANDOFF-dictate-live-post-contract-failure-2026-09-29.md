# Handoff: Dictate Live failure after v1beta correction

## Objective

- Identify the remaining Real-time Dictate failure; complete a streamed take without REST fallback. Preserve REST default and fallback.

## Status

- Next step 1 of `HANDOFF-dictate-live-api-contract-2026-09-29.md` was implemented in the uncommitted `GeminiLiveClient.swift` and `DictateTests.swift`: v1beta URL with query key, `models/gemini-3.8-live`, `AUDIO` response modality, `setupComplete` gate, queued/ordered pre-setup audio, `realtimeInput.audio`, `audioStreamEnd`, interim/final input-transcription parsing.
- Offline `DictateTests`: 46 executed, 0 failures, after the final queue-race correction at 21:59 local. `swift build --build-tests` compiled but hit the documented iCloud codesign metadata error; `xattr -cr .build`, manual `.xctest` signing, then `swift test --skip-build --filter DictateTests` passed.
- Release build succeeded. `/Applications/Quick Text.app` was quit, executable replaced from `.build/release/QuickTextApp`, xattrs cleared, ad-hoc signed, signature verified, and relaunched. Running PID `37109` and installed executable mtime `2026-09-29 22:04:59`; installed executable strings include the v1beta endpoint and Live model. Repo wrapper executable was not replaced in this install.
- Matt's first test after this reinstall failed: UI said “Real-time transcription dropped.” **UNVERIFIED:** exact full notice, whether it included parenthesized error detail, whether interim text appeared, and whether PID `37109` handled that take. No recorded server close/error frame.
- No commit or push. No agent-initiated microphone or network test.

## Relevant context

- Read `HANDOFF-dictate-live-api-contract-2026-09-29.md` for Google documentation links and prior protocol diagnosis; its Next step 1 is now done.
- Source driver currently waits indefinitely for `setupComplete` after setup send; setup rejection/close and receive errors have no distinct stage label. `sendAudio` failures yield a generic event. `URLSessionWebSocketTask` close code/reason are not surfaced.
- Current failure confirms offline fixtures, release compilation, and successful app launch do not establish Live API success.

## Constraints

- Inherit prior handoff constraints. No new authorization for commits, push, provider/key changes, package installation, or agent-driven microphone transmission.

## Decisions

- Diagnose the new failure by transport stage before another protocol change. Keep the v1beta correction set pending evidence.
- Do not treat Matt's shortened UI description as an exact error string.

## Open issues

- **UNVERIFIED:** failure stage: open, setup send, setup acknowledgement, realtime send, receive, or close.
- **UNVERIFIED:** server close code/reason; API-key/model eligibility; whether the Live session reached `setupComplete` or produced interim/final frames.
- **UNVERIFIED:** whether the 3-second post-`audioStreamEnd` grace window is sufficient after a healthy stream.

## Next steps

1. Add distinct, user-visible diagnostic stage labels for open timeout, setup send, setup acknowledgement/rejection/timeout, realtime send, and receive/close. Include WebSocket close code/reason when available; bound setup acknowledgement wait. Add deterministic offline fixtures for stage mapping and timeout/close paths; retain REST default/fallback.
2. Run `DictateTests` with the iCloud signing workaround; build release, reinstall, re-sign, relaunch, verify the installed executable and process.
3. Request one explicitly authorized nonsensitive test phrase and Gemini Live destination before microphone transmission. Capture the exact full notice, stage label, interim/final text, and close code/reason; fix the observed failure and repeat.
