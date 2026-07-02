// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "QuickTextApp",
    platforms: [.macOS(.v14)],
    products: [
        .executable(name: "QuickTextApp", targets: ["QuickTextApp"])
    ],
    dependencies: [],
    targets: [
        .executableTarget(name: "QuickTextApp")
    ],
    swiftLanguageVersions: [.v5]
)
