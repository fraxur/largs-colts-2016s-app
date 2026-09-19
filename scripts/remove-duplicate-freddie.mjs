const projectId = process.env.FIREBASE_PROJECT_ID || "largs-colts-2016s-app-c8909";
const clubId = process.env.LARGS_CLUB_ID || "largs-colts-2016s";
const apiKey = process.env.LARGS_FIREBASE_API_KEY || "AIzaSyDpavXw2gRiAAWLTGRLyNgoqMgOUbQ9hwM";
const confirmed = process.argv.includes("--yes");
const targetName = "Freddie Docherty";

function restString(field) {
  return field?.stringValue || "";
}

function restArrayStrings(field) {
  return (field?.arrayValue?.values || []).map((item) => item.stringValue || "").filter(Boolean);
}

function restBoolean(field) {
  return Boolean(field?.booleanValue);
}

function restNumber(field) {
  return Number(field?.integerValue ?? field?.doubleValue ?? 0) || 0;
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

function normalize(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method || "GET"} ${url} failed: ${body}`);
  }
  if (response.status === 204) return {};
  const text = await response.text();
  return text ? JSON.parse(text) : {};
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

async function listPath(token, path) {
  try {
    const response = await request(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return (response.documents || []).map((document) => ({
      id: document.name.split("/").pop(),
      path: document.name.split("/documents/").pop(),
      fields: document.fields || {},
    }));
  } catch (error) {
    if (String(error.message).includes("NOT_FOUND")) return [];
    throw error;
  }
}

async function listCollection(token, collectionName) {
  return listPath(token, `clubs/${clubId}/${collectionName}`);
}

async function deleteDocument(token, path) {
  await request(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
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

async function deleteIfExists(token, path) {
  await deleteDocument(token, path).catch((error) => {
    if (!String(error.message).includes("NOT_FOUND")) throw error;
  });
}

function playerFromDoc(doc) {
  return {
    id: doc.id,
    name: restString(doc.fields.name),
    status: restString(doc.fields.status),
    teamId: restString(doc.fields.teamId),
    role: restString(doc.fields.role),
    path: doc.path,
  };
}

function uniqueDateKeys(events) {
  return [...new Set(events
    .map((event) => restString(event.fields.datetime).slice(0, 10))
    .filter(Boolean))]
    .sort();
}

function activitySummary(player, events, attendanceDocs, availabilityDocs, matchStats, playerAwards, parentLinks, playerDocuments) {
  const attendanceMarks = attendanceDocs.filter((doc) => {
    const status = restString(doc.fields.status);
    return doc.id === player.id && ["present", "absent", "collected"].includes(status);
  }).length;
  const availabilityMarks = availabilityDocs.filter((doc) => {
    const status = restString(doc.fields.status);
    return doc.id === player.id && ["available", "unavailable"].includes(status);
  }).length;
  const selections = events.filter((event) => restArrayStrings(event.fields.selectedPlayerIds).includes(player.id)).length;
  const stats = matchStats.filter((doc) => restString(doc.fields.playerId) === player.id).length;
  const awards = playerAwards.filter((doc) => restString(doc.fields.playerId) === player.id || restString(doc.fields.trophyWithPlayerId) === player.id).length;
  const links = parentLinks.filter((doc) => restString(doc.fields.playerId) === player.id).length;
  const documents = playerDocuments.filter((doc) => restString(doc.fields.playerId) === player.id || restArrayStrings(doc.fields.recipientPlayerIds).includes(player.id)).length;
  return {
    attendanceMarks,
    availabilityMarks,
    selections,
    stats,
    awards,
    links,
    documents,
    score: attendanceMarks + availabilityMarks + selections + stats + awards + links + documents,
  };
}

function summaryLine(candidate) {
  const bits = candidate.summary;
  return `${candidate.player.id}: ${candidate.player.name} (${candidate.player.status || "no status"}) - score ${bits.score}; attendance ${bits.attendanceMarks}, availability ${bits.availabilityMarks}, selected ${bits.selections}, stats ${bits.stats}, awards ${bits.awards}, parent links ${bits.links}, documents ${bits.documents}`;
}

function isTargetPlayerName(player) {
  const name = normalize(player.name);
  const target = normalize(targetName);
  return name === target || (name.startsWith(target) && name.includes("duplicate"));
}

function isMarkedDuplicate(player) {
  return normalize(player.name).includes("duplicate");
}

function validAttendanceStatus(status) {
  return ["present", "absent", "collected"].includes(status);
}

function validAvailabilityStatus(status) {
  return ["available", "unavailable"].includes(status);
}

function pathSegmentAfter(path, segment) {
  const parts = String(path || "").split("/");
  const index = parts.indexOf(segment);
  return index >= 0 ? parts[index + 1] || "" : "";
}

function replaceIdInArray(values, fromId, toId) {
  const replaced = values.map((value) => (value === fromId ? toId : value));
  return [...new Set(replaced)];
}

function docForPath(docs, path) {
  return docs.find((doc) => doc.path === path);
}

async function migrateDuplicateReferences(token, duplicate, keeper, { events, attendanceDocs, availabilityDocs, matchStats, playerAwards, playerDocuments }) {
  const fromId = duplicate.player.id;
  const toPlayer = keeper.player;
  let migratedSelections = 0;
  let migratedAttendance = 0;
  let migratedAvailability = 0;
  let migratedStats = 0;
  let migratedAwards = 0;
  let migratedDocuments = 0;

  for (const event of events) {
    const selectedPlayerIds = restArrayStrings(event.fields.selectedPlayerIds);
    if (!selectedPlayerIds.includes(fromId)) continue;
    await patchDocument(token, `clubs/${clubId}/events/${event.id}`, {
      selectedPlayerIds: replaceIdInArray(selectedPlayerIds, fromId, toPlayer.id),
    });
    migratedSelections += 1;
  }

  for (const doc of attendanceDocs.filter((item) => item.id === fromId)) {
    const status = restString(doc.fields.status);
    if (!validAttendanceStatus(status)) continue;
    const eventId = pathSegmentAfter(doc.path, "attendance");
    const keeperPath = `clubs/${clubId}/attendance/${eventId}/players/${toPlayer.id}`;
    const keeperStatus = restString(docForPath(attendanceDocs, keeperPath)?.fields.status);
    if (!validAttendanceStatus(keeperStatus)) {
      await patchDocument(token, keeperPath, {
        playerId: toPlayer.id,
        eventId: restString(doc.fields.eventId) || eventId,
        status,
      });
      migratedAttendance += 1;
    }
  }

  for (const doc of availabilityDocs.filter((item) => item.id === fromId)) {
    const status = restString(doc.fields.status);
    if (!validAvailabilityStatus(status)) continue;
    const dateKey = pathSegmentAfter(doc.path, "availability");
    const keeperPath = `clubs/${clubId}/availability/${dateKey}/players/${toPlayer.id}`;
    const keeperStatus = restString(docForPath(availabilityDocs, keeperPath)?.fields.status);
    if (!validAvailabilityStatus(keeperStatus)) {
      await patchDocument(token, keeperPath, {
        playerId: toPlayer.id,
        eventId: restString(doc.fields.eventId) || dateKey,
        status,
        note: restString(doc.fields.note),
        liftOffer: restBoolean(doc.fields.liftOffer),
        liftSeats: restNumber(doc.fields.liftSeats),
        liftFrom: restString(doc.fields.liftFrom),
        updatedBy: restString(doc.fields.updatedBy),
      });
      migratedAvailability += 1;
    }
  }

  for (const doc of matchStats.filter((item) => restString(item.fields.playerId) === fromId)) {
    await patchDocument(token, `clubs/${clubId}/matchStats/${doc.id}`, {
      playerId: toPlayer.id,
      playerName: toPlayer.name,
      teamId: toPlayer.teamId,
    });
    migratedStats += 1;
  }

  for (const doc of playerAwards) {
    const patch = {};
    if (restString(doc.fields.playerId) === fromId) {
      patch.playerId = toPlayer.id;
      patch.playerName = toPlayer.name;
      patch.teamId = toPlayer.teamId;
    }
    if (restString(doc.fields.trophyWithPlayerId) === fromId) {
      patch.trophyWithPlayerId = toPlayer.id;
      patch.trophyWithName = toPlayer.name;
    }
    if (Object.keys(patch).length) {
      await patchDocument(token, `clubs/${clubId}/playerAwards/${doc.id}`, patch);
      migratedAwards += 1;
    }
  }

  for (const doc of playerDocuments) {
    const patch = {};
    if (restString(doc.fields.playerId) === fromId) {
      patch.playerId = toPlayer.id;
      patch.playerName = toPlayer.name;
      patch.playerTeamId = toPlayer.teamId;
    }
    const recipientPlayerIds = restArrayStrings(doc.fields.recipientPlayerIds);
    if (recipientPlayerIds.includes(fromId)) {
      patch.recipientPlayerIds = replaceIdInArray(recipientPlayerIds, fromId, toPlayer.id);
    }
    if (Object.keys(patch).length) {
      await patchDocument(token, `clubs/${clubId}/playerDocuments/${doc.id}`, patch);
      migratedDocuments += 1;
    }
  }

  return {
    migratedSelections,
    migratedAttendance,
    migratedAvailability,
    migratedStats,
    migratedAwards,
    migratedDocuments,
  };
}

const signInResult = await signIn();
const token = signInResult.idToken;

const [playerDocs, events, matchStats, playerAwards, parentLinks, playerDocuments] = await Promise.all([
  listCollection(token, "players"),
  listCollection(token, "events"),
  listCollection(token, "matchStats"),
  listCollection(token, "playerAwards"),
  listCollection(token, "parentLinks"),
  listCollection(token, "playerDocuments"),
]);

const players = playerDocs.map(playerFromDoc);
const freddies = players.filter((player) => isTargetPlayerName(player) && player.status !== "archived");
if (freddies.length < 2) {
  console.log(`Found ${freddies.length} active ${targetName} / duplicate-labelled record(s). Nothing to remove.`);
  process.exit(0);
}

const dateKeys = uniqueDateKeys(events);
const attendanceDocs = (await Promise.all(events.map((event) => listPath(token, `clubs/${clubId}/attendance/${event.id}/players`)))).flat();
const availabilityDocs = (await Promise.all(dateKeys.map((dateKey) => listPath(token, `clubs/${clubId}/availability/${dateKey}/players`)))).flat();

const candidates = freddies.map((player) => ({
  player,
  summary: activitySummary(player, events, attendanceDocs, availabilityDocs, matchStats, playerAwards, parentLinks, playerDocuments),
}));

console.log(`Found ${candidates.length} active ${targetName} records:`);
candidates.forEach((candidate) => console.log(`- ${summaryLine(candidate)}`));

let keeper;
let removals;
const markedDuplicates = candidates.filter((candidate) => isMarkedDuplicate(candidate.player));

if (markedDuplicates.length) {
  removals = markedDuplicates;
  const keeperCandidates = candidates.filter((candidate) => !isMarkedDuplicate(candidate.player));
  if (!keeperCandidates.length) {
    throw new Error("Refusing to delete automatically: all matching Freddie records are marked as duplicate.");
  }
  keeper = keeperCandidates.sort((a, b) => b.summary.score - a.summary.score || a.player.name.localeCompare(b.player.name))[0];
} else {
  const ranked = [...candidates].sort((a, b) => b.summary.score - a.summary.score);
  const topScore = ranked[0]?.summary.score ?? 0;
  const topCandidates = ranked.filter((candidate) => candidate.summary.score === topScore);
  if (!topScore || topCandidates.length !== 1) {
    throw new Error("Refusing to delete automatically: there is not a clear keeper. Rename the duplicate with '(Duplicate)' and run again.");
  }
  keeper = topCandidates[0];
  removals = ranked.filter((candidate) => candidate.player.id !== keeper.player.id && candidate.summary.score < keeper.summary.score);
}

if (!removals.length) {
  throw new Error("Refusing to delete automatically: no lower-priority duplicate was identified.");
}

const linkedRemoval = removals.find((candidate) => candidate.summary.links > 0);
if (linkedRemoval) {
  throw new Error(`Refusing to delete ${linkedRemoval.player.id}: it has parent links and needs manual parent-link review first.`);
}

console.log(`Keeping ${keeper.player.id}: ${keeper.player.name}.`);
console.log(`Merging/removing duplicate(s): ${removals.map((candidate) => `${candidate.player.id}: ${candidate.player.name}`).join(", ")}.`);

if (!confirmed) {
  console.log("Dry run only. Run with: npm run cleanup:duplicate-freddie -- --yes");
  process.exit(0);
}

for (const candidate of removals) {
  const playerId = candidate.player.id;
  const migration = await migrateDuplicateReferences(token, candidate, keeper, {
    events,
    attendanceDocs,
    availabilityDocs,
    matchStats,
    playerAwards,
    playerDocuments,
  });
  console.log(`Merged ${playerId}: ${JSON.stringify(migration)}.`);
  await deleteIfExists(token, `clubs/${clubId}/playerDevelopment/${playerId}`);
  await Promise.all(events.map((event) => deleteIfExists(token, `clubs/${clubId}/attendance/${event.id}/players/${playerId}`)));
  await Promise.all(dateKeys.map((dateKey) => deleteIfExists(token, `clubs/${clubId}/availability/${dateKey}/players/${playerId}`)));
  await deleteDocument(token, `clubs/${clubId}/players/${playerId}`);
  console.log(`Removed duplicate ${targetName} record ${playerId}.`);
}
