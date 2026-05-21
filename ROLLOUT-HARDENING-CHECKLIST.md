# Largs Colts 2016s Rollout Hardening Checklist

Use this before opening the app to all parents.

## Firebase Hardening

- Add a Google Cloud budget alert before wider rollout.
  - Suggested first alert: a low monthly budget with email alerts at 50%, 90% and 100%.
  - Path: Google Cloud Console > Billing > Budgets & alerts.
- Keep Firestore rules deployed after every rule change.
  - Run: `firebase deploy --only firestore:rules`
- Confirm protected writes are coach/admin only.
  - Coaches/admins can write players, squads, fixtures, attendance, announcements, venues, coach contacts and parent approvals.
  - Parents can only write their own profile contact details, their own access/data requests, their own push token, and availability for an approved linked child.
- Remove old test access requests and test data requests before parent rollout.
  - In the app: Coach login > Access > Delete old test access requests.
  - In the app: Coach login > Privacy > Delete or resolve old test data requests.
- Consider Firebase App Check before the full parent rollout.
  - Recommended approach: enable App Check in monitor mode first, check it does not block real devices, then enforce when comfortable.
  - Web/PWA can use reCAPTCHA Enterprise.
  - Native iOS/Android can later use DeviceCheck/App Attest and Play Integrity.
- Keep service account files off GitHub.
  - Do not upload `serviceAccountKey.json`.
  - `.gitignore` blocks service account and environment files.

## Useful Polish Now Included

- Venue photo fields are editable by coaches.
  - Add image paths such as `assets/venues/bowencraig-pitch.jpg`, or a hosted image URL.
- Parents can edit their own name and phone number from Access.
- Coaches can update coach contact details without code changes.
- Parents have a simple How to use the app guide.
- Parent and coach sign-in screens include a Forgot password button.

## Final Pre-Parent Checks

- Confirm coach accounts can add/edit/remove fixtures.
- Confirm coaches can approve and delete parent access requests.
- Confirm a parent can request a child, get approved, see only their child, and submit availability.
- Confirm venue map links open correctly on iPhone and Android.
- Confirm push/in-app notification logging still works after a test attendance mark.
- Confirm no test accounts, test requests or duplicate parent links remain.
