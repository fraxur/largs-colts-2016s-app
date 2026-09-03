const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const apiKey = process.env.LARGS_FIREBASE_API_KEY || "AIzaSyDpavXw2gRiAAWLTGRLyNgoqMgOUbQ9hwM";
const confirmed = process.argv.includes("--yes");

const playersToAdd = [
  player("p27", "Vinnie Johnstone", ["Centre Midfield"], "Centre Midfield"),
  player("p28", "Elliot Linton", ["Right Back"], "Right Back"),
  player("p29", "Freddie Docherty", [], "Unassigned"),
];

if (!confirmed) {
  console.log("This adds/updates the extra live Firestore players:");
  playersToAdd.forEach((item) => {
    console.log(`- ${item.name}: ${item.teamId}, ${item.role}`);
  });
  console.log("Run with: node scripts/add-new-players.mjs --yes");
  console.log("Set LARGS_COACH_EMAIL and LARGS_COACH_PASSWORD first.");
  process.exit(0);
}

function player(id, name, positions = [], role = "Player") {
  return {
    id,
    name,
    teamId: "unassigned",
    role,
    parentName: "Parent Placeholder",
    parentPhone: "07000 000000",
    status: "active",
    positions,
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
    role: restString(doc.fields.role),
    parentName: restString(doc.fields.parentName),
    parentPhone: restString(doc.fields.parentPhone),
  };
}

function nextPlayerId(players, preferredId, existingByName) {
  if (existingByName) return existingByName.id;
  if (!players.some((item) => item.id === preferredId)) return preferredId;
  const nextNumber = Math.max(
    0,
    ...players
      .map((item) => /^p(\d+)$/.exec(item.id)?.[1])
      .filter(Boolean)
      .map(Number),
  ) + 1;
  return `p${nextNumber}`;
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

function developmentRecord(item, playerId) {
  return {
    id: playerId,
    playerId,
    playerName: item.name,
    teamId: item.teamId,
    level: "Not assessed",
    band: "Not set",
    foot: "Not set",
    positions: item.positions,
    notes: "",
    reviewedBy: "",
    reviewedByName: "",
  };
}

const signInResult = await signIn();
const token = signInResult.idToken;
const players = (await listCollection(token, "players")).map(fromPlayerDoc);
const developmentDocs = await listCollection(token, "playerDevelopment");
const now = new Date().toISOString();
const added = [];
const updated = [];

for (const item of playersToAdd) {
  const existingByName = players.find((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase());
  const playerId = nextPlayerId(players, item.id, existingByName);
  const playerData = {
    id: playerId,
    name: item.name,
    teamId: existingByName?.teamId || item.teamId,
    role: existingByName?.role || item.role,
    parentName: existingByName?.parentName || item.parentName,
    parentPhone: existingByName?.parentPhone || item.parentPhone,
    status: existingByName?.status || item.status,
    updatedAt: now,
  };
  if (!existingByName) playerData.createdAt = now;

  await patchDocument(token, `clubs/${clubId}/players/${playerId}`, playerData);
  const existingDevelopment = developmentDocs.some((doc) => doc.id === playerId);
  const developmentPatch = existingDevelopment
    ? {
      id: playerId,
      playerId,
      playerName: item.name,
      teamId: playerData.teamId,
      updatedAt: now,
    }
    : {
      ...developmentRecord({ ...item, teamId: playerData.teamId }, playerId),
      createdAt: now,
      updatedAt: now,
    };
  await patchDocument(token, `clubs/${clubId}/playerDevelopment/${playerId}`, developmentPatch);

  if (existingByName) {
    updated.push(item.name);
  } else {
    players.push({ ...playerData });
    added.push(item.name);
  }
}

console.log(`Checked ${playersToAdd.length} players in ${projectId}/${clubId}.`);
console.log(`Added: ${added.length ? added.join(", ") : "none"}.`);
console.log(`Updated existing: ${updated.length ? updated.join(", ") : "none"}.`);
