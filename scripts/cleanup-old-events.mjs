import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const confirmed = process.argv.includes("--yes");
const cutoff = argValue("--before", "");

if (!cutoff) {
  console.log("Add an explicit cutoff date, for example:");
  console.log("npm run cleanup:old-events -- --before=2026-06-01");
  process.exit(1);
}

if (!confirmed) {
  console.log("This removes live Firestore events before the cutoff date.");
  console.log("It also removes attendance rows for those events, and date availability only when no remaining fixture uses that date.");
  console.log(`Preview cutoff: events before ${cutoff}`);
  console.log(`Run with: npm run cleanup:old-events -- --before=${cutoff} --yes`);
  process.exit(0);
}

initializeApp({
  credential: applicationDefault(),
  projectId,
});

const db = getFirestore();
const club = db.collection("clubs").doc(clubId);

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length) || fallback;
}

function eventDateKey(event) {
  const datetime = String(event.datetime || "");
  return datetime.slice(0, 10);
}

function isBeforeCutoff(dateKey) {
  return Boolean(dateKey) && dateKey < cutoff;
}

async function deleteCollection(collectionRef, chunkSize = 300) {
  let deleted = 0;
  while (true) {
    const snapshot = await collectionRef.limit(chunkSize).get();
    if (snapshot.empty) break;
    const batch = db.batch();
    snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
    deleted += snapshot.size;
    if (snapshot.size < chunkSize) break;
  }
  return deleted;
}

async function deleteLiftOffersBeforeCutoff() {
  const snapshot = await club.collection("liftOffers").get();
  const stale = snapshot.docs.filter((docSnap) => isBeforeCutoff(String(docSnap.data().dateKey || "")));
  let deleted = 0;
  for (let index = 0; index < stale.length; index += 400) {
    const batch = db.batch();
    stale.slice(index, index + 400).forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
    deleted += stale.slice(index, index + 400).length;
  }
  return deleted;
}

async function main() {
  const eventsSnapshot = await club.collection("events").get();
  const allEvents = eventsSnapshot.docs.map((docSnap) => ({ docSnap, data: docSnap.data(), dateKey: eventDateKey(docSnap.data()) }));
  const staleEvents = allEvents.filter((item) => isBeforeCutoff(item.dateKey));
  const remainingDateKeys = new Set(allEvents.filter((item) => !isBeforeCutoff(item.dateKey)).map((item) => item.dateKey).filter(Boolean));
  const staleAvailabilityKeys = [...new Set(staleEvents.map((item) => item.dateKey).filter((dateKey) => dateKey && !remainingDateKeys.has(dateKey)))];

  let attendancePlayersDeleted = 0;
  let availabilityPlayersDeleted = 0;
  let eventDocsDeleted = 0;

  for (const item of staleEvents) {
    attendancePlayersDeleted += await deleteCollection(club.collection("attendance").doc(item.docSnap.id).collection("players"));
    await club.collection("attendance").doc(item.docSnap.id).delete();
    await item.docSnap.ref.delete();
    eventDocsDeleted += 1;
  }

  for (const dateKey of staleAvailabilityKeys) {
    availabilityPlayersDeleted += await deleteCollection(club.collection("availability").doc(dateKey).collection("players"));
    await club.collection("availability").doc(dateKey).delete();
  }

  const liftOffersDeleted = await deleteLiftOffersBeforeCutoff();

  console.log(`Cleaned old events in ${projectId}/${clubId}.`);
  console.log(`Cutoff: before ${cutoff}.`);
  console.log(`Deleted ${eventDocsDeleted} event documents.`);
  console.log(`Deleted ${attendancePlayersDeleted} attendance player rows.`);
  console.log(`Deleted ${availabilityPlayersDeleted} availability player rows from ${staleAvailabilityKeys.length} date documents.`);
  console.log(`Deleted ${liftOffersDeleted} old lift offers.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
