import Foundation

/// Thin REST client for the Gemini Interactions API
/// (https://ai.google.dev/gemini-api/docs/interactions-overview), verified
/// against the live audio-transcription and audio-understanding docs.
///
/// - Transcription uses `gemini-3.8-flash` inline audio with low thinking effort.
/// - Processing uses `gemini-3.8-flash` to synthesize a polished result from the
///   joined transcript, using the selected `voice-process` master prompt.

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

public struct GeminiResponse: Equatable {
    public let text: String
    public let usage: TokenUsage

    public init(text: String, usage: TokenUsage) {
        self.text = text
        self.usage = usage
    }
}

struct GeminiClient {
    let apiKey: String

    static let endpoint = URL(string: "https://generativelanguage.googleapis.com/v1beta/interactions")!
    static let transcribeModel = "gemini-3.8-flash"
    static let processModel = "gemini-3.8-flash"

    /// Transcribes a voice take using `gemini-3.8-flash` inline audio with low thinking effort.
    func transcribe(audioData: Data, mimeType: String) async throws -> GeminiResponse {
        let input: [[String: Any]] = [
            ["type": "text", "text": "Generate a transcript of the speech. Return only the transcript, no commentary."],
            ["type": "audio", "data": audioData.base64EncodedString(), "mime_type": mimeType]
        ]
        return try await createInteraction(
            model: Self.transcribeModel,
            input: input,
            generationConfig: ["thinking_level": "low"]
        )
    }

    /// Low thinking effort keeps text synthesis cost-conscious and latency low.
    func process(masterPrompt: String, transcript: String) async throws -> GeminiResponse {
        let input: [[String: String]] = [
            ["type": "text", "text": masterPrompt + "\n\n--- Transcribed audio ---\n" + transcript]
        ]
        return try await createInteraction(
            model: Self.processModel,
            input: input.map { $0 as [String: Any] },
            generationConfig: ["thinking_level": "low"]
        )
    }

    /// Minimal text round-trip used by Settings > Dictation to verify a key.
    func ping() async throws -> String {
        let res = try await createInteraction(
            model: Self.processModel,
            input: [["type": "text", "text": "Reply with exactly: OK"]],
            generationConfig: ["thinking_level": "low"]
        )
        return res.text
    }

    func createInteraction(
        model: String,
        input: [[String: Any]],
        generationConfig: [String: Any]? = nil
    ) async throws -> GeminiResponse {
        var body: [String: Any] = ["model": model, "input": input]
        if let generationConfig {
            body["generation_config"] = generationConfig
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
        return try Self.extractResponse(from: data)
    }

    static func extractResponse(from data: Data) throws -> GeminiResponse {
        let text = try extractOutputText(from: data)
        let usage = extractTokenUsage(from: data)
        return GeminiResponse(text: text, usage: usage)
    }

    static func extractTokenUsage(from data: Data) -> TokenUsage {
        guard let json = try? JSONSerialization.jsonObject(with: data),
              let dict = json as? [String: Any] else {
            return .zero
        }
        return extractTokenUsage(from: dict)
    }

    static func extractTokenUsage(from dict: [String: Any]) -> TokenUsage {
        func usage(in container: [String: Any]) -> [String: Any]? {
            for key in ["usage", "usage_metadata", "usageMetadata"] {
                if let value = container[key] as? [String: Any] { return value }
            }
            return nil
        }

        let interaction = dict["interaction"] as? [String: Any]
        let response = dict["response"] as? [String: Any]
        let responseInteraction = response?["interaction"] as? [String: Any]
        var usageDict = usage(in: dict)
            ?? interaction.flatMap(usage(in:))
            ?? response.flatMap(usage(in:))
            ?? responseInteraction.flatMap(usage(in:))

        if usageDict == nil {
            let nestedSteps = (dict["steps"] as? [[String: Any]])
                ?? ((dict["interaction"] as? [String: Any])?["steps"] as? [[String: Any]])
                ?? ((dict["response"] as? [String: Any])?["steps"] as? [[String: Any]])
            for step in (nestedSteps ?? []).reversed() {
                if let u = (step["usage"] as? [String: Any])
                    ?? (step["usage_metadata"] as? [String: Any])
                    ?? (step["usageMetadata"] as? [String: Any]) {
                    usageDict = u
                    break
                }
            }
        }

        let target = usageDict ?? dict

        func intValue(from source: [String: Any], keys: [String]) -> Int? {
            for key in keys {
                if let val = source[key] as? Int {
                    return val
                } else if let num = source[key] as? NSNumber {
                    return num.intValue
                } else if let str = source[key] as? String, let val = Int(str) {
                    return val
                }
            }
            return nil
        }

        var input = intValue(from: target, keys: [
            "total_input_tokens", "input_tokens", "prompt_tokens",
            "promptTokenCount", "prompt_token_count", "inputTokens", "inputTokenCount"
        ]) ?? 0

        // Fallback for input_tokens_by_modality array
        if input == 0, let modalities = target["input_tokens_by_modality"] as? [[String: Any]] {
            let modalitySum = modalities.compactMap { entry -> Int? in
                if let value = entry["tokens"] as? Int { return value }
                if let value = entry["tokens"] as? NSNumber { return value.intValue }
                if let value = entry["tokens"] as? String { return Int(value) }
                return nil
            }.reduce(0, +)
            if modalitySum > 0 {
                input = modalitySum
            }
        }

        var output = intValue(from: target, keys: [
            "total_output_tokens", "output_tokens", "completion_tokens",
            "candidatesTokenCount", "candidates_token_count", "outputTokens", "outputTokenCount"
        ]) ?? 0

        let thought = intValue(from: target, keys: [
            "total_thought_tokens", "thought_tokens", "thoughtsTokenCount",
            "thoughts_token_count", "thoughtTokens", "thoughtTokenCount"
        ]) ?? 0

        let total = intValue(from: target, keys: [
            "total_tokens", "totalTokenCount", "total_token_count", "totalTokens"
        ])

        // In Gemini models (including gemini-3.8-flash), thinking/thought tokens are billed as output tokens.
        // In the Interactions API response, `total_output_tokens` reports visible candidate tokens,
        // while `total_thought_tokens` reports reasoning tokens, such that:
        // total_input_tokens + total_output_tokens + total_thought_tokens == total_tokens.
        // We include thought tokens in outputTokens so that:
        // 1) totalTokens equals total_tokens, and
        // 2) cost estimation calculates thinking tokens at the output token rate.
        if thought > 0 {
            if let total, input + output + thought == total {
                output += thought
            } else if output < thought {
                output += thought
            } else if let total, input + output < total {
                output = max(output + thought, total - input)
            }
        } else if let total, input + output < total {
            if output == 0 && input > 0 {
                output = total - input
            } else if input == 0 && output > 0 {
                input = total - output
            }
        }

        return TokenUsage(inputTokens: input, outputTokens: output)
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
