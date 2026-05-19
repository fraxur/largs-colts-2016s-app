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
  { id: "orange", name: "Orange", colour: "#f97316", order: 1 },
  { id: "blue", name: "Blue", colour: "#2563eb", order: 2 },
  { id: "yellow", name: "Yellow", colour: "#eab308", order: 3 },
];

const players = [
  player("p1", "Arthur Atkinson", "orange"),
  player("p2", "Harry Riley", "orange"),
  player("p3", "Jacob Hussain", "orange"),
  player("p4", "Harris Beckwith", "orange"),
  player("p5", "Jack Rossiter", "orange"),
  player("p6", "Jack Craig", "orange"),
  player("p7", "Murphy Auld", "orange"),
  player("p8", "Oscar McGarvey", "orange"),
  player("p9", "Fraser Clark", "orange"),
  player("p10", "Grace Blacklock", "blue"),
  player("p11", "Muir Balmforth", "blue"),
  player("p12", "Leo Lazzerini", "blue"),
  player("p13", "Kammy Cassidy", "blue"),
  player("p14", "Brooklyn Fraser", "blue"),
  player("p15", "Logan Fraser", "blue"),
  player("p16", "Luke Dowds", "blue"),
  player("p17", "Teddy Holland", "blue"),
  player("p18", "Gianluca Greenwood", "blue"),
  player("p19", "Luke McCready", "yellow"),
  player("p20", "Ethan Maguire", "yellow"),
  player("p21", "Brice Fergusson", "yellow"),
  player("p22", "Luke McGowan", "yellow"),
  player("p23", "Ethan Hughes", "yellow"),
  player("p24", "Harris Jardine", "yellow"),
  player("p25", "Lucas Reilly", "yellow"),
  player("p26", "Jacob McShane", "yellow"),
];

const events = [
  fixture("e1", "Blue home match", "blue", "Opposition TBC", "2026-05-16T09:30", "10:45", "Bowencraig (Home pitch)", "bowencraig", "55.77946, -4.856398", "09:00", "Home kit", "Home match. Report for 9:00am."),
  fixture("e2", "Yellow away to Bellfield", "yellow", "Bellfield", "2026-05-16T10:00", "11:15", "Bellfield Estate", "away-custom", "Bellfield Estate, Kilmarnock KA1 3XG", "09:30", "Away kit", "Grass pitch. Please report for 9:30am."),
  training("t1", "2026-05-19T18:00"),
  training("t2", "2026-05-20T18:00"),
  training("t3", "2026-05-26T18:00"),
  training("t4", "2026-05-27T18:00"),
];

const announcements = [
  {
    id: "welcome-live-app",
    title: "Largs Colts app is now live for testing",
    body: "Please sign in, check your linked child, and keep availability up to date for fixtures and training.",
    teamId: "all",
  },
];

function player(id, name, teamId) {
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
        snacks: false,
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
