# Firebase Backend Setup

This build is ready for Firebase, but Firebase is not live until the project config and keys are added.

## What Firebase Will Handle

- Real parent and coach accounts
- Secure role checks: parent, coach, admin
- Player records
- Parent-child approval links
- Fixtures and training
- Availability
- Attendance and collection status
- In-app notification records
- Push notification tokens
- Push alerts when a child is marked present or collected

## 1. Create Firebase Project

1. Go to Firebase Console.
2. Create a project for `Largs Colts 2016s`.
3. Add a Web App.
4. Copy the Firebase config.
5. Enable Authentication.
6. Enable Email/Password sign-in.
7. Enable Cloud Firestore.
8. Enable Cloud Messaging.

Firebase Auth supports email/password sign-in on the web. Firebase Cloud Messaging is used for push delivery.

## 2. Add Config

Open:

```text
firebase-config.js
```

Set:

```js
enabled: true
```

Paste the Firebase web config and Web Push certificate key:

```js
vapidKey: "YOUR_WEB_PUSH_CERTIFICATE_KEY"
```

Repeat the same Firebase config in:

```text
firebase-sw-config.js
```

## 3. Deploy Security Rules And Functions

Install the Firebase CLI, log in, then run:

```powershell
firebase login
firebase use --add
firebase deploy --only firestore:rules,functions
```

The included files are:

- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `functions/package.json`
- `functions/index.js`

## 4. Create Users

Create coach and parent users in Firebase Authentication.

Each user also needs a Firestore profile:

```text
clubs/largs-colts-2016s/users/{uid}
```

Coach:

```json
{
  "role": "coach",
  "name": "Coach Name",
  "email": "coach@example.com"
}
```

Parent:

```json
{
  "role": "parent",
  "name": "Parent Name",
  "email": "parent@example.com"
}
```

## 5. Parent Links

Approved parent-child links go here:

```text
clubs/largs-colts-2016s/parentLinks/{parentUid_playerId}
```

Example:

```json
{
  "parentUid": "firebase-parent-uid",
  "playerId": "p10",
  "playerTeamId": "blue",
  "relation": "Parent",
  "status": "approved"
}
```

## 6. Push Notifications

When a parent allows push notifications, the app stores their FCM token in:

```text
clubs/largs-colts-2016s/notificationTokens/{uid_tokenSuffix}
```

When a coach marks a child as `present` or `collected`, the Cloud Function sends a push notification to approved parent tokens.

## 7. Support Contact

Temporary support email is:

```text
fraxur@outlook.com
```

Replace this later in `firebase-config.js` when the club support email is ready.

## Important

Do not use real parent or child data in production until:

- Firebase Authentication is enabled
- Firestore rules are deployed
- Parent consent wording has been approved
- Push notifications have been tested on real iPhone and Android devices
- Apple/Google developer accounts are ready for app testing

