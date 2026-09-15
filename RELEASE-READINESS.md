# Largs Colts 2016s App Release Readiness

This file tracks the final technical preparation before Android/iOS beta testing and store submission.

## Completed in this pass

- Added native Capacitor shell handling in `app.js`:
  - Status bar colour/style setup.
  - Splash screen hide after app initialisation starts.
  - Keyboard open/close body state so bottom navigation does not fight focused fields.
  - Android hardware/back gesture behaviour: close modal first, then app route history, then home, then exit.
  - Native network status integration when the Capacitor Network plugin is present.
- Added web online/offline listeners and an in-app offline banner.
- Added safer save/delete guards that show clean offline messages instead of raw Firebase failures.
- Added notification routing:
  - `message` opens Messages.
  - `document` opens Documents.
  - `attendance` opens Register.
  - `availability` opens Availability.
  - `schedule` opens Schedule and focuses the event where possible.
- Added foreground Firebase message handling for web/PWA sessions.
- Disabled/unregistered the service worker inside Capacitor native builds to avoid stale bundled app assets.
- Added native document opening via Capacitor Browser when available, with web download fallback.
- Replaced browser `confirm()` popups with an app-styled confirmation sheet.
- Added a parent account deletion request entry point. This creates a coach-reviewable data request and keeps historical player/club records separate.
- Added mobile safe-area CSS for app shell, auth, bottom navigation, modals and confirmation sheets.
- Added required Capacitor native plugin dependencies:
  - `@capacitor/app`
  - `@capacitor/browser`
  - `@capacitor/keyboard`
  - `@capacitor/network`
  - `@capacitor/splash-screen`
  - `@capacitor/status-bar`
- Updated Capacitor status bar, splash and keyboard configuration.
- Bumped app/cache assets to build `4.0-live-rollout-52` and service worker cache `live-60`.
- Regenerated `www/` with the updated production bundle.

## Verified existing

- Firestore rules require authenticated users and separate parent/coach permissions.
- Parents are restricted to approved child links for player records, attendance, availability and player documents.
- Coach-only collections such as player development, awards, match stats and coach documents are protected.
- Storage rules restrict player and coach document reads/writes and enforce PDF/DOC/DOCX plus a 15 MB limit.
- Cloud Functions notifications are event-driven from Firestore writes rather than callable endpoints exposed to parents.
- The app already has Firebase Auth, Firestore, Storage, Cloud Functions, FCM, PWA and Capacitor structure.

## Manual configuration required

- Run `npm install` after pulling/uploading these changes so native plugin packages are installed locally.
- Run `npm run cap:sync` after `npm install`.
- Create/open native projects if not already present:
  - `npm run cap:add:android`
  - `npm run cap:add:ios`
- Android:
  - Verify package ID `com.largscolts.fc2016s`.
  - Set version code/version name for the first store build.
  - Confirm target SDK/API level meets current Google Play policy.
  - Configure release signing in Android Studio. Do not commit keystore secrets.
  - Confirm Firebase Android config is added to the native Android project.
  - Build a signed `.aab` from Android Studio.
- iOS:
  - Use a Mac with current Xcode.
  - Configure Bundle ID to match the Apple Developer app record.
  - Add Firebase iOS config to the native iOS project.
  - Enable Push Notifications and Background Modes as required.
  - Configure signing/provisioning in Xcode.
  - Set marketing/build versions for TestFlight/App Store.
- Firebase Console:
  - Confirm Authentication authorised domains include the live web domain.
  - Confirm FCM/APNs setup for iOS.
  - Consider enabling Firebase App Check before full rollout.
  - Keep budget alerts active.
- Store compliance:
  - Provide public privacy policy URL.
  - Provide public account deletion instructions/URL for Google Play/App Store policy.
  - Prepare app screenshots and store listing text.

## Release blockers remaining

- Native Android/iOS projects are not present in this repository snapshot, so release builds must still be generated with Capacitor and verified on real devices.
- iOS push cannot be fully verified without Apple Developer/APNs configuration.
- Android `.aab` signing cannot be completed without the owner-managed keystore.
- The account deletion path creates an in-app request, but a public deletion URL/process is still needed for store policy.
- `npm audit --omit=dev` could not complete because the npm audit endpoint returned an error. Re-run before final submission.

## Post-v1 nice-to-haves

- Full offline mode.
- Biometric unlock.
- Native haptics.
- Crash reporting such as Firebase Crashlytics or Sentry.
- Tablet-specific layout.
- Dark mode.
- Richer native share sheet for documents.
