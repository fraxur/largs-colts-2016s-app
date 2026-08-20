# Largs Colts 2016s App

Private Firebase-backed team app for Largs Colts 2016s coaches and verified parents.

## What Works Now

- Real Firebase email/password login and logout
- Firestore role routing for coach/admin vs parent
- Parent access request and coach approval flow
- Parents only see children approved through `parentLinks`
- Coaches can manage players, teams, fixtures, training, attendance, availability and announcements
- Coaches have a private player development page for level, band, foot and playable positions
- Coaches have a private squad list that can be sorted by name or position and filtered by playable position
- Coaches have a private 7-a-side and 9-a-side squad builder/whiteboard using those development records
- Coaches can upload PDF or Word documents to a specific player profile for approved parents to download
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

- Largs Orange and Largs Blue
- Full active player list, all marked as Unassigned
- A welcome announcement

It does not create match fixtures. Coaches can add fixture lists once the new team split is agreed.

To reset the live Firestore data to Largs Orange/Largs Blue, mark all players as Unassigned, reset development records to a clean slate, and remove all current fixtures/training plus their attendance/availability records, run:

```powershell
npm run reset:teams-events -- --yes
```

To also add Tuesday and Thursday Bowencraig training sessions at 18:00-19:30 from 18 August 2026 through the final fixture week, run:

```powershell
npm run reset:teams-events -- --yes --with-training
```

To add the August-October 2026 league fixture lists from the screenshots and the matching Tuesday/Thursday training schedule, run:

```powershell
npm run seed:fixtures-2026 -- --yes
```

Fixture mapping: Orange list becomes Largs Orange. Blue list becomes Largs Blue. Existing schedule items are removed first unless `--keep-existing` is added.

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

## Document Sharing

Document sharing uses Firebase Storage plus the `playerDocuments` Firestore collection. Enable Firebase Storage in the Firebase Console, then deploy both Firestore and Storage rules:

```powershell
firebase deploy --only firestore:rules,storage
```

Coaches can upload `.pdf`, `.doc`, or `.docx` files up to 15 MB from the Documents page. Parents only see files attached to player profiles they have an approved parent link for.

## Rollout Hardening

Before opening the app to all parents, work through `ROLLOUT-HARDENING-CHECKLIST.md`. It covers budget alerts, Firestore rules, App Check, test request cleanup, service account safety, and the last coach/parent checks.
