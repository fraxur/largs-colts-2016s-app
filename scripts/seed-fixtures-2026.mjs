import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const confirmed = process.argv.includes("--yes");
const keepExisting = process.argv.includes("--keep-existing");

if (!confirmed) {
  console.log("This will update live Firestore with the 2026 league fixtures.");
  console.log("Mapping: Orange fixture list -> Team 1. Blue fixture list -> Team 2.");
  console.log("By default it removes existing non-training schedule items first, leaving training in place.");
  console.log("Run again with: npm run seed:fixtures-2026 -- --yes");
  console.log("To keep existing match/free-week events, use: npm run seed:fixtures-2026 -- --yes --keep-existing");
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

const fixtures = [
  // Orange list -> Team 1, 2016s League 2
  fixture("team1", "2016s League 2", "2026-08-22", false, "Stewarton Annick Echo"),
  fixture("team1", "2016s League 2", "2026-08-29", true, "Girvan Youth"),
  fixture("team1", "2016s League 2", "2026-09-05", false, "Cumnock Juniors White"),
  fixture("team1", "2016s League 2", "2026-09-12", true, "Tass Thistle Blue"),
  fixture("team1", "2016s League 2", "2026-09-19", false, "Crosshouse Reds"),
  fixture("team1", "2016s League 2", "2026-09-26", true, "Dean Thistle Blue"),
  fixture("team1", "2016s League 2", "2026-10-03", false, "Glenburn Blue"),
  fixture("team1", "2016s League 2", "2026-10-10", true, "Bonnyton Black"),
  fixture("team1", "2016s League 2", "2026-10-17", false, "Troon FC Black"),

  // Blue list -> Team 2, 2016s League 3
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
  return teamId === "team1" ? "Team 1" : "Team 2";
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

async function clearCurrentMatchEvents() {
  if (keepExisting) return { events: 0, availability: 0, attendance: 0 };
  const events = await club.collection("events").get();
  const matchDocs = events.docs.filter((doc) => doc.data().type !== "Training");
  let deletedAvailability = 0;
  let deletedAttendance = 0;

  for (const eventDoc of matchDocs) {
    deletedAvailability += await deleteCollection(club.collection("availability").doc(eventDoc.id).collection("players"));
    deletedAttendance += await deleteCollection(club.collection("attendance").doc(eventDoc.id).collection("players"));
  }

  await commitInChunks(matchDocs.flatMap((eventDoc) => [
    (batch) => batch.delete(club.collection("events").doc(eventDoc.id)),
    (batch) => batch.delete(club.collection("availability").doc(eventDoc.id)),
    (batch) => batch.delete(club.collection("attendance").doc(eventDoc.id)),
  ]));

  return {
    events: matchDocs.length,
    availability: deletedAvailability,
    attendance: deletedAttendance,
  };
}

async function seedFixtures() {
  await commitInChunks(fixtures.map((event) => (batch) => {
    batch.set(club.collection("events").doc(event.id), {
      ...event,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
  }));
}

async function main() {
  const deleted = await clearCurrentMatchEvents();
  await seedFixtures();
  console.log(`Seeded ${fixtures.length} 2026 fixture-list items into ${projectId}/${clubId}.`);
  console.log("Mapping used: Orange -> Team 1. Blue -> Team 2.");
  if (!keepExisting) {
    console.log(`Removed ${deleted.events} existing non-training events, ${deleted.availability} availability records and ${deleted.attendance} attendance records first.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
