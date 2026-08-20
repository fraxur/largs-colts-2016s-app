import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";

const playersToAdd = [
  player("p27", "Vinnie Johnstone", ["Centre Midfield"]),
  player("p28", "Elliot Linton", ["Right Back"]),
];

initializeApp({
  credential: applicationDefault(),
  projectId,
});

const db = getFirestore();
const club = db.collection("clubs").doc(clubId);
const now = FieldValue.serverTimestamp();

function player(id, name, positions = []) {
  return {
    id,
    name,
    teamId: "unassigned",
    role: "Player",
    parentName: "Parent Placeholder",
    parentPhone: "07000 000000",
    status: "active",
    positions,
  };
}

function developmentRecord(item, playerId, teamId = "unassigned") {
  return {
    id: playerId,
    playerId,
    playerName: item.name,
    teamId,
    level: "Not assessed",
    band: "Not set",
    foot: "Not set",
    positions: item.positions,
    notes: "",
    reviewedBy: "",
    reviewedByName: "",
  };
}

async function existingPlayerByName(name) {
  const snapshot = await club.collection("players").where("name", "==", name).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

async function main() {
  const batch = db.batch();
  const added = [];
  const updated = [];

  for (const item of playersToAdd) {
    const existingByName = await existingPlayerByName(item.name);
    const preferredPlayerRef = club.collection("players").doc(item.id);
    const existingById = existingByName ? null : await preferredPlayerRef.get();
    const existingPlayer = existingByName || (existingById?.exists ? existingById : null);
    const playerId = existingPlayer?.id || item.id;
    const playerRef = existingPlayer?.ref || preferredPlayerRef;
    const currentPlayer = existingPlayer?.data() || {};
    const developmentRef = club.collection("playerDevelopment").doc(playerId);
    const developmentSnap = await developmentRef.get();

    const { positions, ...playerData } = item;

    if (existingPlayer) {
      batch.set(playerRef, {
        id: playerId,
        name: item.name,
        status: currentPlayer.status || "active",
        updatedAt: now,
      }, { merge: true });
      updated.push(item.name);
    } else {
      batch.set(playerRef, {
        ...playerData,
        createdAt: now,
        updatedAt: now,
      }, { merge: true });
      added.push(item.name);
    }

    const developmentPatch = {
      id: playerId,
      playerId,
      playerName: item.name,
      teamId: currentPlayer.teamId || "unassigned",
      positions,
      updatedAt: now,
    };

    if (!developmentSnap.exists) {
      batch.set(developmentRef, {
        ...developmentRecord(item, playerId, currentPlayer.teamId || "unassigned"),
        createdAt: now,
        updatedAt: now,
      }, { merge: true });
    } else {
      batch.set(developmentRef, developmentPatch, { merge: true });
    }
  }

  if (added.length || updated.length) await batch.commit();

  console.log(`Checked ${playersToAdd.length} players in ${projectId}/${clubId}.`);
  console.log(`Added: ${added.length ? added.join(", ") : "none"}.`);
  console.log(`Updated existing: ${updated.length ? updated.join(", ") : "none"}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
