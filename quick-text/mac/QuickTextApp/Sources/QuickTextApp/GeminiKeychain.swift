import Foundation
import Security

/// Machine-local storage for the Gemini API key (Dictate mode). The key never
/// enters the corpus JSON or Bullfinch — Keychain only.
enum GeminiKeychain {
    static let service = "com.weaveryuwono.quicktext"
    static let account = "gemini-api-key"

    static var hasKey: Bool {
        (try? load()) != nil
    }

    static func load() throws -> String {
        var item: CFTypeRef?
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess, let data = item as? Data, let key = String(data: data, encoding: .utf8), !key.isEmpty else {
            throw KeychainError.notFound
        }
        return key
    }

    static func save(_ key: String) throws {
        let trimmed = key.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { throw KeychainError.emptyKey }
        let data = Data(trimmed.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        var status = SecItemAdd((query.merging([kSecValueData as String: data]) { _, new in new }) as CFDictionary, nil)
        if status == errSecDuplicateItem {
            status = SecItemUpdate(query as CFDictionary, [kSecValueData as String: data] as CFDictionary)
        }
        guard status == errSecSuccess else { throw KeychainError.writeFailed(status) }
    }

    static func delete() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.writeFailed(status)
        }
    }
}

enum KeychainError: LocalizedError {
    case notFound
    case emptyKey
    case writeFailed(OSStatus)

    var errorDescription: String? {
        switch self {
        case .notFound:
            return "No Gemini API key saved. Add it in Settings > Dictation."
        case .emptyKey:
            return "The API key is empty."
        case .writeFailed(let status):
            return "Keychain write failed (OSStatus \(status))."
        }
    }
}
