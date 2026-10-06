Quick Text Mobile — free personal-device prototype

Open QuickTextMobile.xcodeproj in Xcode. The app supports iPhone and iPad (iOS 18+).
The target references the Mac app's existing Models, PhraseVariable, GeminiClient,
TokenUsage, and GeminiKeychain sources. Mac sources are not modified.

BUILD / TEST
xcodebuild -project QuickTextMobile.xcodeproj -scheme QuickTextMobile -destination 'generic/platform=iOS Simulator' -derivedDataPath /tmp/QuickTextMobileBuild CODE_SIGNING_ALLOWED=NO build
For simulator tests, choose a concrete iPhone or iPad destination in Xcode and run Product > Test.

FIRST PERSONAL-DEVICE INSTALL
1. In Xcode > Settings > Accounts, sign in with your free Apple Account.
2. In the QuickTextMobile target > Signing & Capabilities, select your Personal Team.
3. If necessary, change the bundle ID to a unique reverse-domain ID and keep it stable.
4. Connect and trust your iPhone/iPad, enable Developer Mode if prompted, select it, and Run.
5. On the device, open Settings in Quick Text and enter your Gemini API key.
No paid membership, CloudKit, App Groups, or push-notification entitlements are used.

LIBRARY
The bundled library contains sample phrases only. AirDrop the Mac corpus's
quick-text.json to your device, then use Settings > Import library from Files.
Import replaces the device copy after confirmation and creates a local backup.
Export includes private and local-only phrases and preserves Mac-only metadata.
Local libraries and recovery backups are visible under Files > On My iPhone/iPad > Quick Text.
Mobile edits do not automatically change the Mac library. Keep an export backup
before replacing or deleting the app. Do not overwrite the Mac corpus with a
mobile export without reviewing concurrent Mac changes.

DICTATE
After-take transcription and processing use the same Gemini REST client as Mac.
The prototype has no real-time streaming. It stops recording when leaving the app;
interrupted recordings can be retried. Successful audio is deleted, failed audio
is retained for explicit retry. Takes older than 15 days prune when the app opens.
Reported token counts are local to this device; failed calls may still incur charges.
The key stays in the device Keychain and is absent from all library exports.

ALTSTORE CLASSIC RENEWAL
Free development signing expires after seven days. AltStore Classic is the
AltServer-based sideloading option; this is not AltStore PAL.
Setup: https://faq.altstore.io/altstore-classic/how-to-install-altstore-macos
Refresh: https://faq.altstore.io/altstore-classic/your-altstore
Install AltServer on your Mac and AltStore on each device, following those instructions.
To install Quick Text through AltStore, build the iphoneos target without signing
and package QuickTextMobile.app in Payload/ inside an IPA. The package-ipa.sh script
creates that archive locally. AltStore signs it with your free Apple Account.
In AltStore, My Apps > + selects the IPA from Files.
Keep the bundle ID stable. Back up the library before switching from an Xcode install
to an AltStore install; signing-team changes may affect access to stored credentials.
Run AltServer at login; enable Background App Refresh for AltStore on each device.
AltStore's Settings > Add to Siri adds its refresh action to Shortcuts. A daily
Personal Automation can run that action. Automatic execution remains subject to iOS
scheduling and connectivity; check expiry before travel and use Refresh All if needed.
AltServer must be reachable on the same Wi-Fi or over USB. AltStore counts toward
Apple's three-app free-signing limit. No renewal automation is installed by this project.
