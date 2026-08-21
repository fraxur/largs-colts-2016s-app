import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";

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

const players = [
  player("p1", "Arthur Atkinson"),
  player("p2", "Harry Riley"),
  player("p3", "Jacob Hussain"),
  player("p4", "Harris Beckwith"),
  player("p5", "Jack Rossiter"),
  player("p6", "Jack Craig"),
  player("p7", "Murphy Auld"),
  player("p8", "Oscar McGarvey"),
  player("p9", "Fraser Clark"),
  player("p10", "Grace Blacklock"),
  player("p11", "Muir Balmforth"),
  player("p12", "Leo Lazzerini"),
  player("p13", "Kammy Cassidy"),
  player("p14", "Brooklyn Fraser"),
  player("p15", "Logan Fraser"),
  player("p16", "Luke Dowds"),
  player("p17", "Teddy Holland"),
  player("p18", "Gianluca Greenwood"),
  player("p19", "Luke McCready"),
  player("p20", "Ethan Maguire"),
  player("p21", "Brice Fergusson"),
  player("p22", "Luke McGowan"),
  player("p23", "Ethan Hughes"),
  player("p24", "Harris Jardine"),
  player("p25", "Lucas Reilly"),
  player("p26", "Jacob McShane"),
  player("p27", "Vinnie Johnstone"),
  player("p28", "Elliot Linton"),
];

const events = [];

const announcements = [
  {
    id: "welcome-live-app",
    title: "Largs Colts app is now live for testing",
    body: "Please sign in, check your linked child, and keep availability up to date for fixtures and training.",
    teamId: "all",
  },
];

function player(id, name, teamId = "unassigned") {
  return {
    id,
    name,
    teamId,
    role: "Player",
    parentName: "Parent Placeholder",
    parentPhone: "07000 000000",
    status: "active",
  };
}

function fixture(id, title, teamId, opponent, datetime, finishTime, venue, venueId, address, meetTime, kit, notes) {
  return {
    id,
    type: "Fixture",
    title,
    teamId,
    opponent,
    datetime,
    finishTime,
    venue,
    venueId,
    address,
    parkingAddress: venueId === "bowencraig" ? "Bowencraig East Car Park, Irvine Rd, Fairlie, Largs KA29 0BG" : "",
    meetTime,
    kit,
    notes,
  };
}

function training(id, datetime) {
  return {
    id,
    type: "Training",
    title: "Training",
    teamId: "all",
    opponent: "",
    datetime,
    finishTime: "19:30",
    venue: "Bowencraig (Home pitch)",
    venueId: "bowencraig",
    address: "55.77946, -4.856398",
    parkingAddress: "Bowencraig East Car Park, Irvine Rd, Fairlie, Largs KA29 0BG",
    meetTime: "",
    kit: "",
    notes: "18:00-19:30. All teams. Bring boots, water and shin pads.",
  };
}

function playersForEvent(event) {
  return event.teamId === "all" ? players : players.filter((item) => item.teamId === event.teamId);
}

async function seed() {
  const batch = db.batch();

  batch.set(club, {
    name: "Largs Colts 2016s",
    supportEmail: "fraxur@outlook.com",
    updatedAt: now,
  }, { merge: true });

  teams.forEach((team) => {
    batch.set(club.collection("teams").doc(team.id), { ...team, updatedAt: now }, { merge: true });
    batch.set(club.collection("squads").doc(team.id), { ...team, updatedAt: now }, { merge: true });
  });

  players.forEach((item) => {
    batch.set(club.collection("players").doc(item.id), { ...item, updatedAt: now }, { merge: true });
  });

  events.forEach((event) => {
    batch.set(club.collection("events").doc(event.id), { ...event, updatedAt: now }, { merge: true });
    playersForEvent(event).forEach((item) => {
      batch.set(club.collection("availability").doc(event.id).collection("players").doc(item.id), {
        playerId: item.id,
        eventId: event.id,
        status: "unknown",
        note: "",
        liftOffer: false,
        liftSeats: 0,
        liftFrom: "",
        updatedAt: now,
      }, { merge: true });
      batch.set(club.collection("attendance").doc(event.id).collection("players").doc(item.id), {
        playerId: item.id,
        eventId: event.id,
        status: "unknown",
        updatedAt: now,
      }, { merge: true });
    });
  });

  announcements.forEach((announcement) => {
    batch.set(club.collection("announcements").doc(announcement.id), {
      ...announcement,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
  });

  await batch.commit();
  console.log(`Seeded ${players.length} players, ${teams.length} squads and ${events.length} events into ${projectId}/${clubId}.`);
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
