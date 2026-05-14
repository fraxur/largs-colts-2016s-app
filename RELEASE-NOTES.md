# Largs Colts 2016s - Live Firebase Build

## Build 4.0 Live Firebase

- Removed the browser-saved demo state from the active app flow
- Switched login/logout to Firebase Auth
- Added Firestore role routing for coach/admin vs parent accounts
- Moved teams, players, fixtures/training, attendance, availability and announcements to Firestore
- Added parent access request and coach approval flow using `parentLinks`
- Added Firestore seed script for teams, players, fixtures, attendance and availability
- Removed sample parent Auth accounts from the main seed and added a cleanup script for older sample records
- Added loading and error states around Firebase actions
- Added live Firestore listeners for announcements, notifications, access requests, events and players
- Updated Cloud Functions so attendance and announcements create in-app notification records and push notifications
- Added Capacitor config and mobile bundle prep for iOS and Android wrapping
- Added Capacitor push-token support alongside web push

## Still Needed For Store Release

- Create Apple Developer and Google Play Console accounts
- Add real coach accounts in Firebase Auth and Firestore user role docs
- Run the Firestore seed script against the production Firebase project
- Test parent push on real iPhone and Android devices
- Add native Firebase/APNs setup inside Xcode and Android Studio after Capacitor projects are generated
- Club approval of privacy/consent wording before using real parent contact data at scale
