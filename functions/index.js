const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

async function parentLinksForPlayer(clubId, playerId) {
  const snapshot = await db
    .collection("clubs")
    .doc(clubId)
    .collection("parentLinks")
    .where("playerId", "==", playerId)
    .where("status", "==", "approved")
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function tokensForUsers(clubId, userIds) {
  if (!userIds.length) return [];
  const chunks = [];
  for (let index = 0; index < userIds.length; index += 10) {
    chunks.push(userIds.slice(index, index + 10));
  }

  const results = [];
  for (const chunk of chunks) {
    const snapshot = await db
      .collection("clubs")
      .doc(clubId)
      .collection("notificationTokens")
      .where("userId", "in", chunk)
      .get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token) results.push({ id: doc.id, ...data });
    });
  }
  return results;
}

async function sendPushToUsers(clubId, userIds, title, body, data = {}) {
  const uniqueUserIds = [...new Set(userIds)].filter(Boolean);
  if (!uniqueUserIds.length) return;

  await Promise.all(uniqueUserIds.map((userId) => db
    .collection("clubs")
    .doc(clubId)
    .collection("notifications")
    .add({
      userId,
      title,
      body,
      data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    })));

  const tokens = await tokensForUsers(clubId, uniqueUserIds);
  if (!tokens.length) {
    logger.info("No push tokens found", { clubId, userIds });
    return;
  }

  const response = await messaging.sendEachForMulticast({
    tokens: tokens.map((item) => item.token),
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value ?? "")])),
  });

  logger.info("Push notification sent", {
    clubId,
    successCount: response.successCount,
    failureCount: response.failureCount,
  });
}

exports.notifyParentOnAttendance = onDocumentWritten(
  "clubs/{clubId}/attendance/{eventId}/players/{playerId}",
  async (event) => {
    const after = event.data.after.exists ? event.data.after.data() : null;
    const before = event.data.before.exists ? event.data.before.data() : null;
    if (!after || !["present", "collected"].includes(after.status)) return;
    if (before && before.status === after.status) return;

    const { clubId, eventId, playerId } = event.params;
    const [playerDoc, eventDoc, links] = await Promise.all([
      db.collection("clubs").doc(clubId).collection("players").doc(playerId).get(),
      db.collection("clubs").doc(clubId).collection("events").doc(eventId).get(),
      parentLinksForPlayer(clubId, playerId),
    ]);

    if (!playerDoc.exists || !eventDoc.exists || !links.length) return;

    const player = playerDoc.data();
    const fixture = eventDoc.data();
    const title = after.status === "present"
      ? `${player.name} checked in`
      : `${player.name} collected`;
    const body = after.status === "present"
      ? `${player.name} has been marked present at ${fixture.title || "today's session"}.`
      : `${player.name} has been marked collected from ${fixture.title || "today's session"}.`;

    await sendPushToUsers(
      clubId,
      links.map((link) => link.parentUid).filter(Boolean),
      title,
      body,
      { type: "attendance", eventId, playerId, status: after.status },
    );
  },
);

exports.notifyParentsOnMessage = onDocumentCreated(
  "clubs/{clubId}/announcements/{messageId}",
  async (event) => {
    const { clubId, messageId } = event.params;
    const message = event.data.data();
    const linksSnapshot = await db
      .collection("clubs")
      .doc(clubId)
      .collection("parentLinks")
      .where("status", "==", "approved")
      .get();

    const parentUids = new Set();
    linksSnapshot.forEach((doc) => {
      const link = doc.data();
      if (message.teamId === "all" || link.playerTeamId === message.teamId) {
        if (link.parentUid) parentUids.add(link.parentUid);
      }
    });

    await sendPushToUsers(
      clubId,
      [...parentUids],
      message.title || "Largs Colts update",
      message.body || "New team update",
      { type: "message", messageId, teamId: message.teamId || "all" },
    );
  },
);
