import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const webDir = join(root, "www");

const files = [
  "index.html",
  "app.js",
  "styles.css",
  "manifest.json",
  "service-worker.js",
  "firebase-config.js",
  "firebase-sw-config.js",
  ".nojekyll",
];

await rm(webDir, { recursive: true, force: true });
await mkdir(webDir, { recursive: true });
await mkdir(join(webDir, "assets"), { recursive: true });

for (const file of files) {
  await cp(join(root, file), join(webDir, file));
}

await cp(join(root, "assets"), join(webDir, "assets"), { recursive: true });

console.log("Prepared Capacitor web bundle in www/.");
