# Handoff: Dictate Real-time / Gemini Live API contract

## Objective

Make the optional Real-time Dictate path complete a streamed take without REST fallback, while preserving the working REST default and fallback.

## Status

- Current user reproduction after reinstall: fallback; notice: `The operation couldn’t be completed. Socket is not connected`.
- Official Live API documentation confirms the feature is viable for live transcription/dictation; this is an implementation-contract problem, not a product-capability problem.
- `DictateTests`: 45 executed, 0 failures, 2026-09-29 21:48 local. Offline coverage only; no live success proved.
- `/Applications/Quick Text.app` was quit, overwritten from the 21:35 release artifact, ad-hoc re-signed, verified, and relaunched. Raw executable MD5 differs from the build artifact after signing; this is not a valid identity check post-signing. **UNVERIFIED:** the user reproduction used that relaunched process.

## Relevant context

- Canonical current documentation:
  - https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
  - https://ai.google.dev/api/live
  - https://ai.google.dev/gemini-api/docs/live-api/capabilities
- Google coding-agent resource: https://ai.google.dev/gemini-api/docs/coding-agents
  - Relevant skill: `gemini-live-api-dev` (Live WebSockets, streaming audio/video/text, VAD/barge-in).
  - Upstream install command: `npx skills add google-gemini/gemini-skills --skill gemini-live-api-dev --global`.
  - Docs MCP endpoint: `https://gemini-api-docs-mcp.dev`; upstream installer: `npx add-mcp "https://gemini-api-docs-mcp.dev"`.
  - **UNVERIFIED:** neither the upstream skill nor Gemini Docs MCP is installed in this Codex environment.
- Documentation contract deltas observed against `GeminiLiveClient.swift`:
  - Endpoint is documented only as `...v1beta.GenerativeService.BidiGenerateContent`; client uses `v1alpha`.
  - Standard API-key authentication is documented as `?key=API_KEY`; client sends an `x-goog-api-key` header. **UNVERIFIED:** whether the header remains accepted by the endpoint.
  - Current documented Live model is `models/gemini-3.8-live`; client requests `models/gemini-3.8-flash`.
  - Client must wait for server `setupComplete` before any realtime input; current driver returns after sending setup and can send microphone audio before it receives `setupComplete`.
  - `realtimeInput.mediaChunks` is deprecated; send one `realtimeInput.audio` Blob instead.
  - The API emits `interimInputTranscription` during speech and `inputTranscription` independently; client parses only the latter, so interim UI cannot work as designed even on a healthy stream.
  - With automatic activity detection (default), microphone shutdown is represented by `realtimeInput.audioStreamEnd`; client instead sends `clientContent.turnComplete`, whose documented purpose is conversation-content generation.
  - Official input-transcription examples configure `responseModalities: ["AUDIO"]`; client configures `["TEXT"]`. **UNVERIFIED:** whether TEXT is accepted for the current Live model; do not assume it is the socket-close cause.

## Constraints

- No commit, push, provider-setting changes, API-key changes, package installs, or MCP/skill installation without explicit user authorization.
- Preserve REST as default and fallback; Live remains optional.
- Offline-only deterministic `DictateTests` for behavioral changes; no microphone, network, or Keychain in tests.
- Do not transmit user microphone audio without an explicit, contemporaneous test phrase and destination authorization.
- Do not claim runtime success from compilation, source inspection, or unit tests.

## Decisions

- Treat `v1beta` endpoint, query-key authentication, `gemini-3.8-live`, `setupComplete` gate, `audio`, `audioStreamEnd`, and interim-transcription parsing as the first correction set; no further timing-only fix first.
- Error-stage tagging remains necessary for later diagnosis but is secondary to bringing the protocol onto the documented contract.
- Do not install `gemini-live-api-dev` or Docs MCP in this handoff; use official web docs unless the user authorizes installation.

## Open issues

- **UNVERIFIED:** exact server close/error frame; current error reporting collapses setup send, close, and receive failure.
- **UNVERIFIED:** API key eligibility, endpoint header behavior, and current model availability for this account.
- **UNVERIFIED:** whether setup succeeds after the documented changes and whether a stream finalizes before the REST fallback timer/path.

## Next steps

1. In `GeminiLiveClient.swift`, align the raw WebSocket client to the documented v1beta contract: endpoint + `?key=`, `models/gemini-3.8-live`, wait for `setupComplete`, `realtimeInput.audio`, `audioStreamEnd`, and `interimInputTranscription` parsing. Add offline fixture tests covering setup-complete gating and interim/final frames.
2. Add distinct error-stage labels for open timeout, setup send/setup rejection, realtime send, and receive/close; preserve server close code/reason when exposed by `URLSessionWebSocketTask`.
3. Run the project-prescribed `DictateTests` bundle, rebuild/reinstall/re-sign, then request one explicitly authorized non-sensitive mic phrase streamed to Gemini Live API; record interim text, final text, and any stage-tagged failure.
