import SwiftUI

enum QuickTextDesign {
    static let sectionRadius: CGFloat = 16
    static let controlRadius: CGFloat = 11
    static let hairlineOpacity: CGFloat = 0.12
}

extension View {
    func quickTextSectionSurface() -> some View {
        self
            .padding(16)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: QuickTextDesign.sectionRadius))
            .overlay(
                RoundedRectangle(cornerRadius: QuickTextDesign.sectionRadius)
                    .stroke(Color.primary.opacity(QuickTextDesign.hairlineOpacity), lineWidth: 1)
            )
    }

    func quickTextFieldSurface() -> some View {
        self
            .padding(.horizontal, 11)
            .padding(.vertical, 8)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: QuickTextDesign.controlRadius))
            .overlay(
                RoundedRectangle(cornerRadius: QuickTextDesign.controlRadius)
                    .stroke(Color.primary.opacity(0.13), lineWidth: 1)
            )
    }

    func quickTextPill() -> some View {
        self
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(.ultraThinMaterial, in: Capsule())
            .overlay(Capsule().stroke(Color.primary.opacity(0.11), lineWidth: 1))
    }
}
