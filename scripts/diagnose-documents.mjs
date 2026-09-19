import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const clubId = "largs-colts-2016s";

function configValue(source, key) {
  return source.match(new RegExp(`${key}:\\s*"([^"]+)"`))?.[1] || "";
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Set it before running this diagnostic.`);
  return value;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    const message = body?.error?.message || body?.error?.status || response.statusText;
    const error = new Error(`${response.status} ${message}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

function restValue(value) {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(restValue);
  if ("mapValue" in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, restValue(item)]));
  return null;
}

function restDoc(item) {
  const id = String(item.name || "").split("/").pop();
  return { id, ...Object.fromEntries(Object.entries(item.fields || {}).map(([key, value]) => [key, restValue(value)])) };
}

async function signIn({ apiKey, email, password }) {
  const body = await requestJson(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  return body.idToken;
}

async function listCollection({ projectId, token, collection }) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clubs/${clubId}/${collection}?pageSize=300`;
  const body = await requestJson(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (body.documents || []).map(restDoc);
}

async function checkStorageObject({ bucket, token, path }) {
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Firebase ${token}` },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  return {
    ok: response.ok,
    status: response.status,
    code: body?.error?.code || body?.error?.status || "",
    message: body?.error?.message || response.statusText,
    contentType: body?.contentType || "",
    size: Number(body?.size || 0),
  };
}

function summarizePath(path = "") {
  const parts = String(path).split("/");
  const fileName = parts.at(-1) || "";
  return {
    area: parts[2] || "",
    target: parts[3] || "",
    documentId: parts[4] || "",
    file: fileName,
  };
}

async function checkCollection({ label, docs, bucket, token }) {
  console.log(`\n${label}: ${docs.length} document record(s)`);
  if (!docs.length) return { total: 0, failed: 0 };

  let failed = 0;
  for (const doc of docs) {
    const path = String(doc.storagePath || "");
    if (!path) {
      failed += 1;
      console.log(`- FAIL ${doc.id}: no storagePath in Firestore`);
      continue;
    }
    const result = await checkStorageObject({ bucket, token, path });
    const summary = summarizePath(path);
    const title = doc.title || doc.originalFileName || doc.id;
    if (result.ok) {
      console.log(`- OK   ${doc.id}: ${title} | ${result.contentType || "unknown type"} | ${result.size || "unknown"} bytes`);
    } else {
      failed += 1;
      console.log(`- FAIL ${doc.id}: ${title}`);
      console.log(`       Storage ${result.status} ${result.code || ""}: ${result.message}`);
      console.log(`       Path: ${summary.area}/${summary.target}/${summary.documentId}/${summary.file}`);
    }
  }
  return { total: docs.length, failed };
}

const configSource = await readFile(join(root, "firebase-config.js"), "utf8");
const apiKey = configValue(configSource, "apiKey");
const projectId = configValue(configSource, "projectId");
const bucket = configValue(configSource, "storageBucket");
const email = requiredEnv("LARGS_COACH_EMAIL");
const password = requiredEnv("LARGS_COACH_PASSWORD");

if (!apiKey || !projectId || !bucket) {
  throw new Error("Could not read Firebase config from firebase-config.js.");
}

const token = await signIn({ apiKey, email, password });
const [playerDocuments, coachDocuments] = await Promise.all([
  listCollection({ projectId, token, collection: "playerDocuments" }),
  listCollection({ projectId, token, collection: "coachDocuments" }),
]);

const playerResult = await checkCollection({ label: "Player documents", docs: playerDocuments, bucket, token });
const coachResult = await checkCollection({ label: "Coach documents", docs: coachDocuments, bucket, token });
const failed = playerResult.failed + coachResult.failed;

console.log(`\nChecked ${playerResult.total + coachResult.total} document record(s). Failures: ${failed}.`);
if (failed) process.exitCode = 1;
