# Mobile Testing

This build is now Firebase-backed. Coaches and parents should test with real Firebase Auth accounts, not the old demo buttons.

## Browser Test First

Run:

```powershell
node server.mjs
```

Open:

```text
http://127.0.0.1:4173/
```

Test:

- Coach signs in with a Firebase account that has `role: coach` or `role: admin` in `clubs/largs-colts-2016s/users/{uid}`
- Parent signs in or creates a parent account with email/password
- Parent requests access using their child name
- Coach approves the request and selects the matching player
- Parent signs out and back in, then sees only their linked child
- Coach adds/edits/removes a fixture or training session
- Parent marks availability
- Coach marks present and collected
- Parent enables push on their device and receives push notifications

## Firestore Seed

Run:

```powershell
npm install
npm run seed:firestore
```

The seed script fills Firestore with the team colours, squads, players, fixtures, training, blank attendance and blank availability.

It does not create parent test accounts. For parent testing, coaches should create a separate parent account in the app and request access to their own child.

## Phone/PWA Test

Deploy to HTTPS using Firebase Hosting or GitHub Pages, then open the live URL on the phone.

- iPhone: open in Safari, share, Add to Home Screen
- Android: open in Chrome, Install app or Add to Home screen

Push notifications need HTTPS and a real Firebase Messaging VAPID key.

## Capacitor App Test

Prepare the web bundle:

```powershell
npm run prepare:capacitor
```

Then:

```powershell
npm run cap:add:ios
npm run cap:add:android
npm run cap:sync
```

After that, open the generated iOS project in Xcode and the Android project in Android Studio.

The Capacitor config includes the push notification plugin dependency. Native push still needs the normal Apple/Google Firebase setup inside Xcode/Android Studio before store testing.
