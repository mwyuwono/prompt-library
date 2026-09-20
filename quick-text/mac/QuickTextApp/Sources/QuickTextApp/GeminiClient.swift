import Foundation

/// Thin REST client for the Gemini Interactions API
/// (https://ai.google.dev/gemini-api/docs/interactions-overview), verified
/// against the live audio-transcription and audio-understanding docs.
///
/// - Transcription sends each take's audio inline (base64, under the 20 MB
///   request cap — voice takes are far below it) with `gemini-3.8-flash`.
/// - Processing sends the joined transcript plus the selected `voice-process`
///   master prompt, also with `gemini-3.8-flash`.
enum DictateError: LocalizedError {
    case missingAPIKey
    case network(Error)
    case apiError(status: Int, message: String)
    case badResponse(String)

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "No Gemini API key saved. Add it in Settings > Dictation."
        case .network(let error):
            return "Network error: \(error.localizedDescription)"
        case .apiError(let status, let message):
            return message.isEmpty ? "Gemini API error (HTTP \(status))." : "Gemini API error (HTTP \(status)): \(message)"
        case .badResponse(let detail):
            return "Unexpected Gemini response: \(detail)"
        }
    }
}

struct GeminiClient {
    let apiKey: String

    static let endpoint = URL(string: "https://generativelanguage.googleapis.com/v1beta/interactions")!
    static let transcribeModel = "gemini-3.8-flash"
    static let processModel = "gemini-3.8-flash"

    /// Low thinking effort keeps per-take transcription fast and cheap.
    func transcribe(audioData: Data, mimeType: String) async throws -> String {
        let input: [[String: String]] = [
            ["type": "text", "text": "Generate a transcript of the speech. Return only the transcript, no commentary."],
            ["type": "audio", "data": audioData.base64EncodedString(), "mime_type": mimeType]
        ]
        return try await createInteraction(model: Self.transcribeModel, input: input, thinkingLevel: "low")
    }

    func process(masterPrompt: String, transcript: String) async throws -> String {
        let input: [[String: String]] = [
            ["type": "text", "text": masterPrompt + "\n\n--- Transcribed audio ---\n" + transcript]
        ]
        return try await createInteraction(model: Self.processModel, input: input, thinkingLevel: "medium")
    }

    /// Minimal text round-trip used by Settings > Dictation to verify a key.
    func ping() async throws -> String {
        try await createInteraction(
            model: Self.processModel,
            input: [["type": "text", "text": "Reply with exactly: OK"]],
            thinkingLevel: "low"
        )
    }

    func createInteraction(model: String, input: [[String: String]], thinkingLevel: String?) async throws -> String {
        var body: [String: Any] = ["model": model, "input": input]
        if let thinkingLevel {
            body["generation_config"] = ["thinking_level": thinkingLevel]
        }
        var request = URLRequest(url: Self.endpoint)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "x-goog-api-key")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 120
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw DictateError.network(error)
        }
        guard let http = response as? HTTPURLResponse else {
            throw DictateError.badResponse("non-HTTP response")
        }
        guard (200..<300).contains(http.statusCode) else {
            let message = String(data: data, encoding: .utf8).map { String($0.prefix(500)) } ?? ""
            throw DictateError.apiError(status: http.statusCode, message: message)
        }
        return try Self.extractOutputText(from: data)
    }

    /// The SDK surfaces `interaction.output_text`; the REST envelope shape for
    /// that field is probed defensively so an API-side rename surfaces as a
    /// readable error instead of an empty result.
    static func extractOutputText(from data: Data) throws -> String {
        let json: Any
        do {
            json = try JSONSerialization.jsonObject(with: data)
        } catch {
            throw DictateError.badResponse("not JSON")
        }
        if let dict = json as? [String: Any] {
            if let text = dict["output_text"] as? String { return text }
            if let interaction = dict["interaction"] as? [String: Any],
               let text = interaction["output_text"] as? String { return text }
            if let candidates = dict["candidates"] as? [[String: Any]],
               let content = candidates.first?["content"] as? [String: Any],
               let parts = content["parts"] as? [[String: Any]],
               let text = parts.first?["text"] as? String { return text }
            let keys = dict.keys.sorted().joined(separator: ", ")
            throw DictateError.badResponse("no output_text; top-level keys: \(keys)")
        }
        throw DictateError.badResponse("top-level JSON is not an object")
    }
}
