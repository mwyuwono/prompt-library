import Foundation
import Combine

/// Preserve the raw JSON so mobile edits never discard Mac-only or future fields.
struct MobileLibraryDocument {
    private(set) var raw: [String: Any]
    var corpus: QuickTextCorpus { get throws { try JSONDecoder.quickText.decode(QuickTextCorpus.self, from: data()) } }

    init(data: Data) throws {
        guard data.count <= 20_000_000,
              let object = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw MobileError.message("Choose a Quick Text JSON library smaller than 20 MB.")
        }
        raw = object
        let decoded = try corpus
        guard decoded.version == 1 else { throw MobileError.message("This library version is not supported.") }
        guard Set(decoded.phrases.map(\.id)).count == decoded.phrases.count,
              Set(decoded.categories.map(\.id)).count == decoded.categories.count,
              Set((decoded.variables ?? []).map(\.id)).count == (decoded.variables ?? []).count,
              decoded.phrases.allSatisfy({ phrase in !phrase.id.isEmpty && decoded.categories.contains(where: { $0.id == phrase.categoryId }) }) else {
            throw MobileError.message("The library contains duplicate IDs or missing collections.")
        }
    }

    func data() throws -> Data { try JSONSerialization.data(withJSONObject: raw, options: [.prettyPrinted, .sortedKeys]) }

    mutating func upsert(_ phrase: Phrase) throws {
        var rows = raw["phrases"] as? [[String: Any]] ?? []
        let encoded = try JSONEncoder.quickText.encode(phrase)
        let fields = try JSONSerialization.jsonObject(with: encoded) as! [String: Any]
        if let index = rows.firstIndex(where: { $0["id"] as? String == phrase.id }) {
            let oldValue = rows[index]["value"] as? String
            rows[index].merge(fields) { _, new in new }
            if phrase.summary == nil { rows[index].removeValue(forKey: "summary") }
            if oldValue != phrase.value { rows[index].removeValue(forKey: "atoms") }
        } else { rows.append(fields) }
        raw["phrases"] = rows
        raw["updatedAt"] = ISO8601DateFormatter().string(from: Date())
    }

    mutating func toggleFavorite(_ id: String) throws {
        guard var phrase = try corpus.phrases.first(where: { $0.id == id }) else { return }
        phrase.favorite.toggle()
        phrase.updatedAt = Date()
        try upsert(phrase)
    }
}

enum MobileError: LocalizedError {
    case message(String)
    var errorDescription: String? { if case .message(let text) = self { return text }; return nil }
}

@MainActor final class MobileLibrary: ObservableObject {
    @Published private(set) var corpus = QuickTextCorpus.empty
    @Published var error: String?
    @Published private(set) var writable = true
    private var document: MobileLibraryDocument?
    let fileURL: URL

    init(directory: URL? = nil) {
        let root = directory ?? FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        fileURL = root.appendingPathComponent("quick-text.json")
        do {
            try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
            let source = FileManager.default.fileExists(atPath: fileURL.path) ? fileURL : Bundle.main.url(forResource: "sample-library", withExtension: "json")
            if let source {
                let loaded = try MobileLibraryDocument(data: Data(contentsOf: source))
                document = loaded
                corpus = try loaded.corpus
            }
        } catch { self.error = "Library could not be opened. The original file has been preserved. \(error.localizedDescription)"; writable = false }
    }

    func save(_ phrase: Phrase) {
        do {
            guard writable, var next = document else { throw MobileError.message("Import a valid library before editing.") }
            try next.upsert(phrase)
            try commit(next)
        } catch { self.error = error.localizedDescription }
    }

    func toggleFavorite(_ id: String) {
        do {
            guard writable, var next = document else { return }
            try next.toggleFavorite(id)
            try commit(next)
        } catch { self.error = error.localizedDescription }
    }

    func importLibrary(_ next: MobileLibraryDocument) throws {
        // Keep the last on-device library as a local recovery file before replacing it.
        if FileManager.default.fileExists(atPath: fileURL.path) {
            let backup = fileURL.deletingLastPathComponent().appendingPathComponent("library-backup-\(UUID().uuidString).json")
            try FileManager.default.copyItem(at: fileURL, to: backup)
        }
        try commit(next)
        writable = true
    }

    private func commit(_ next: MobileLibraryDocument) throws {
        let decoded = try next.corpus
        var options: Data.WritingOptions = [.atomic]
        #if os(iOS)
        options.insert(.completeFileProtection)
        #endif
        try next.data().write(to: fileURL, options: options)
        document = next
        corpus = decoded
    }

    func exportData() throws -> Data {
        guard let document else { throw MobileError.message("No library to export.") }
        return try document.data()
    }
}
