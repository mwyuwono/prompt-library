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

    /// Low thinking effort keeps text synthesis cost-conscious and latency low.
    func process(masterPrompt: String, transcript: String) async throws -> String {
        let input: [[String: String]] = [
            ["type": "text", "text": masterPrompt + "\n\n--- Transcribed audio ---\n" + transcript]
        ]
        return try await createInteraction(model: Self.processModel, input: input, thinkingLevel: "low")
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

    /// The SDK surfaces `interaction.output_text`; the REST envelope for the
    /// Gemini Interactions API returns a `steps` array with `model_output`
    /// content blocks. We parse `steps`, `outputs`, `output_text`, and
    /// legacy `candidates` defensively.
    static func extractOutputText(from data: Data) throws -> String {
        let json: Any
        do {
            json = try JSONSerialization.jsonObject(with: data)
        } catch {
            throw DictateError.badResponse("not JSON")
        }
        guard let dict = json as? [String: Any] else {
            throw DictateError.badResponse("top-level JSON is not an object")
        }

        // 1. Direct output_text
        if let text = dict["output_text"] as? String { return text }
        if let interaction = dict["interaction"] as? [String: Any],
           let text = interaction["output_text"] as? String { return text }

        // 2. Gemini Interactions API: steps array
        if let steps = dict["steps"] as? [[String: Any]] {
            let modelSteps = steps.filter { ($0["type"] as? String) == "model_output" }
            let candidateSteps = modelSteps.isEmpty ? steps.filter {
                let t = $0["type"] as? String
                return t != "thought" && t != "user_input"
            } : modelSteps

            var texts: [String] = []
            for step in candidateSteps {
                if let contents = step["content"] as? [[String: Any]] {
                    for block in contents {
                        let blockType = block["type"] as? String
                        if blockType == nil || blockType == "text" {
                            if let text = block["text"] as? String, !text.isEmpty {
                                texts.append(text)
                            }
                        }
                    }
                } else if let contents = step["content"] as? [String] {
                    texts.append(contents.joined(separator: "\n"))
                } else if let contentStr = step["content"] as? String, !contentStr.isEmpty {
                    texts.append(contentStr)
                } else if let text = step["text"] as? String, !text.isEmpty {
                    texts.append(text)
                }
            }
            if !texts.isEmpty {
                return texts.joined(separator: "\n")
            }
        }

        // 3. Alternate outputs array
        if let outputs = dict["outputs"] as? [[String: Any]] {
            var outputTexts: [String] = []
            for out in outputs {
                let outType = out["type"] as? String
                if outType == nil || outType == "text" {
                    if let text = out["text"] as? String, !text.isEmpty {
                        outputTexts.append(text)
                    }
                }
            }
            if !outputTexts.isEmpty {
                return outputTexts.joined(separator: "\n")
            }
        }

        // 4. Legacy generateContent candidates array
        if let candidates = dict["candidates"] as? [[String: Any]],
           let content = candidates.first?["content"] as? [String: Any],
           let parts = content["parts"] as? [[String: Any]],
           let text = parts.first?["text"] as? String {
            return text
        }

        let keys = dict.keys.sorted().joined(separator: ", ")
        throw DictateError.badResponse("no output text found in response; top-level keys: \(keys)")
    }
}
