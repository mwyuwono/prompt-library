import SwiftUI

func stringBinding(_ source: Binding<String?>, replacingNilWith fallback: String) -> Binding<String> {
    Binding<String>(
        get: { source.wrappedValue ?? fallback },
        set: { source.wrappedValue = $0 }
    )
}

func intBinding(_ source: Binding<Int?>, replacingNilWith fallback: Int) -> Binding<Int> {
    Binding<Int>(
        get: { source.wrappedValue ?? fallback },
        set: { source.wrappedValue = $0 }
    )
}

extension Color {
    init(hex: String) {
        let value = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: value).scanHexInt64(&int)
        let red = Double((int >> 16) & 0xff) / 255
        let green = Double((int >> 8) & 0xff) / 255
        let blue = Double(int & 0xff) / 255
        self.init(red: red, green: green, blue: blue)
    }

    /// For round-tripping a `ColorPicker` selection (including the system color
    /// panel's palettes/crayons/sliders tabs) back into our hex-string storage.
    var hexString: String {
        let rgb = NSColor(self).usingColorSpace(.deviceRGB) ?? NSColor(self)
        let r = Int((rgb.redComponent * 255).rounded())
        let g = Int((rgb.greenComponent * 255).rounded())
        let b = Int((rgb.blueComponent * 255).rounded())
        return String(format: "#%02X%02X%02X", r, g, b)
    }

    var readableForeground: Color {
        let rgb = NSColor(self).usingColorSpace(.deviceRGB) ?? NSColor(self)
        let luminance = (0.2126 * rgb.redComponent) + (0.7152 * rgb.greenComponent) + (0.0722 * rgb.blueComponent)
        return luminance > 0.58 ? .black : .white
    }
}

extension String {
    var fourCharCodeValue: FourCharCode {
        var result: FourCharCode = 0
        for scalar in unicodeScalars {
            result = (result << 8) + FourCharCode(scalar.value)
        }
        return result
    }
}

