# Firebase Backend Setup

This build is Firebase-first. The app expects Authentication, Firestore and Cloud Messaging to be enabled.

## What Firebase Will Handle

- Real parent and coach accounts
- Secure role checks: parent, coach, admin
- Player records
- Parent-child approval links
- Fixtures and training
- Availability
- Attendance and collection status
- Announcements
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

## 2. Confirm Config

Open:

```text
firebase-config.js
```

Make sure `enabled: true`, the Firebase web config, and the Web Push certificate key are present.

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

## 4. Seed Firestore

Install dependencies:

```powershell
npm install
```

Run the seed:

```powershell
npm run seed:firestore
```

The seed script uses Firebase Admin credentials. Set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON file, or run `gcloud auth application-default login` before seeding.

This creates the live `teams`, `squads`, `players`, `events`, `attendance`, `availability`, and `announcements` records under:

```text
clubs/largs-colts-2016s
```

The main seed no longer creates sample parent accounts. Coaches who are also parents should create separate parent accounts in the app using separate parent emails.

If older sample parent accounts were already created, remove them with:

```powershell
npm run remove:sample-parents
```

## 5. Create Users

Create coach users in Firebase Authentication. Parents can create their own parent account from the app.

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

## 6. Parent Links

Parents request access in the app. Coaches approve requests in the Access page, which creates approved links here:

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

## 7. Push Notifications

When a parent allows push notifications, the app stores their FCM token in:

```text
clubs/largs-colts-2016s/notificationTokens/{uid_tokenSuffix}
```

When a coach marks a child as `present` or `collected`, the Cloud Function sends a push notification to approved parent tokens. Coach announcements also send push notifications to the selected team group.

## 8. Support Contact

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
