const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const apiKey = process.env.LARGS_FIREBASE_API_KEY || "AIzaSyDpavXw2gRiAAWLTGRLyNgoqMgOUbQ9hwM";
const confirmed = process.argv.includes("--yes");

const availabilityDate = "2026-08-29";

const availableAliases = [
  "Brooklyn",
  "Oscar",
  "Jack R",
  "Harry",
  "Jacob H",
  "Ethan H",
  "G",
  "Murphy",
  "Arthur",
  "Luke M",
  "Lucas",
  "Harris",
  "Kammy",
  "Grace",
  "Luke D",
  "Ethan Maguire",
  "Teddy",
  "Luke McCready",
  "Brice",
  "Jack C",
  "Vinnie",
  "Logan",
];

const orangeAliases = [
  "Luke McCready",
  "Harry",
  "Teddy",
  "Harris",
  "Jack C",
  "Oscar",
  "Murphy",
  "G",
  "Vinnie",
];

const blueAliases = [
  "Arthur",
  "Jacob H",
  "Brice",
  "Luke M",
  "Brooklyn",
  "Logan",
  "Luke D",
  "Jack R",
  "Kammy",
];

const aliasMap = {
  Arthur: "Arthur Atkinson",
  Brice: "Brice Fergusson",
  Brooklyn: "Brooklyn Fraser",
  "Ethan H": "Ethan Hughes",
  "Ethan Maguire": "Ethan Maguire",
  G: "Gianluca Greenwood",
  Grace: "Grace Blacklock",
  Harris: "Harris Beckwith",
  Harry: "Harry Riley",
  "Jack C": "Jack Craig",
  "Jack R": "Jack Rossiter",
  "Jacob H": "Jacob Hussain",
  Kammy: "Kammy Cassidy",
  Logan: "Logan Fraser",
  Lucas: "Lucas Reilly",
  "Luke D": "Luke Dowds",
  "Luke M": "Luke McGowan",
  "Luke McCready": "Luke McCready",
  Murphy: "Murphy Auld",
  Oscar: "Oscar McGarvey",
  Teddy: "Teddy Holland",
  Vinnie: "Vinnie Johnstone",
};

if (!confirmed) {
  console.log("This updates live Firestore for the 29 Aug matchday:");
  console.log("- marks the supplied 22 players available for the weekend");
  console.log("- clears other active players back to no reply for that date");
  console.log("- selects 9 players for Largs Orange and 9 for Largs Blue");
  console.log("Run with: node scripts/update-aug29-matchday.mjs --yes");
  console.log("Set LARGS_COACH_EMAIL and LARGS_COACH_PASSWORD first.");
  process.exit(0);
}

function restValue(value) {
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  if (Array.isArray(value)) return { arrayValue: { values: value.map((item) => ({ stringValue: item })) } };
  return { stringValue: String(value ?? "") };
}

function restFields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, restValue(value)]));
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method || "GET"} ${url} failed: ${body}`);
  }
  return response.json();
}

async function signIn() {
  const email = process.env.LARGS_COACH_EMAIL;
  const password = process.env.LARGS_COACH_PASSWORD;
  if (!email || !password) {
    throw new Error("Set LARGS_COACH_EMAIL and LARGS_COACH_PASSWORD before running this script.");
  }
  return request(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
}

async function listCollection(token, collectionName) {
  const response = await request(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clubs/${clubId}/${collectionName}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (response.documents || []).map((document) => ({
    id: document.name.split("/").pop(),
    fields: document.fields || {},
  }));
}

function fromDoc(doc) {
  return {
    id: doc.id,
    name: doc.fields.name?.stringValue || "",
    status: doc.fields.status?.stringValue || "",
    teamId: doc.fields.teamId?.stringValue || "",
  };
}

function resolveAliases(players, aliases) {
  return aliases.map((alias) => {
    const expectedName = aliasMap[alias];
    const player = players.find((item) => item.name === expectedName);
    if (!player) throw new Error(`Could not find player for alias "${alias}" (${expectedName})`);
    return player;
  });
}

async function patchDocument(token, path, data) {
  const url = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`);
  Object.keys(data).forEach((field) => url.searchParams.append("updateMask.fieldPaths", field));
  await request(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: restFields(data) }),
  });
}

const signInResult = await signIn();
const token = signInResult.idToken;
const coachUid = signInResult.localId;

const players = (await listCollection(token, "players"))
  .map(fromDoc)
  .filter((player) => player.status === "active");
const events = await listCollection(token, "events");

const availablePlayers = resolveAliases(players, availableAliases);
const availableIds = new Set(availablePlayers.map((player) => player.id));
const orangePlayers = resolveAliases(players, orangeAliases);
const bluePlayers = resolveAliases(players, blueAliases);

const orangeEvent = events.find((event) => event.id === "team1-20260829-girvan-youth");
const blueEvent = events.find((event) => event.id === "team2-20260829-ardeer-thistle");
if (!orangeEvent || !blueEvent) throw new Error("Could not find both 29 Aug fixture documents.");

for (const player of players) {
  await patchDocument(token, `clubs/${clubId}/availability/${availabilityDate}/players/${player.id}`, {
    playerId: player.id,
    eventId: availabilityDate,
    status: availableIds.has(player.id) ? "available" : "unknown",
    note: "",
    liftOffer: false,
    liftSeats: 0,
    liftFrom: "",
    updatedBy: coachUid,
  });
}

await patchDocument(token, `clubs/${clubId}/events/${orangeEvent.id}`, {
  selectedPlayerIds: orangePlayers.map((player) => player.id),
});
await patchDocument(token, `clubs/${clubId}/events/${blueEvent.id}`, {
  selectedPlayerIds: bluePlayers.map((player) => player.id),
});

const selectedIds = new Set([...orangePlayers, ...bluePlayers].map((player) => player.id));
const notSelected = availablePlayers.filter((player) => !selectedIds.has(player.id));

console.log(`Updated ${availabilityDate} availability: ${availablePlayers.length} available, ${players.length - availablePlayers.length} no reply.`);
console.log(`Largs Orange selected: ${orangePlayers.map((player) => player.name).join(", ")}`);
console.log(`Largs Blue selected: ${bluePlayers.map((player) => player.name).join(", ")}`);
console.log(`Available but not selected: ${notSelected.map((player) => player.name).join(", ")}`);
