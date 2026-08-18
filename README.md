# Largs Colts 2016s App

Private Firebase-backed team app for Largs Colts 2016s coaches and verified parents.

## What Works Now

- Real Firebase email/password login and logout
- Firestore role routing for coach/admin vs parent
- Parent access request and coach approval flow
- Parents only see children approved through `parentLinks`
- Coaches can manage players, teams, fixtures, training, attendance, availability and announcements
- Coaches have a private player development page for level, band, foot and playable positions
- Coaches have a private 7-a-side and 9-a-side squad builder/whiteboard using those development records
- Attendance writes trigger push notifications through Firebase Cloud Functions
- Announcements are stored in Firestore and trigger parent push notifications
- Teams and players can be seeded into Firestore, with players starting as unassigned
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

- Team 1 and Team 2
- Full active player list, all marked as Unassigned
- A welcome announcement

It does not create match fixtures. Coaches can add fixture lists once the new team split is agreed.

To reset the live Firestore data to Team 1/Team 2, mark all players as Unassigned, reset development records to a clean slate, and remove all current fixtures/training plus their attendance/availability records, run:

```powershell
npm run reset:teams-events -- --yes
```

To also add Tuesday and Thursday Bowencraig training sessions at 18:00-19:30, run:

```powershell
npm run reset:teams-events -- --yes --with-training --weeks=20
```

To add the August-October 2026 league fixture lists from the screenshots, run:

```powershell
npm run seed:fixtures-2026 -- --yes
```

Fixture mapping: Orange list becomes Team 1. Blue list becomes Team 2. Existing non-training schedule items are removed first unless `--keep-existing` is added.

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

## Rollout Hardening

Before opening the app to all parents, work through `ROLLOUT-HARDENING-CHECKLIST.md`. It covers budget alerts, Firestore rules, App Check, test request cleanup, service account safety, and the last coach/parent checks.
