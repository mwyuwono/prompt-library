import XCTest
@testable import QuickTextApp

/// Double-tap Right Command recognizer without CGEvents or permissions.
final class RightCommandDoubleTapTests: XCTestCase {

    func testDoubleTapFires() {
        var r = RightCommandDoubleTapRecognizer()
        r.down(at: 10.0)
        r.up(at: 10.1)
        r.down(at: 10.2)
        XCTAssertTrue(r.up(at: 10.3))
        XCTAssertEqual(r.phase, .idle)
    }

    func testSingleTapDoesNotFire() {
        var r = RightCommandDoubleTapRecognizer()
        r.down(at: 10.0)
        XCTAssertFalse(r.up(at: 10.1))
        XCTAssertEqual(r.phase, .waitingSecondTap(firstUpAt: 10.1))
    }

    func testSlowPairDoesNotFireSecondBecomesNewFirst() {
        var r = RightCommandDoubleTapRecognizer(doubleTapThreshold: 0.35)
        r.down(at: 10.0)
        r.up(at: 10.1)
        // Gap too large -> next down restarts as first tap
        r.down(at: 11.0)
        XCTAssertEqual(r.phase, .firstDown(at: 11.0))
        XCTAssertFalse(r.up(at: 11.1))
        XCTAssertEqual(r.phase, .waitingSecondTap(firstUpAt: 11.1))
    }

    func testHoldDoesNotCountAsTap() {
        var r = RightCommandDoubleTapRecognizer(maxTapDuration: 0.35)
        r.down(at: 10.0)
        XCTAssertFalse(r.up(at: 10.6))
        XCTAssertEqual(r.phase, .idle)
        // Next tap alone still not a double
        r.down(at: 11.0)
        XCTAssertFalse(r.up(at: 11.1))
    }

    func testHoldOnSecondTapDoesNotFire() {
        var r = RightCommandDoubleTapRecognizer(maxTapDuration: 0.35)
        r.down(at: 10.0)
        r.up(at: 10.1)
        r.down(at: 10.2)
        XCTAssertFalse(r.up(at: 10.7))
        XCTAssertEqual(r.phase, .idle)
    }

    func testCancelBetweenTapsPreventsFire() {
        var r = RightCommandDoubleTapRecognizer()
        r.down(at: 10.0)
        r.up(at: 10.1)
        r.cancel()
        r.down(at: 10.2)
        XCTAssertFalse(r.up(at: 10.3))
    }

    func testCancelWhileHoldingPreventsWaiting() {
        var r = RightCommandDoubleTapRecognizer()
        r.down(at: 10.0)
        r.cancel()
        XCTAssertEqual(r.phase, .idle)
        XCTAssertFalse(r.up(at: 10.1))
    }

    func testTripleTapFiresOnceThenResets() {
        var r = RightCommandDoubleTapRecognizer()
        r.down(at: 10.0); r.up(at: 10.1)
        r.down(at: 10.2); XCTAssertTrue(r.up(at: 10.3))
        // Next solo tap after a fired double should not auto-fire
        r.down(at: 10.4); XCTAssertFalse(r.up(at: 10.5))
        r.down(at: 10.6); XCTAssertTrue(r.up(at: 10.7))
    }
}
