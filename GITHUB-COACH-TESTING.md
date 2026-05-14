# GitHub Coach Testing Guide

This guide explains how to put the Largs Colts 2016s test app online for a coach demo.

## Privacy Warning

GitHub can keep the code repository private, but a normal GitHub Pages website is not the same thing as a private app link.

For most GitHub accounts, a GitHub Pages site should be treated as public once it is published. Do not upload real private parent contact details or sensitive child information to a public Pages test site.

For this coach demo, use placeholder parent names and numbers only.

## Best Option For Showing One Coach

Use GitHub Pages as an unlisted public demo link only if the app contains test/placeholder data.

If you need the link to be genuinely private before real parent data is added, use one of these instead:

- Invite the coach to a private GitHub repository and let them review the files/package.
- Use a password-protected host.
- Use GitHub Enterprise private Pages if the club has access to it.
- Wait until the secure backend/login stage is added.

## Upload To GitHub

1. Go to GitHub.
2. Create a new repository called `largs-colts-2016s-app`.
3. For a normal GitHub Pages demo, make the repository public.
4. If you make the repository private, check your GitHub plan supports Pages from private repositories. The published Pages site may still be public unless you have Enterprise private Pages.
5. Upload these files and folders from this project:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.json`
   - `service-worker.js`
   - `.nojekyll`
   - `assets`
   - `README.md`
   - `MOBILE-TESTING.md`
   - `COACH-DEMO-GUIDE.md`
   - `GITHUB-COACH-TESTING.md`
6. Commit the files to the main branch.

## Turn On GitHub Pages

1. Open the GitHub repository.
2. Go to `Settings`.
3. Go to `Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Set branch to `main`.
6. Set folder to `/root`.
7. Press `Save`.
8. Wait a few minutes.
9. GitHub will show a Pages link.
10. Open that link on your computer first.

## Test Before Sending To A Coach

1. Open the Pages link.
2. Sign in using `Use coach demo`.
3. Open `Fixtures`.
4. Add a test fixture.
5. Confirm it appears.
6. Press `Remove`.
7. Confirm it disappears.
8. Sign out.
9. Use the parent demo.
10. Check fixtures, availability, coaches, messages and install pages.

## Send To A Coach

Send the coach:

- The GitHub Pages link.
- A note saying this is a demo with placeholder contact data.
- The coach passcode: `coach2016`.
- The parent demo button instructions.
- The message that real parent rollout needs the secure backend stage.

Suggested message:

```text
Here is the Largs Colts 2016s app test build:

[paste link]

Use the coach demo button or coach passcode: coach2016.

This is a test version with placeholder parent contact details. It lets us review the look, team lists, fixtures, availability, attendance, maps, coach contacts and parent verification flow. The next stage is secure online accounts and a shared database before using it with real parent data.
```

## Install On Phone

iPhone:

1. Open the GitHub Pages link in Safari.
2. Tap Share.
3. Tap `Add to Home Screen`.
4. Open the app from the new home screen icon.

Android:

1. Open the GitHub Pages link in Chrome.
2. Tap the browser menu.
3. Tap `Install app` or `Add to Home screen`.
4. Open the app from the new home screen icon.

## What To Say About Privacy

Say this:

```text
This is a safe coach demo because it uses placeholder parent information. We will not use real parent contact details or private child records until the secure login and database stage is built.
```

Do not say the current GitHub Pages link is private unless it is protected by Enterprise private Pages or another proper access-control layer.

