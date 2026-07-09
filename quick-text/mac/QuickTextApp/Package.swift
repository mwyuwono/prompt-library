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
        .executableTarget(
            name: "QuickTextApp"
        ),
        // @testable import of an executable target works on Apple platforms'
        // toolchains (SwiftPM, macOS) — **verify** on this project's toolchain;
        // if it doesn't resolve, split QuickTextApp into a library target plus a
        // thin executable wrapper instead.
        .testTarget(name: "QuickTextAppTests", dependencies: ["QuickTextApp"])
    ],
    swiftLanguageModes: [.v5]
)
