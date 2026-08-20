import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const confirmed = process.argv.includes("--yes");
const trainingFrom = argValue("--from", todayDateOnly());
const trainingTo = argValue("--to", "2026-10-17");

if (!confirmed) {
  console.log("This updates live Firestore training only. Fixtures are left untouched.");
  console.log(`It removes training sessions from ${trainingFrom} to ${trainingTo}, then adds Tuesday/Wednesday Bowencraig sessions 18:00-19:30.`);
  console.log("Run with: npm run update:training -- --yes");
  process.exit(0);
}

initializeApp({
  credential: applicationDefault(),
  projectId,
});

const db = getFirestore();
const club = db.collection("clubs").doc(clubId);
const now = FieldValue.serverTimestamp();

const bowencraig = {
  venue: "Bowencraig (Home pitch)",
  venueId: "bowencraig",
  address: "55.77946, -4.856398",
  parkingAddress: "Bowencraig East Car Park, Irvine Rd, Fairlie, Largs KA29 0BG",
};

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length) || fallback;
}

function todayDateOnly() {
  return toDateOnly(new Date());
}

function toDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDateInput(value) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid date: ${value}`);
  return parsed;
}

function trainingEvent(date) {
  const dateText = toDateOnly(date);
  return {
    id: `training-${dateText.replaceAll("-", "")}`,
    type: "Training",
    title: "Training",
    teamId: "all",
    opponent: "",
    datetime: `${dateText}T18:00:00`,
    finishTime: "19:30",
    ...bowencraig,
    meetTime: "",
    kit: "",
    homeScore: "",
    awayScore: "",
    resultNotes: "",
    notes: "18:00-19:30. Tuesday and Wednesday training at Bowencraig. Bring boots, water and shin pads.",
    competition: "",
    homeAway: "",
    timeTbc: false,
    source: "2026 training schedule",
  };
}

function trainingSessions() {
  const from = parseDateInput(trainingFrom);
  const to = parseDateInput(trainingTo);
  const sessions = [];
  for (let cursor = new Date(from); cursor <= to; cursor = addDays(cursor, 1)) {
    const day = cursor.getDay();
    if (day === 2 || day === 3) sessions.push(trainingEvent(cursor));
  }
  return sessions;
}

async function commitInChunks(operations, chunkSize = 400) {
  for (let index = 0; index < operations.length; index += chunkSize) {
    const batch = db.batch();
    operations.slice(index, index + chunkSize).forEach((operation) => operation(batch));
    await batch.commit();
  }
}

async function main() {
  const fromDate = parseDateInput(trainingFrom);
  const toDate = parseDateInput(trainingTo);
  const existing = await club.collection("events").where("type", "==", "Training").get();
  const toDelete = existing.docs.filter((doc) => {
    const datetime = doc.data().datetime;
    const date = typeof datetime === "string" ? parseDateInput(datetime.slice(0, 10)) : null;
    return date && date >= fromDate && date <= toDate;
  });
  const sessions = trainingSessions();

  const operations = [
    ...toDelete.map((doc) => (batch) => batch.delete(doc.ref)),
    ...sessions.map((event) => (batch) => batch.set(club.collection("events").doc(event.id), {
      ...event,
      createdAt: now,
      updatedAt: now,
    }, { merge: true })),
  ];
  await commitInChunks(operations);
  console.log(`Updated training in ${projectId}/${clubId}.`);
  console.log(`Removed ${toDelete.length} existing training sessions from ${trainingFrom} to ${trainingTo}.`);
  console.log(`Added ${sessions.length} Tuesday/Wednesday Bowencraig sessions, 18:00-19:30.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
