import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const confirmed = process.argv.includes("--yes");
const keepExisting = process.argv.includes("--keep-existing");
const seasonTrainingFrom = argValue("--from", "2026-08-20");
const seasonTrainingTo = argValue("--to", "2026-10-17");

if (!confirmed) {
  console.log("This will update live Firestore with the 2026 league fixtures and training schedule.");
  console.log("Mapping: Orange fixture list -> Largs Orange. Blue fixture list -> Largs Blue.");
  console.log(`Training: Tuesday/Wednesday Bowencraig sessions from ${seasonTrainingFrom} to ${seasonTrainingTo}.`);
  console.log("By default it removes existing schedule items first so test fixtures/training are cleared.");
  console.log("Run again with: npm run seed:fixtures-2026 -- --yes");
  console.log("To keep existing schedule items and only add/overwrite these IDs, use: npm run seed:fixtures-2026 -- --yes --keep-existing");
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

const bowencraig = {
  venue: "Bowencraig (Home pitch)",
  venueId: "bowencraig",
  address: "55.77946, -4.856398",
  parkingAddress: "Bowencraig East Car Park, Irvine Rd, Fairlie, Largs KA29 0BG",
};

const fixtures = [
  // Orange list -> Largs Orange, 2016s League 2
  fixture("team1", "2016s League 2", "2026-08-22", false, "Stewarton Annick Echo"),
  fixture("team1", "2016s League 2", "2026-08-29", true, "Girvan Youth"),
  fixture("team1", "2016s League 2", "2026-09-05", false, "Cumnock Juniors White"),
  fixture("team1", "2016s League 2", "2026-09-12", true, "Tass Thistle Blue"),
  fixture("team1", "2016s League 2", "2026-09-19", false, "Crosshouse Reds"),
  fixture("team1", "2016s League 2", "2026-09-26", true, "Dean Thistle Blue"),
  fixture("team1", "2016s League 2", "2026-10-03", false, "Glenburn Blue"),
  fixture("team1", "2016s League 2", "2026-10-10", true, "Bonnyton Black"),
  fixture("team1", "2016s League 2", "2026-10-17", false, "Troon FC Black"),

  // Blue list -> Largs Blue, 2016s League 3
  fixture("team2", "2016s League 3", "2026-08-22", false, "Irvine Meadow Barca"),
  fixture("team2", "2016s League 3", "2026-08-29", true, "Ardeer Thistle"),
  fixture("team2", "2016s League 3", "2026-09-05", false, "Cambusdoon Rovers"),
  fixture("team2", "2016s League 3", "2026-09-12", true, "Shortlees United 2"),
  fixture("team2", "2016s League 3", "2026-09-19", false, "Bellfield Youth Blue"),
  fixture("team2", "2016s League 3", "2026-09-26", true, "Bonnyton White"),
  fixture("team2", "2016s League 3", "2026-10-03", false, "Tass Thistle Yellow"),
  fixture("team2", "2016s League 3", "2026-10-10", true, "Cumnock Juniors Blue"),
  freeWeek("team2", "2016s League 3", "2026-10-17"),
];

function teamName(teamId) {
  return teams.find((team) => team.id === teamId)?.name || "Largs Colts";
}

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length) || fallback;
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function fixture(teamId, competition, date, home, opponent) {
  const venue = home
    ? bowencraig
    : {
      venue: `${opponent} - venue TBC`,
      venueId: "away-custom",
      address: "Address to be confirmed",
      parkingAddress: "",
    };
  return {
    id: `${teamId}-${date.replaceAll("-", "")}-${slug(opponent)}`,
    type: "Fixture",
    title: home ? `${teamName(teamId)} vs ${opponent}` : `${teamName(teamId)} away to ${opponent}`,
    teamId,
    opponent,
    datetime: `${date}T12:00:00`,
    finishTime: "",
    ...venue,
    meetTime: "",
    kit: home ? "Home kit" : "Away kit",
    homeScore: "",
    awayScore: "",
    resultNotes: "",
    notes: `${competition}. Kick-off TBC. Report time TBC.${home ? " Home fixture." : " Away venue TBC."}`,
    competition,
    homeAway: home ? "home" : "away",
    timeTbc: true,
    source: "2026 league fixture list",
  };
}

function freeWeek(teamId, competition, date) {
  return {
    id: `${teamId}-${date.replaceAll("-", "")}-free-week`,
    type: "Free Week",
    title: `${teamName(teamId)} free week`,
    teamId,
    opponent: "",
    datetime: `${date}T12:00:00`,
    finishTime: "",
    venue: "No fixture",
    venueId: "away-custom",
    address: "No match scheduled",
    parkingAddress: "",
    meetTime: "",
    kit: "",
    homeScore: "",
    awayScore: "",
    resultNotes: "",
    notes: `${competition}. No match scheduled.`,
    competition,
    homeAway: "free-week",
    timeTbc: true,
    source: "2026 league fixture list",
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
    venue: "Bowencraig (Home pitch)",
    venueId: "bowencraig",
    address: bowencraig.address,
    parkingAddress: bowencraig.parkingAddress,
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
  const from = parseDateInput(seasonTrainingFrom);
  const to = parseDateInput(seasonTrainingTo);
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

async function deleteCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  if (snapshot.empty) return 0;
  await commitInChunks(snapshot.docs.map((doc) => (batch) => batch.delete(doc.ref)));
  return snapshot.size;
}

async function clearCurrentSchedule() {
  if (keepExisting) return { events: 0, availability: 0, attendance: 0 };
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

async function seedTeams() {
  await commitInChunks(teams.flatMap((team) => [
    (batch) => batch.set(club.collection("teams").doc(team.id), { ...team, updatedAt: now }, { merge: true }),
    (batch) => batch.set(club.collection("squads").doc(team.id), { ...team, updatedAt: now }, { merge: true }),
  ]));
}

async function seedEvents() {
  const training = trainingSessions();
  const events = [...fixtures, ...training];
  await commitInChunks(events.map((event) => (batch) => {
    batch.set(club.collection("events").doc(event.id), {
      ...event,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
  }));
  return { fixtures: fixtures.length, training: training.length, total: events.length };
}

async function main() {
  const deleted = await clearCurrentSchedule();
  await seedTeams();
  const seeded = await seedEvents();
  console.log(`Updated teams in ${projectId}/${clubId}: Largs Orange and Largs Blue.`);
  console.log(`Seeded ${seeded.fixtures} fixture-list items and ${seeded.training} training sessions (${seeded.total} events total).`);
  console.log("Mapping used: Orange fixture list -> Largs Orange. Blue fixture list -> Largs Blue.");
  if (!keepExisting) {
    console.log(`Removed ${deleted.events} existing schedule events, ${deleted.availability} availability records and ${deleted.attendance} attendance records first.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
