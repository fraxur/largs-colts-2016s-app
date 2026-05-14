# Largs Colts 2016s App

Private Firebase-backed team app for Largs Colts 2016s coaches and verified parents.

## What Works Now

- Real Firebase email/password login and logout
- Firestore role routing for coach/admin vs parent
- Parent access request and coach approval flow
- Parents only see children approved through `parentLinks`
- Coaches can manage players, teams, fixtures, training, attendance, availability and announcements
- Attendance writes trigger push notifications through Firebase Cloud Functions
- Announcements are stored in Firestore and trigger parent push notifications
- Teams, players, events, availability and attendance can be seeded into Firestore
- PWA install support remains in place for browser testing
- Capacitor config is ready for iOS and Android wrapping

## Local Preview

```powershell
node server.mjs
```

Open:

```text
http://127.0.0.1:4173/
```

## Firebase Seed

Install dependencies first:

```powershell
npm install
```

Set `GOOGLE_APPLICATION_CREDENTIALS` to a Firebase service account JSON file, or run `gcloud auth application-default login`, then run:

```powershell
npm run seed:firestore
```

This seeds:

- Orange, Blue and Yellow teams
- Orange, Blue and Yellow squads
- Full active player list
- Blue and Yellow weekend fixtures
- Tuesday and Wednesday training sessions
- Empty attendance records
- Empty availability records
- A welcome announcement

No sample parent accounts are created by the main seed. Parent test accounts should be created by the coaches using separate parent emails inside the app.

If older sample parent accounts were already created, remove them with:

```powershell
npm run remove:sample-parents
```

## Mobile Wrapping

Prepare the Capacitor web bundle:

```powershell
npm run prepare:capacitor
```

Then add platforms when you are ready:

```powershell
npm run cap:add:ios
npm run cap:add:android
npm run cap:sync
```

See `MOBILE-TESTING.md` for the coach/phone testing path.
