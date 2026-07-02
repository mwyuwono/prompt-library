// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "QuickTextApp",
    platforms: [.macOS(.v26)],
    products: [
        .executable(name: "QuickTextApp", targets: ["QuickTextApp"])
    ],
    dependencies: [],
    targets: [
        .executableTarget(name: "QuickTextApp")
    ],
    swiftLanguageModes: [.v5]
)
