# Largs Colts 2016s Coach Demo Guide

This guide is for showing the current mobile app test build to the coaches before a parent trial.

## What This Build Is

This is a polished Progressive Web App test build. It can run in a browser, be added to the home screen on iPhone or Android, and be used to walk through the full parent and coach experience.

It is ready for coach review and controlled mobile testing.

It is not ready for live use with real private child data until the app has a secure online login system, shared database, privacy wording, consent process and real push notifications.

## What Works Now

- Coach login demo
- Parent login demo
- Full Orange, Blue and Yellow player lists
- Player profiles with placeholder parent contact details
- Coach parent-verification queue
- Coach approval or rejection of parent access requests
- Random temporary password generation after parent approval
- Parent password change after receiving a temporary password
- Blue and Yellow weekend fixtures
- Tuesday and Wednesday all-team training, 18:00-19:30
- Bowencraig, Inverclyde Sports Centre 3G, Barrfields Park and typed away destination venue details
- Google Maps, Apple Maps and copy-address buttons
- Parent availability yes/no responses
- Parent notes for a fixture or training session
- Coach attendance marking
- Coach removal of fixtures or training sessions
- Coach player editing
- Coach squad/team movement
- Coach messages to all parents or selected team colours
- Coach contacts page with call/text buttons
- Mobile install screen
- Offline-capable PWA shell once hosted over HTTPS

## Important Demo Limit

The current build stores changes on the device/browser being used.

That means a fixture created by a coach will appear when you switch to the parent view on the same browser. It will not automatically appear on another coach or parent phone yet.

For a real rollout, the next stage is to connect this front end to a secure backend and database so every approved parent sees the same live information.

## Quick Local Demo

1. Open the project folder.
2. Start the local preview:

```powershell
node server.mjs
```

3. Open:

```text
http://127.0.0.1:4173/
```

4. Use the parent demo button to see the parent side.
5. Use the coach demo button to see the coach side with the guided walkthrough.
6. Use coach passcode `coach2016` for the clean coach view without the walkthrough.

## Coach Guided Walkthrough

The guided walkthrough appears only when `Use coach demo` is selected.

It walks coaches through:

- Dashboard and next match
- Quick coach actions
- Fixtures and training
- Away venue typing
- Availability
- Attendance
- Teams and squads
- Messages
- Coach contacts
- Parent verification
- Phone testing/install

Use `Next`, `Back`, `Skip` or `Restart walkthrough` while reviewing the app.

## Coach Test: Create A Fixture

1. Sign in as coach.
2. Open `Fixtures`.
3. Press `Add fixture`.
4. Choose the team colour: Orange, Blue or Yellow.
5. Add opponent, date, time, venue, meet time and notes.
6. Choose `Away destination` if the venue is not Bowencraig, Inverclyde Sports Centre 3G or Barrfields Park.
7. Type the away venue name and address.
8. Save the fixture.
9. Check that it appears in the fixture list.
10. Use the map buttons to test the address links.

## Coach Test: Remove A Fixture

1. Sign in as coach.
2. Open `Fixtures`.
3. Find the test fixture.
4. Press `Remove`.
5. Confirm the removal.
6. Check that the fixture no longer appears in `Fixtures`, `Availability` or `Attendance`.

## Parent Test: See That Fixture

Use the same browser/device for this test.

1. Sign out of coach mode.
2. Sign in using the parent demo button.
3. Open `Fixtures` or `Availability`.
4. Select the relevant child/team if needed.
5. Confirm the new fixture appears.
6. Mark the child as available or unavailable.
7. Add a parent note.
8. Sign back in as coach.
9. Open the same fixture and check the availability response.

## Coach Test: Verify A Parent

1. Sign out.
2. Try the parent login form with a new parent name, phone number and child selection.
3. Send the child access request.
4. Sign in as coach.
5. Open `Access`.
6. Approve the request.
7. The app creates a temporary password.
8. The coach would send that temporary password to the parent outside the app, for example by text message.
9. Sign out.
10. Sign in as that parent using the temporary password.
11. Change the password when prompted.

## Notifications In This Build

The app currently has in-app messages and coach announcements.

Real phone push notifications, where a parent receives an alert even when the app is closed, are not active yet. That needs a backend notification service and Apple/Google push setup.

For the coach demo, describe notifications as:

- Available now: in-app team messages and announcements.
- Next build for rollout: real push notifications for cancellations, fixture changes and reminders.

## Mobile Testing Package

The current package is:

```text
dist/largs-colts-2016s-pwa.zip
```

You can send this zip to a coach for review, but the best experience is to host it on an HTTPS test link and ask coaches to open that link on their phone.

## Best Hosting Option For Coach Testing

For this stage, GitHub Pages is a good option if you are comfortable putting the demo site online.

Important: do not include real private child or parent data in a public GitHub Pages test site. Use placeholder contact details until the secure backend is ready.

Recommended test hosting route:

1. Create a GitHub repository, for example `largs-colts-2016s-app`.
2. Upload these project files to the repository:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.json`
   - `service-worker.js`
   - `assets`
   - `.nojekyll`
3. Go to the repository on GitHub.
4. Open `Settings`.
5. Open `Pages`.
6. Set source to deploy from the main branch.
7. Select the root folder.
8. Save.
9. GitHub will give you a test link.
10. Open that link on an iPhone or Android phone.

## Installing On Phones

iPhone:

1. Open the hosted HTTPS link in Safari.
2. Tap the share button.
3. Tap `Add to Home Screen`.
4. Open it from the home screen icon.

Android:

1. Open the hosted HTTPS link in Chrome.
2. Tap the browser menu.
3. Tap `Install app` or `Add to Home screen`.
4. Open it from the home screen icon.

## Suggested Coach Demo Script

1. Show the home screen and club branding.
2. Show the full team lists for Orange, Blue and Yellow.
3. Open a player profile and show parent/contact placeholders.
4. Create a new fixture as coach.
5. Switch to parent view and mark availability.
6. Switch back to coach view and check availability/attendance.
7. Open `Access` and show how a parent request is approved.
8. Show the temporary password flow.
9. Open `Coaches` and show call/text contact links.
10. Explain that the next stage is the secure shared backend for real parent rollout.

## What Is Still Needed Before Real Parent Rollout

- Secure hosted database
- Real login accounts
- Server-side parent/child permissions
- Proper password reset flow
- Parent consent wording
- Privacy notice
- Push notifications
- Coach admin controls connected to shared data
- TestFlight build for iPhone if going through the App Store
- Android internal testing build if going through Google Play
- Final check against club safeguarding and data protection expectations
