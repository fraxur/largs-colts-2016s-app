import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const apiKey = process.env.LARGS_FIREBASE_API_KEY || "AIzaSyDpavXw2gRiAAWLTGRLyNgoqMgOUbQ9hwM";
const confirmed = process.argv.includes("--yes");

const coaches = [
  { id: "carl", name: "Carl Beckwith", teamId: "all", role: "Coach", phone: "07999696043", email: "" },
  { id: "faroque", name: "Faroque Hussain", teamId: "all", role: "Coach", phone: "07791199936", email: "" },
  { id: "ed", name: "Edward Dowds", teamId: "all", role: "Coach", phone: "07881597600", email: "" },
  { id: "martin", name: "Martin Fraser", teamId: "all", role: "Coach", phone: "07904718672", email: "" },
  { id: "gordy", name: "Gordon Auld", teamId: "all", role: "Coach", phone: "07984645328", email: "" },
  { id: "brandon", name: "Brandon Greenwood", teamId: "all", role: "Coach", phone: "07494913276", email: "" },
];

if (!confirmed) {
  console.log("This updates live Firestore coach contact names and phone numbers.");
  console.log("Run with: node scripts/update-coach-contacts.mjs --yes");
  console.log("If local Google credentials are not available, set LARGS_COACH_EMAIL and LARGS_COACH_PASSWORD first.");
  process.exit(0);
}

function restFields(coach) {
  return {
    id: { stringValue: coach.id },
    name: { stringValue: coach.name },
    teamId: { stringValue: coach.teamId },
    role: { stringValue: coach.role },
    phone: { stringValue: coach.phone },
    email: { stringValue: coach.email },
    updatedAt: { timestampValue: new Date().toISOString() },
  };
}

async function updateWithCoachLogin() {
  const email = process.env.LARGS_COACH_EMAIL;
  const password = process.env.LARGS_COACH_PASSWORD;
  if (!email || !password) return false;

  const signInResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const signIn = await signInResponse.json();
  if (!signInResponse.ok) {
    throw new Error(signIn.error?.message || "Firebase sign-in failed");
  }

  for (const coach of coaches) {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clubs/${clubId}/coachContacts/${coach.id}`);
    Object.keys(restFields(coach)).forEach((field) => url.searchParams.append("updateMask.fieldPaths", field));
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${signIn.idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: restFields(coach) }),
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Firestore update failed for ${coach.id}: ${details}`);
    }
  }

  console.log(`Updated ${coaches.length} coach contacts in ${projectId}/${clubId} using coach app login.`);
  return true;
}

async function updateWithAdminCredentials() {
  initializeApp({
    credential: applicationDefault(),
    projectId,
  });

  const db = getFirestore();
  const now = FieldValue.serverTimestamp();
  const club = db.collection("clubs").doc(clubId);

  const batch = db.batch();
  coaches.forEach((coach) => {
    batch.set(club.collection("coachContacts").doc(coach.id), {
      ...coach,
      updatedAt: now,
    }, { merge: true });
  });

  await batch.commit();
  console.log(`Updated ${coaches.length} coach contacts in ${projectId}/${clubId} using admin credentials.`);
}

if (!(await updateWithCoachLogin())) {
  await updateWithAdminCredentials();
}
