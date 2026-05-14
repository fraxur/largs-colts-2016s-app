import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";

initializeApp({
  credential: applicationDefault(),
  projectId,
});

const auth = getAuth();
const db = getFirestore();
const club = db.collection("clubs").doc(clubId);

const sampleEmails = [
  "parent.orange@largscolts.test",
  "parent.blue@largscolts.test",
  "parent.yellow@largscolts.test",
];

async function deleteQuery(collectionName, field, value) {
  const snapshot = await club.collection(collectionName).where(field, "==", value).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.size;
}

async function removeSampleParents() {
  let removedDocs = 0;
  for (const email of sampleEmails) {
    try {
      const user = await auth.getUserByEmail(email);
      const uid = user.uid;
      removedDocs += await deleteQuery("accessRequests", "parentUid", uid);
      removedDocs += await deleteQuery("parentLinks", "parentUid", uid);
      removedDocs += await deleteQuery("notifications", "userId", uid);
      removedDocs += await deleteQuery("notificationTokens", "userId", uid);
      await club.collection("users").doc(uid).delete();
      removedDocs += 1;
      await auth.deleteUser(uid);
      console.log(`Removed sample parent ${email}`);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        removedDocs += await deleteQuery("accessRequests", "email", email);
        removedDocs += await deleteQuery("parentLinks", "email", email);
        console.log(`No Auth user found for ${email}; removed matching Firestore records by email.`);
        continue;
      }
      throw error;
    }
  }
  console.log(`Removed ${removedDocs} sample parent Firestore records from ${projectId}/${clubId}.`);
}

removeSampleParents().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
