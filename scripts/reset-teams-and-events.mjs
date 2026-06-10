import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const confirmed = process.argv.includes("--yes");

if (!confirmed) {
  console.log("This will update live Firestore: Team 1/Team 2 only, all players unassigned, and all fixtures/training removed.");
  console.log("Run again with: npm run reset:teams-events -- --yes");
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
  { id: "team1", name: "Team 1", colour: "#850008", order: 1 },
  { id: "team2", name: "Team 2", colour: "#d3a84a", order: 2 },
];
const oldTeamIds = ["orange", "blue", "yellow"];

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
    operations.push((batch) => batch.set(doc.ref, { teamId: "unassigned", updatedAt: now }, { merge: true }));
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
  const retargetedMessages = await retargetMessages();
  console.log(`Reset live data in ${projectId}/${clubId}.`);
  console.log(`Teams: Team 1 and Team 2. Old colour teams removed.`);
  console.log(`Players unassigned: ${playerCount}. Development records kept.`);
  console.log(`Deleted ${eventCounts.events} events, ${eventCounts.availability} availability records and ${eventCounts.attendance} attendance records.`);
  console.log(`Retargeted ${retargetedMessages} old colour-team messages to All teams.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
