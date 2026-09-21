import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const failures = [];

async function text(path) {
  return readFile(join(root, path), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function extractBlock(source, selector) {
  const start = source.indexOf(selector);
  if (start === -1) return "";
  const open = source.indexOf("{", start);
  if (open === -1) return "";
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  return "";
}

const [
  app,
  styles,
  index,
  worker,
  packageJsonRaw,
] = await Promise.all([
  text("app.js"),
  text("styles.css"),
  text("index.html"),
  text("service-worker.js"),
  text("package.json"),
]);
const packageJson = JSON.parse(packageJsonRaw);

assert(app.includes('const appVersion = "4.0-live-rollout-57";'), "app.js build id must be 4.0-live-rollout-57.");
assert(packageJson.version === "4.0.57", "package.json version must be 4.0.57.");
assert(index.includes("app.js?v=live-57") && index.includes("styles.css?v=live-57"), "index.html must reference live-57 app/css assets.");
assert(worker.includes('const cacheName = "largs-colts-live-65";'), "service worker cache must be live-65.");

assert(!app.includes("horizontalScrollGesture"), "Custom horizontal scroll gesture state must not return.");
assert(!app.includes("horizontalScrollClickBlock"), "Custom horizontal scroll click-blocking must not return.");
assert(!app.includes("horizontalScrollForTarget"), "Custom horizontal scroll target handler must not return.");
assert(!styles.includes("drag-scrolling"), "drag-scrolling CSS must not return.");

assert(!app.includes('class="bottom-nav" aria-label="Mobile navigation" data-x-scroll'), "Bottom nav must not use data-x-scroll.");
assert(!app.includes('class="segmented light section-tabs" data-x-scroll'), "Squad section tabs must not use data-x-scroll.");
assert(!app.includes('class="segmented light section-tabs club-section-tabs" data-x-scroll'), "Club section tabs must not use data-x-scroll.");
assert(app.includes('function mobilePrimaryRouteIds()') && app.includes('return ["home", "schedule", "availability", "attendance"];'), "Mobile primary nav must be fixed to Home/Schedule/Availability/Register.");

[
  "squads",
  "development",
  "squad-builder",
  "awards",
  "results",
  "documents",
  "messages",
  "coach-inbox",
  "coaches",
  "venues",
  "access",
  "privacy",
  "install",
].forEach((route) => {
  assert(app.includes(`"${route}"`) || app.includes(`'${route}'`), `Mobile navigation must retain route ${route}.`);
});

assert(app.includes("mobile-nav-backdrop") && app.includes("mobile-nav-modal"), "More menu must use dedicated mobile modal classes.");
assert(!app.includes("Open the browser console with debugDocs=1"), "User-facing document errors must not tell parents/coaches to open the console.");

const bottomNavMobileBlock = extractBlock(styles, ".bottom-nav {\r\n    position: fixed") || extractBlock(styles, ".bottom-nav {\n    position: fixed");
assert(bottomNavMobileBlock.includes("repeat(auto-fit, minmax(64px, 1fr))"), "Mobile bottom nav must use fixed visible columns instead of overflow columns.");
assert(!bottomNavMobileBlock.includes("overflow-x: auto"), "Mobile bottom nav must not be horizontally scrollable.");
assert(bottomNavMobileBlock.includes("touch-action: manipulation"), "Mobile bottom nav must use tap-focused touch-action.");

const mobileTabsBlock = extractBlock(styles, ".section-tabs {\r\n    grid-auto-flow: row") || extractBlock(styles, ".section-tabs {\n    grid-auto-flow: row");
assert(mobileTabsBlock.includes("overflow: visible"), "Mobile section tabs must wrap visibly instead of scrolling horizontally.");
const mobileStatsBlock = extractBlock(styles, ".stats-table {\r\n    display: grid") || extractBlock(styles, ".stats-table {\n    display: grid");
assert(mobileStatsBlock.includes("overflow: visible"), "Mobile stats tables must not rely on horizontal scrolling.");
assert(styles.includes(".stats-table-header {\r\n    display: none") || styles.includes(".stats-table-header {\n    display: none"), "Mobile stats tables must hide desktop headers when rendered as cards.");

const syncedAppPath = "android/app/src/main/assets/public/app.js";
if (existsSync(join(root, syncedAppPath))) {
  const syncedApp = await text(syncedAppPath);
  assert(syncedApp.includes('const appVersion = "4.0-live-rollout-57";'), "Android bundled app.js must be synced to live-rollout-57.");
}

if (failures.length) {
  console.error("Mobile release regression checks failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Mobile release regression checks passed.");
