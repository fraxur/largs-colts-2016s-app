import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const confirmed = process.argv.includes("--yes");
const withTraining = process.argv.includes("--with-training");
const trainingFrom = argValue("--from", "2026-08-18");
const trainingTo = argValue("--to", "2026-10-17");

if (!confirmed) {
  console.log("This will update live Firestore: Largs Orange/Largs Blue only, all players unassigned, player development reset, and all fixtures/training removed.");
  console.log(`To also add Tuesday/Thursday Bowencraig training from ${trainingFrom} to ${trainingTo}, include --with-training.`);
  console.log("Run again with: npm run reset:teams-events -- --yes");
  console.log("Or: npm run reset:teams-events -- --yes --with-training");
  process.exit(0);
}

initializeApp({
  credential: applicationDefault(),
  projectId,
});

const db = getFirestore();
const club = db.collection("clubs").doc(clubId);
const now = FieldValue.serverTimestamp();

const teams = [
  { id: "team1", name: "Largs Orange", colour: "#f97316", order: 1 },
  { id: "team2", name: "Largs Blue", colour: "#2563eb", order: 2 },
];
const oldTeamIds = ["orange", "blue", "yellow"];

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length) || fallback;
}

async function commitInChunks(operations, chunkSize = 400) {
  for (let index = 0; index < operations.length; index += chunkSize) {
    const batch = db.batch();
    operations.slice(index, index + chunkSize).forEach((operation) => operation(batch));
    await batch.commit();
  }
}

async function deleteCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  if (snapshot.empty) return 0;
  await commitInChunks(snapshot.docs.map((doc) => (batch) => batch.delete(doc.ref)));
  return snapshot.size;
}

async function resetTeams() {
  const operations = [];
  teams.forEach((team) => {
    operations.push((batch) => batch.set(club.collection("teams").doc(team.id), { ...team, updatedAt: now }, { merge: true }));
    operations.push((batch) => batch.set(club.collection("squads").doc(team.id), { ...team, updatedAt: now }, { merge: true }));
  });
  oldTeamIds.forEach((teamId) => {
    operations.push((batch) => batch.delete(club.collection("teams").doc(teamId)));
    operations.push((batch) => batch.delete(club.collection("squads").doc(teamId)));
  });
  await commitInChunks(operations);
}

async function unassignPlayers() {
  const [players, development, parentLinks, accessRequests, dataRequests] = await Promise.all([
    club.collection("players").get(),
    club.collection("playerDevelopment").get(),
    club.collection("parentLinks").get(),
    club.collection("accessRequests").get(),
    club.collection("dataRequests").get(),
  ]);

  const operations = [];
  players.docs.forEach((doc) => {
    operations.push((batch) => batch.set(doc.ref, { teamId: "unassigned", updatedAt: now }, { merge: true }));
  });
  development.docs.forEach((doc) => {
    operations.push((batch) => batch.set(doc.ref, {
      teamId: "unassigned",
      level: "Not assessed",
      band: "Not set",
      foot: "Not set",
      positions: [],
      notes: "",
      updatedAt: now,
    }, { merge: true }));
  });
  parentLinks.docs.forEach((doc) => {
    operations.push((batch) => batch.set(doc.ref, { playerTeamId: "unassigned", updatedAt: now }, { merge: true }));
  });
  accessRequests.docs.forEach((doc) => {
    operations.push((batch) => batch.set(doc.ref, { playerTeamId: "unassigned", updatedAt: now }, { merge: true }));
  });
  dataRequests.docs.forEach((doc) => {
    operations.push((batch) => batch.set(doc.ref, { playerTeamId: "unassigned", updatedAt: now }, { merge: true }));
  });
  await commitInChunks(operations);
  return players.size;
}

async function clearEvents() {
  const events = await club.collection("events").get();
  let deletedAvailability = 0;
  let deletedAttendance = 0;

  for (const eventDoc of events.docs) {
    deletedAvailability += await deleteCollection(club.collection("availability").doc(eventDoc.id).collection("players"));
    deletedAttendance += await deleteCollection(club.collection("attendance").doc(eventDoc.id).collection("players"));
  }

  await commitInChunks(events.docs.flatMap((eventDoc) => [
    (batch) => batch.delete(club.collection("events").doc(eventDoc.id)),
    (batch) => batch.delete(club.collection("availability").doc(eventDoc.id)),
    (batch) => batch.delete(club.collection("attendance").doc(eventDoc.id)),
  ]));

  return {
    events: events.size,
    availability: deletedAvailability,
    attendance: deletedAttendance,
  };
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

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function parseDateInput(value, fallback) {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
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
    venue: "Bowencraig (Home pitch)",
    venueId: "bowencraig",
    address: "55.77946, -4.856398",
    parkingAddress: "Bowencraig East Car Park, Irvine Rd, Fairlie, Largs KA29 0BG",
    meetTime: "",
    kit: "",
    notes: "18:00-19:30. Tuesday and Thursday training at Bowencraig. Bring boots, water and shin pads.",
  };
}

async function seedTrainingSessions() {
  const from = parseDateInput(trainingFrom, startOfToday());
  const to = parseDateInput(trainingTo, addDays(from, 60));
  const sessions = [];
  for (let cursor = new Date(from); cursor <= to; cursor = addDays(cursor, 1)) {
    const day = cursor.getDay();
    if (day === 2 || day === 4) sessions.push(trainingEvent(cursor));
  }
  await commitInChunks(sessions.map((event) => (batch) => {
    batch.set(club.collection("events").doc(event.id), { ...event, createdAt: now, updatedAt: now }, { merge: true });
  }));
  return sessions.length;
}

async function retargetMessages() {
  const [announcements, messages] = await Promise.all([
    club.collection("announcements").get(),
    club.collection("messages").get(),
  ]);
  const operations = [];
  [...announcements.docs, ...messages.docs].forEach((doc) => {
    if (oldTeamIds.includes(doc.data().teamId)) {
      operations.push((batch) => batch.set(doc.ref, { teamId: "all", updatedAt: now }, { merge: true }));
    }
  });
  await commitInChunks(operations);
  return operations.length;
}

async function main() {
  await resetTeams();
  const playerCount = await unassignPlayers();
  const eventCounts = await clearEvents();
  const trainingCount = withTraining ? await seedTrainingSessions() : 0;
  const retargetedMessages = await retargetMessages();
  console.log(`Reset live data in ${projectId}/${clubId}.`);
  console.log(`Teams: Largs Orange and Largs Blue. Old colour teams removed.`);
  console.log(`Players unassigned: ${playerCount}. Development records reset to Not assessed.`);
  console.log(`Deleted ${eventCounts.events} events, ${eventCounts.availability} availability records and ${eventCounts.attendance} attendance records.`);
  if (withTraining) console.log(`Added ${trainingCount} Tuesday/Thursday Bowencraig training sessions.`);
  console.log(`Retargeted ${retargetedMessages} old colour-team messages to All teams.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
