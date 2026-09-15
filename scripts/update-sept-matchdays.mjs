const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const apiKey = process.env.LARGS_FIREBASE_API_KEY || "AIzaSyDpavXw2gRiAAWLTGRLyNgoqMgOUbQ9hwM";
const confirmed = process.argv.includes("--yes");

const matchdays = [
  {
    date: "2026-09-12",
    note: "12 Sep selections and available-but-left-out players",
    availableAliases: [
      "Leo",
      "Jacob H",
      "Harry R",
      "Jack R",
      "Harris",
      "Murphy",
      "Oscar",
      "Brooklyn",
      "Logan",
      "Luke D",
      "Luke McCready",
      "Elliot",
      "Lucas",
      "Luke M",
      "Ethan H",
      "Ethan Maguire",
      "Brice",
      "Teddy",
      "Kammy",
      "G",
      "Vinnie",
      "Jack C",
      "Muir",
      "Arthur",
      "Harris L",
      "Jacob McShane",
    ],
    selections: [
      {
        eventId: "team1-20260912-tass-thistle-blue",
        label: "Largs Orange",
        aliases: ["Leo", "Jacob H", "Harry R", "Jack R", "Harris", "Murphy", "Oscar", "Brooklyn", "Logan", "Luke D"],
      },
      {
        eventId: "team2-20260912-shortlees-united-2",
        label: "Largs Blue",
        aliases: ["Luke McCready", "Elliot", "Lucas", "Luke M", "Ethan H", "Ethan Maguire", "Brice", "Teddy", "Kammy", "G"],
      },
    ],
  },
  {
    date: "2026-09-19",
    note: "19 Sep availability only, no players selected yet",
    availableAliases: [
      "Leo",
      "Ethan H",
      "Harry R",
      "Jacob McShane",
      "Brice",
      "Muir",
      "Lucas",
      "Jacob H",
      "Elliot",
      "Ethan Maguire",
      "Harris",
      "Luke M",
      "Kammy",
      "Logan",
      "Jack R",
      "Brooklyn",
      "Oscar",
      "Luke D",
    ],
    selections: [
      {
        eventId: "team1-20260919-crosshouse-reds",
        label: "Largs Orange",
        aliases: [],
      },
      {
        eventId: "team2-20260919-bellfield-youth-blue",
        label: "Largs Blue",
        aliases: [],
      },
    ],
  },
];

const aliasMap = {
  Arthur: "Arthur Atkinson",
  Brice: "Brice Fergusson",
  Brooklyn: "Brooklyn Fraser",
  Elliot: "Elliot Linton",
  "Elliot Linton": "Elliot Linton",
  "Ethan H": "Ethan Hughes",
  "Ethan Hughes": "Ethan Hughes",
  "Ethan Maguire": "Ethan Maguire",
  Freddie: "Freddie Docherty",
  G: "Gianluca Greenwood",
  "Gianluca Greenwood": "Gianluca Greenwood",
  Grace: "Grace Blacklock",
  Harris: "Harris Beckwith",
  "Harris Beckwith": "Harris Beckwith",
  Harry: "Harry Riley",
  "Harry R": "Harry Riley",
  "Harry Riley": "Harry Riley",
  "Jack C": "Jack Craig",
  "Jack Craig": "Jack Craig",
  "Jack R": "Jack Rossiter",
  "Jack Rossiter": "Jack Rossiter",
  Jacob: "Jacob Hussain",
  "Jacob H": "Jacob Hussain",
  "Jacob Hussain": "Jacob Hussain",
  "Jacob McShane": "Jacob McShane",
  Kammy: "Kammy Cassidy",
  "Kammy Cassidy": "Kammy Cassidy",
  Leo: "Leo Lazzerini",
  "Leo Lazzerini": "Leo Lazzerini",
  Logan: "Logan Fraser",
  "Logan Fraser": "Logan Fraser",
  Lucas: "Lucas Reilly",
  "Lucas Reilly": "Lucas Reilly",
  "Luke D": "Luke Dowds",
  "Luke Dowds": "Luke Dowds",
  "Luke M": "Luke McGowan",
  "Luke McGowan": "Luke McGowan",
  "Luke McCreadie": "Luke McCready",
  "Luke McCready": "Luke McCready",
  Muir: "Muir Balmforth",
  "Muir Balmforth": "Muir Balmforth",
  Murphy: "Murphy Auld",
  "Murphy Auld": "Murphy Auld",
  Oscar: "Oscar McGarvey",
  "Oscar McGarvey": "Oscar McGarvey",
  Teddy: "Teddy Holland",
  "Teddy Holland": "Teddy Holland",
  Vinnie: "Vinnie Johnstone",
  "Vinnie Johnstone": "Vinnie Johnstone",
};

if (!confirmed) {
  console.log("This updates live Firestore for the September matchdays:");
  matchdays.forEach((matchday) => {
    console.log(`- ${matchday.date}: ${matchday.note}`);
  });
  console.log("Run with: npm run update:sept-matchdays -- --yes");
  console.log("Set LARGS_COACH_EMAIL and LARGS_COACH_PASSWORD first.");
  process.exit(0);
}

function normalize(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function nameParts(name = "") {
  const parts = String(name).trim().split(/\s+/);
  return {
    first: parts[0] || "",
    last: parts.slice(1).join(" "),
  };
}

function restValue(value) {
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  if (Array.isArray(value)) return { arrayValue: { values: value.map((item) => ({ stringValue: String(item) })) } };
  return { stringValue: String(value ?? "") };
}

function restFields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, restValue(value)]));
}

function restString(field) {
  return field?.stringValue || "";
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

function fromPlayerDoc(doc) {
  return {
    id: doc.id,
    name: restString(doc.fields.name),
    status: restString(doc.fields.status),
    teamId: restString(doc.fields.teamId),
  };
}

function resolveAlias(players, alias, alreadyResolved = new Set()) {
  const expected = aliasMap[alias] || alias;
  const exact = players.find((player) => normalize(player.name) === normalize(expected));
  if (exact) return exact;

  const aliasBits = nameParts(alias);
  if (aliasBits.first && aliasBits.last.length === 1) {
    const initialMatches = players.filter((player) => {
      const playerBits = nameParts(player.name);
      return normalize(playerBits.first) === normalize(aliasBits.first)
        && normalize(playerBits.last).startsWith(normalize(aliasBits.last));
    });
    if (initialMatches.length === 1) return initialMatches[0];

    const sameFirstUnused = players.filter((player) => {
      const playerBits = nameParts(player.name);
      return normalize(playerBits.first) === normalize(aliasBits.first) && !alreadyResolved.has(player.id);
    });
    if (sameFirstUnused.length === 1) return sameFirstUnused[0];
  }

  const firstNameMatches = players.filter((player) => {
    const playerBits = nameParts(player.name);
    return normalize(playerBits.first) === normalize(alias);
  });
  if (firstNameMatches.length === 1) return firstNameMatches[0];

  throw new Error(`Could not find one active player for alias "${alias}" (${expected}). Matches: ${firstNameMatches.map((player) => player.name).join(", ") || "none"}`);
}

function resolveAliases(players, aliases) {
  const resolved = [];
  const seen = new Set();
  aliases.forEach((alias) => {
    const player = resolveAlias(players, alias, seen);
    if (seen.has(player.id)) {
      throw new Error(`Alias "${alias}" resolves to ${player.name}, but that player is already listed for this matchday.`);
    }
    seen.add(player.id);
    resolved.push(player);
  });
  return resolved;
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
  .map(fromPlayerDoc)
  .filter((player) => player.status === "active");
const events = await listCollection(token, "events");

for (const matchday of matchdays) {
  const availablePlayers = resolveAliases(players, matchday.availableAliases);
  const availableIds = new Set(availablePlayers.map((player) => player.id));
  const eventSummaries = [];

  for (const player of players) {
    await patchDocument(token, `clubs/${clubId}/availability/${matchday.date}/players/${player.id}`, {
      playerId: player.id,
      eventId: matchday.date,
      status: availableIds.has(player.id) ? "available" : "unknown",
      note: "",
      liftOffer: false,
      liftSeats: 0,
      liftFrom: "",
      updatedBy: coachUid,
    });
  }

  for (const selection of matchday.selections) {
    const event = events.find((item) => item.id === selection.eventId);
    if (!event) throw new Error(`Could not find fixture document ${selection.eventId}.`);
    const selectedPlayers = resolveAliases(players, selection.aliases);
    await patchDocument(token, `clubs/${clubId}/events/${selection.eventId}`, {
      selectedPlayerIds: selectedPlayers.map((player) => player.id),
    });
    eventSummaries.push(`${selection.label}: ${selectedPlayers.length ? selectedPlayers.map((player) => player.name).join(", ") : "none selected yet"}`);
  }

  const selectedIds = new Set(matchday.selections.flatMap((selection) => resolveAliases(players, selection.aliases).map((player) => player.id)));
  const notSelected = availablePlayers.filter((player) => !selectedIds.has(player.id));

  console.log(`Updated ${matchday.date}: ${availablePlayers.length} available, ${players.length - availablePlayers.length} no reply.`);
  eventSummaries.forEach((summary) => console.log(summary));
  console.log(`Available but not selected: ${notSelected.length ? notSelected.map((player) => player.name).join(", ") : "none"}.`);
}
