# Largs Colts 2016s App Release Readiness

This file tracks technical preparation before Android/iOS beta testing and store submission.

## Current Build

- Web/app build: `4.0-live-rollout-54`
- Package version: `4.0.54`
- Android version: `versionName "4.0.54"`, `versionCode 54`
- iOS version: `MARKETING_VERSION = 4.0.54`, `CURRENT_PROJECT_VERSION = 54`
- Web cache: `live-54`
- Service worker cache: `live-62`

## Implemented And Verified In Native Project

- Created real native Capacitor projects:
  - `android/`
  - `ios/`
- Synced the current `www/` production bundle into both native projects.
- Verified Capacitor detects these native plugins for Android and iOS:
  - `@capacitor/app`
  - `@capacitor/browser`
  - `@capacitor/keyboard`
  - `@capacitor/network`
  - `@capacitor/push-notifications`
  - `@capacitor/splash-screen`
  - `@capacitor/status-bar`
- Android native project:
  - Application ID/namespace set to `com.largscolts.fc2016s`.
  - App name set to `Largs Colts 2016s`.
  - SDK config generated with `compileSdkVersion = 35`, `targetSdkVersion = 35`, `minSdkVersion = 23`.
  - Native versioning set to `4.0.54` / `54`.
  - Android 13 notification permission added: `POST_NOTIFICATIONS`.
  - Cleartext traffic disabled.
  - Android backup disabled and data extraction rules added to avoid child/club data being backed up or device-transferred.
  - Keyboard resize configured at Activity level with `adjustResize`.
  - Native theme colour resources added for Largs red/gold.
  - Native launcher icon assets regenerated from `assets/app-icon-512.png`.
  - Release signing config scaffolded to use owner-supplied environment/Gradle properties without committing secrets.
- iOS native project:
  - Bundle ID set to `com.largscolts.fc2016s`.
  - Display name set to `Largs Colts 2016s`.
  - Native versioning set to `4.0.54` / `54`.
  - App icon asset catalog regenerated from `assets/app-icon-512.png`.
  - Launch screen and splash assets are present.
  - `ITSAppUsesNonExemptEncryption` set to `false`.
  - Initial status bar style set to light content.
  - Podfile contains all seven Capacitor plugin pods.
- Native-aware web layer:
  - Android hardware back closes modal/guide first, then route history, then home, then exits.
  - Status bar setup calls the real StatusBar plugin.
  - Splash screen hide calls the real SplashScreen plugin.
  - Keyboard show/hide uses the real Keyboard plugin and CSS body state.
  - Network/offline state uses the real Network plugin plus browser fallback.
  - Notification tap routing opens the relevant app route.
  - Native document opening uses the Capacitor Browser plugin.
  - Service worker is suppressed/unregistered inside Capacitor native builds.
  - Safe-area CSS applies to native shell, bottom nav, auth, modals and confirmation sheets.
  - Parent account deletion request UI remains in place.
- Push-token safety:
  - Android/web FCM tokens continue to be sent via Firebase Admin.
  - iOS APNs tokens from the basic Capacitor Push plugin are now stored as `capacitor-ios-apns` and excluded from Firebase Admin multicast sends until the iOS Firebase/APNs strategy is completed.

## Implemented But Requires Physical-Device/TestFlight/Play Testing

- Android push permission prompt and notification tap routing.
- Android status bar/splash/keyboard/back-button behaviour on a real device.
- Android document opening through the native browser.
- Android safe areas and bottom navigation on real device screen sizes.
- iOS status bar/splash/keyboard/network handling.
- iOS push registration and final delivery path.
- iOS document opening through native browser.
- iOS safe areas on notched devices.
- Signed Android release `.aab`.
- TestFlight archive/upload.

## Manual Configuration Martin Must Provide

- Android tooling:
  - Install/configure JDK 17.
  - Install/configure Android Studio and Android SDK.
  - Ensure `android/local.properties` points at the Android SDK, or set `ANDROID_HOME`.
- Android Firebase:
  - Register Android app `com.largscolts.fc2016s` in Firebase.
  - Download `google-services.json`.
  - Place it at `android/app/google-services.json`.
- Android signing:
  - Create/own the Play release keystore.
  - Provide signing values locally via environment variables or Gradle properties:
    - `LARGS_RELEASE_STORE_FILE`
    - `LARGS_RELEASE_STORE_PASSWORD`
    - `LARGS_RELEASE_KEY_ALIAS`
    - `LARGS_RELEASE_KEY_PASSWORD`
  - Do not commit keystore files or passwords.
- iOS tooling:
  - Use a Mac with current Xcode.
  - Install CocoaPods.
  - Run `pod install` inside `ios/App`.
- iOS Apple/Firebase:
  - Create Apple Developer App ID for `com.largscolts.fc2016s`.
  - Enable Push Notifications capability.
  - Configure signing/provisioning in Xcode.
  - Configure APNs key/certificate in Firebase.
  - Register iOS app in Firebase and add `GoogleService-Info.plist` at `ios/App/App/GoogleService-Info.plist` if Firebase native messaging is used.
- Store compliance:
  - Provide public privacy policy URL.
  - Provide public account deletion instructions/URL.
  - Prepare store screenshots and listing text.
  - Confirm support contact details.

## Actual Release Blockers

- Android cannot currently compile on this Windows host because only Java 11 was found. Android Gradle Plugin 8.7 requires Java 17.
- Android SDK is not installed/configured at the normal `%LOCALAPPDATA%/Android/Sdk` path and no `android/local.properties` exists yet.
- Android push will not work until `android/app/google-services.json` is added.
- Android Play release cannot be signed until Martin provides the release keystore values locally.
- iOS cannot be built on this Windows host because Xcode and CocoaPods are unavailable.
- iOS push delivery is not store-ready until APNs capability/provisioning and the Firebase/APNs messaging path are completed on a Mac.
- The account deletion path exists in-app, but app stores also expect a public deletion/support URL.

## Commands/Actions To Perform Next

From the project root:

```powershell
npm install
npm run prepare:capacitor
npx cap sync
```

For Android on a machine with Android Studio, Android SDK and JDK 17:

```powershell
cd android
.\gradlew.bat assembleDebug
.\gradlew.bat bundleRelease
```

For iOS on a Mac:

```bash
cd ios/App
pod install
open App.xcworkspace
```

Then in Xcode:

- Select the correct development team.
- Confirm Bundle ID `com.largscolts.fc2016s`.
- Enable Push Notifications capability.
- Archive and upload to TestFlight.
