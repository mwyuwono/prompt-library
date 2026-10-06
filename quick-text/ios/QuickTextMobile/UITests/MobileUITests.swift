import XCTest

final class MobileUITests: XCTestCase {
    func testLibraryVariableCopyAndMissingKey() {
        let app = XCUIApplication()
        app.launch()
        let phrase = app.buttons["mobile-welcome"]
        XCTAssertTrue(phrase.waitForExistence(timeout: 15))
        capture("Library")
        phrase.tap()
        let fill = app.textFields["fill-name"]
        XCTAssertTrue(fill.waitForExistence(timeout: 5))
        fill.tap(); fill.typeText("Matt")
        XCTAssertTrue(app.staticTexts["Hi Matt, thank you for your help."].exists)
        app.buttons["copy-phrase"].tap()
        XCTAssertTrue(app.buttons["Copied"].exists)
        capture("Phrase")
        app.buttons["Done"].tap()
        app.tabBars.buttons["Dictate"].tap()
        XCTAssertTrue(app.buttons["record-take"].waitForExistence(timeout: 5))
        capture("Dictate")
        app.buttons["record-take"].tap()
        XCTAssertTrue(app.alerts["Dictation"].waitForExistence(timeout: 5))
        app.alerts.buttons["OK"].tap()
        app.tabBars.buttons["Settings"].tap()
        XCTAssertTrue(app.secureTextFields["api-key"].waitForExistence(timeout: 5))
        capture("Settings")
    }
    private func capture(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
