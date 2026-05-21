const appVersion = "4.0-live-rollout-9";
const crestPath = "assets/LargsColtsCrest.png";
const backendConfig = window.largsFirebaseConfig || {
  enabled: false,
  supportEmail: "fraxur@outlook.com",
  firebaseConfig: {},
  vapidKey: "",
};
const supportEmail = backendConfig.supportEmail || "fraxur@outlook.com";
const firebaseRuntime = {
  ready: false,
  modules: {},
  app: null,
  auth: null,
  db: null,
  messaging: null,
  user: null,
};
const clubId = "largs-colts-2016s";
let liveTeams = [];
let liveUnsubscribers = [];
let eventDataUnsubscribers = [];

const teams = [
  { id: "orange", name: "Orange", colour: "#f97316" },
  { id: "blue", name: "Blue", colour: "#2563eb" },
  { id: "yellow", name: "Yellow", colour: "#eab308" },
];
liveTeams = teams;
const coachRoles = ["coach", "admin"];

const coaches = [
  { id: "carl", name: "Carl", teamId: "all", role: "Coach", phone: "07999696043", email: "" },
  { id: "faroque", name: "Faroque", teamId: "all", role: "Coach", phone: "07791199936", email: "" },
  { id: "ed", name: "Edward Dowds", teamId: "all", role: "Coach", phone: "07881597600", email: "" },
  { id: "martin", name: "Martin", teamId: "all", role: "Coach", phone: "07904718672", email: "" },
  { id: "gordy", name: "Gordy", teamId: "all", role: "Coach", phone: "07984645328", email: "" },
];

const venues = [
  {
    id: "bowencraig",
    name: "Bowencraig (Home pitch)",
    address: "55.77946, -4.856398",
    parkingAddress: "Bowencraig East Car Park, Irvine Rd, Fairlie, Largs KA29 0BG",
    surface: "Grass pitch",
    notes: "Main home venue for Largs Colts 2016s.",
    pitchImage: "",
    parkingImage: "",
  },
  {
    id: "inverclyde-3g",
    name: "Inverclyde Sports Centre 3G",
    address: "Burnside Road, Largs KA30 8RW",
    parkingAddress: "Inverclyde Sports Centre, Burnside Road, Largs KA30 8RW",
    surface: "3G pitch",
    notes: "Used for selected training or fixtures.",
    pitchImage: "",
    parkingImage: "",
  },
  {
    id: "barrfields",
    name: "Barrfields Park",
    address: "Barrfields Park, Greenock Road, Largs",
    parkingAddress: "Barrfields Park, Greenock Road, Largs",
    surface: "Grass pitch",
    notes: "Occasional venue.",
    pitchImage: "",
    parkingImage: "",
  },
  {
    id: "away-custom",
    name: "Away destination",
    address: "Address to be confirmed",
    parkingAddress: "",
    surface: "To be confirmed",
    notes: "Use this for typed away venues.",
    pitchImage: "",
    parkingImage: "",
  },
];

const kitOptions = ["Home kit", "Away kit"];
const leavers = ["Caleb", "Robyn", "Alexander", "Harry Smith"];
const placeholderParent = "Parent Placeholder";
const placeholderPhone = "07000 000000";

const defaultState = {
  loading: true,
  error: "",
  session: {
    loggedIn: false,
    role: "",
    userId: "",
    email: "",
    phone: "",
    parentName: "",
    coachName: "",
    selectedPlayerId: "p1",
    canSwitchPortal: false,
  },
  route: "home",
  authRole: "parent",
  scheduleFilter: "all",
  schedulePeriod: "upcoming",
  selectedEventId: "e1",
  coachGuide: {
    active: false,
    step: 0,
    completed: false,
  },
  teams,
  players: [],
  parentLinks: [],
  accessRequests: [],
  dataRequests: [],
  events: [],
  availability: {},
  attendance: {},
  notifications: [],
  messages: [],
  users: [],
  coachContacts: [],
  venues: [],
  messageReadAt: "",
};

function defaultAvailabilityEntry(entry = {}) {
  return {
    status: "unknown",
    note: "",
    snacks: false,
    liftOffer: false,
    liftSeats: 0,
    liftFrom: "",
    ...entry,
  };
}

const coachGuideSteps = [
  {
    route: "home",
    target: "dashboard-next",
    title: "Coach walkthrough start",
    body: "The dashboard starts with the next event and gives coaches quick access to fixtures, availability, attendance and parent verification.",
  },
  {
    route: "home",
    target: "coach-tools",
    title: "Quick coach actions",
    body: "These four buttons are the main coach shortcuts: add a fixture or training session, send a message, verify parents, and take attendance.",
  },
  {
    route: "schedule",
    target: "schedule-toolbar",
    title: "Fixtures and training",
    body: "Use the team filters to show All, Orange, Blue or Yellow. The add button lets a coach add either a fixture or training session.",
  },
  {
    route: "schedule",
    target: "event-list",
    title: "Weekend matches",
    body: "The coach can see the Blue home match and the Yellow away match, including kick-off time, report time, venue, map buttons and the Remove button for test fixtures.",
  },
  {
    route: "schedule",
    target: "away-support",
    title: "Away destinations",
    body: "When adding a fixture, choose Away destination if the pitch is not Bowencraig, Inverclyde Sports Centre 3G or Barrfields Park. The app then asks for the venue name and address so maps still work.",
  },
  {
    route: "availability",
    target: "availability-summary",
    eventId: "e1",
    title: "Availability responses",
    body: "Availability shows who has replied for the selected fixture or training session. Coaches can switch events from the dropdown and quickly see available, unavailable and no reply totals.",
  },
  {
    route: "attendance",
    target: "attendance-grid",
    eventId: "t1",
    title: "Attendance",
    body: "This is where a coach marks players present, absent or collected. Present and collected also log the parent push/in-app notification that would be sent in the live system.",
  },
  {
    route: "squads",
    target: "team-board",
    title: "Teams and squads",
    body: "The team board lists Orange, Blue and Yellow. Coaches can add a player, edit parent contact placeholders, or move a player between team colours.",
  },
  {
    route: "messages",
    target: "messages-panel",
    title: "Coach messages",
    body: "Messages can go to all parents or a selected colour group. In the real rollout this area links naturally to push notifications.",
  },
  {
    route: "coaches",
    target: "coach-contacts",
    title: "Coach contacts",
    body: "This page shows Carl, Faroque, Ed, Martin and Gordy with tap-to-call and tap-to-text links so parents know who to contact.",
  },
  {
    route: "venues",
    target: "venue-list",
    title: "Venues and parking",
    body: "This page keeps Bowencraig, Inverclyde and Barrfields in one place with pitch pins, parking pins and photo spaces for matchday directions.",
  },
  {
    route: "access",
    target: "access-queue",
    title: "Parent verification",
    body: "This is the safeguarding gate. A parent requests access to a child, a coach checks the request and approves the child link.",
  },
  {
    route: "install",
    target: "install-panel",
    title: "Phone testing",
    body: "This page gives the test link and package download. On iPhone use Safari and Add to Home Screen; on Android use Chrome and Install app.",
  },
];

let state = loadState();

function loadState() {
  return normalizeState({
    ...structuredClone(defaultState),
    players: [],
    events: [],
    availability: {},
    attendance: {},
    parentLinks: [],
    accessRequests: [],
    dataRequests: [],
    notifications: [],
    messages: [],
    users: [],
    session: { ...defaultState.session },
  });
}

function normalizeState(saved) {
  const merged = {
    ...structuredClone(defaultState),
    ...saved,
    session: { ...defaultState.session, ...(saved.session || {}) },
  };

  merged.players = (merged.players || []).filter((player) => !leavers.includes(player.name));
  merged.teams = merged.teams?.length ? merged.teams : teams;
  liveTeams = merged.teams;
  merged.events = merged.events || [];
  merged.messages = merged.messages || [];
  merged.notifications = merged.notifications || [];
  merged.dataRequests = merged.dataRequests || [];
  merged.users = merged.users || [];
  merged.coachContacts = merged.coachContacts || [];
  merged.venues = merged.venues || [];
  merged.messageReadAt = merged.messageReadAt || "";
  merged.selectedEventId = merged.selectedEventId || merged.events[0]?.id || "";
  if (!merged.events.some((event) => event.id === merged.selectedEventId)) {
    merged.selectedEventId = merged.events[0]?.id || "";
  }
  merged.scheduleFilter = merged.scheduleFilter || "all";
  merged.schedulePeriod = merged.schedulePeriod || "upcoming";
  merged.coachGuide = {
    ...defaultState.coachGuide,
    ...(saved.coachGuide || {}),
  };
  if (merged.coachGuide.step >= coachGuideSteps.length) {
    merged.coachGuide.step = coachGuideSteps.length - 1;
  }

  merged.events.forEach((event) => {
    event.venueId = event.venueId || venueIdFromName(event.venue);
    event.notes = event.notes || "";
    event.meetTime = event.meetTime || "";
    event.finishTime = event.finishTime || suggestFinishTime(event.datetime, event.type);
    event.kit = event.kit || (event.type === "Fixture" ? "Home kit" : "");
    event.homeScore = event.homeScore ?? "";
    event.awayScore = event.awayScore ?? "";
    event.resultNotes = event.resultNotes || "";
    merged.availability[event.id] = merged.availability[event.id] || {};
    getPlayersForEvent(event, merged.players).forEach((player) => {
      merged.availability[event.id][player.id] = defaultAvailabilityEntry(merged.availability[event.id][player.id]);
    });
    merged.attendance[event.id] = merged.attendance[event.id] || {};
  });

  return merged;
}

function saveState() {}

function $(selector, root = document) {
  return root.querySelector(selector);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function currentPlayer() {
  return activePlayers().find((player) => player.id === state.session.selectedPlayerId) || approvedPlayers()[0];
}

function activePlayers() {
  return state.players.filter((player) => player.status === "active");
}

function approvedLinks() {
  return state.parentLinks.filter((link) => {
    if (link.status !== "approved") return false;
    if (hasCoachAccess()) return true;
    return link.parentUid === state.session.userId;
  });
}

function pendingRequests() {
  return state.accessRequests.filter((request) => {
    if (request.status !== "pending") return false;
    if (hasCoachAccess()) return true;
    return request.parentUid === state.session.userId;
  });
}

function approvedPlayers() {
  const ids = new Set(approvedLinks().map((link) => link.playerId));
  return activePlayers().filter((player) => ids.has(player.id));
}

function sameName(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

function teamById(teamId) {
  if (teamId === "all") return { id: "all", name: "All teams", colour: "#850008" };
  return (liveTeams.length ? liveTeams : teams).find((team) => team.id === teamId) || teams[0];
}

function teamName(teamId) {
  return teamById(teamId).name;
}

function appVenues() {
  const merged = new Map(venues.map((venue) => [venue.id, { ...venue }]));
  (state.venues || []).forEach((venue) => {
    if (!venue?.id) return;
    merged.set(venue.id, { ...(merged.get(venue.id) || {}), ...venue });
  });
  return Array.from(merged.values());
}

function appCoachContacts() {
  const merged = new Map(coaches.map((coach) => [coach.id, { ...coach }]));
  (state.coachContacts || []).forEach((coach) => {
    if (!coach?.id) return;
    merged.set(coach.id, { ...(merged.get(coach.id) || {}), ...coach });
  });
  return Array.from(merged.values());
}

function venueById(venueId) {
  return appVenues().find((venue) => venue.id === venueId) || appVenues()[0] || venues[0];
}

function venueIdFromName(name = "") {
  const normalized = name.toLowerCase();
  return venues.find((venue) => venue.name.toLowerCase() === normalized)?.id || "away-custom";
}

function eventVenue(event) {
  const knownVenue = appVenues().find((venue) => venue.id === event.venueId);
  if (knownVenue && knownVenue.id !== "away-custom") return knownVenue;

  if (event.venueId === "away-custom" || event.address) {
    return {
      id: event.venueId || "away-custom",
      name: event.venue || "Away destination",
      address: event.address || "Address to be confirmed",
      parkingAddress: event.parkingAddress || "",
    };
  }
  return venueById(event.venueId || venueIdFromName(event.venue));
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function timeSlots() {
  const slots = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }
  return slots;
}

function timeOptions(selected = "", includeBlank = false) {
  return `${includeBlank ? '<option value="">Not set</option>' : ""}${timeSlots()
    .map((slot) => `<option value="${slot}" ${slot === selected ? "selected" : ""}>${slot}</option>`)
    .join("")}`;
}

function dateValue(datetime = "") {
  return datetime ? String(datetime).slice(0, 10) : "";
}

function timeValue(datetime = "") {
  return datetime ? String(datetime).slice(11, 16) : "";
}

function combineDateTime(date, time) {
  return `${date}T${time}`;
}

function addMinutesToTime(datetime, minutes) {
  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() + minutes);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function suggestFinishTime(datetime, type) {
  return addMinutesToTime(datetime, type === "Training" ? 90 : 75);
}

function mapsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function mapsAppleUrl(address) {
  return `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
}

function venueParkingLine(venue) {
  return venue.parkingAddress ? `<p>Parking: ${escapeHtml(venue.parkingAddress)}</p>` : "";
}

function venueMapActions(venue) {
  const parkingActions = venue.parkingAddress
    ? `
      <a class="secondary-link" href="${mapsUrl(venue.parkingAddress)}" target="_blank" rel="noreferrer">Parking Google Maps</a>
      <a class="secondary-link" href="${mapsAppleUrl(venue.parkingAddress)}" target="_blank" rel="noreferrer">Parking Apple Maps</a>
      <button class="secondary-button" type="button" data-action="copy-link" data-copy="${escapeHtml(venue.parkingAddress)}">Copy parking</button>
    `
    : "";

  return `
    <a class="secondary-link" href="${mapsUrl(venue.address)}" target="_blank" rel="noreferrer">Pitch Google Maps</a>
    <a class="secondary-link" href="${mapsAppleUrl(venue.address)}" target="_blank" rel="noreferrer">Pitch Apple Maps</a>
    <button class="secondary-button" type="button" data-action="copy-link" data-copy="${escapeHtml(venue.address)}">Copy pitch</button>
    ${parkingActions}
  `;
}

function getPlayersForEvent(event, players = activePlayers()) {
  if (event.teamId === "all") return players;
  return players.filter((player) => player.teamId === event.teamId);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function displayDate(value) {
  if (!value) return "Just now";
  if (typeof value === "string") return value;
  if (typeof value.toDate === "function") return formatDate(value.toDate().toISOString());
  return String(value);
}

function dateTile(value) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date),
  };
}

function eventEndDate(event) {
  const datePart = dateValue(event.datetime);
  const endTime = event.finishTime || timeValue(event.datetime);
  const value = datePart && endTime ? `${datePart}T${endTime}` : event.datetime;
  const end = new Date(value);
  return Number.isNaN(end.getTime()) ? new Date(event.datetime) : end;
}

function isPastEvent(event) {
  return eventEndDate(event) < new Date();
}

function resultSummary(event) {
  if (event.type !== "Fixture") return "";
  const hasHome = event.homeScore !== "" && event.homeScore != null;
  const hasAway = event.awayScore !== "" && event.awayScore != null;
  if (hasHome && hasAway) return `Result ${event.homeScore}-${event.awayScore}`;
  return isPastEvent(event) ? "Result pending" : "";
}

function statusText(status) {
  return {
    available: "Available",
    unavailable: "Unavailable",
    unknown: "No reply",
    present: "Present",
    absent: "Absent",
    collected: "Collected",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  }[status] || status;
}

function statusClass(status) {
  if (["available", "present", "approved", "collected"].includes(status)) return "good";
  if (["unavailable", "absent", "rejected"].includes(status)) return "bad";
  return "warn";
}

function availabilityCounts(eventId) {
  const event = state.events.find((item) => item.id === eventId);
  const players = event ? getPlayersForEvent(event) : activePlayers();
  return players.reduce(
    (acc, player) => {
      const entry = defaultAvailabilityEntry(state.availability[eventId]?.[player.id]);
      const status = entry?.status || "unknown";
      acc[status] += 1;
      if (entry.snacks) acc.snacks += 1;
      if (entry.liftOffer) {
        acc.lifts += 1;
        acc.liftSeats += Number(entry.liftSeats || 0);
      }
      return acc;
    },
    { available: 0, unavailable: 0, unknown: 0, snacks: 0, lifts: 0, liftSeats: 0 },
  );
}

function messageTimestamp(message) {
  const value = message.createdAt || message.sentAt || "";
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function alertTimestamp(alert) {
  return messageTimestamp({ createdAt: alert.createdAt || alert.sentAt || alert.updatedAt });
}

function visibleMessagesForUser() {
  const child = currentPlayer();
  return state.messages.filter((message) => hasCoachAccess() || message.teamId === "all" || message.teamId === child?.teamId);
}

function visibleParentNotificationsForUser() {
  const child = currentPlayer();
  if (state.session.role !== "parent" || !child) return [];
  return (state.notifications || []).filter((alert) => alert.data?.playerId === child.id || alert.playerId === child.id);
}

function unreadMessageCount() {
  const readAt = Date.parse(state.messageReadAt || "") || 0;
  const items = [
    ...visibleMessagesForUser().map((message) => ({ timestamp: messageTimestamp(message) })),
    ...visibleParentNotificationsForUser().map((alert) => ({ timestamp: alertTimestamp(alert) })),
  ];
  return items.filter((item) => item.timestamp > readAt).length;
}

async function markMessagesRead() {
  state.messageReadAt = new Date().toISOString();
  saveState();
  if (!isFirebaseSignedIn() || !state.session.userId) return;
  try {
    const runtime = await ensureFirebase();
    await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "users", state.session.userId), {
      messageReadAt: state.messageReadAt,
      updatedAt: runtime.modules.serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error(error);
  }
}

function attendancePercent(playerId) {
  let total = 0;
  let present = 0;
  state.events.forEach((event) => {
    const value = state.attendance[event.id]?.[playerId];
    if (value && value !== "unknown") {
      total += 1;
      if (value === "present" || value === "collected") present += 1;
    }
  });
  return total ? Math.round((present / total) * 100) : 0;
}

function averageAttendance() {
  const players = activePlayers();
  if (!players.length) return 0;
  return Math.round(players.reduce((sum, player) => sum + attendancePercent(player.id), 0) / players.length);
}

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2600);
}

function setBusy(message = "Loading...") {
  state.loading = true;
  state.error = "";
  render();
  if (message) toast(message);
}

function showError(message) {
  state.loading = false;
  state.error = message;
  render();
  toast(message);
}

function firebaseConfigDebugSummary() {
  const config = backendConfig.firebaseConfig || {};
  const apiKey = String(config.apiKey || "");
  const keyEnding = apiKey ? `...${apiKey.slice(-14)}` : "missing";
  return `Loaded project: ${config.projectId || "missing"}. Loaded API key ending: ${keyEnding}.`;
}

function authErrorMessage(error) {
  const code = String(error?.code || "");
  if (code.includes("api-key-not-valid")) {
    return `Firebase rejected the web API key before checking the email or password. ${firebaseConfigDebugSummary()}`;
  }

  const friendlyMessage = {
    "auth/invalid-credential": "Those Firebase login details were not recognised.",
    "auth/user-not-found": "No account was found for that email address.",
    "auth/wrong-password": "That password is not correct.",
    "auth/invalid-email": "That email address does not look right.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase Authentication.",
    "auth/unauthorized-domain": "This website address is not authorised in Firebase Authentication.",
    "auth/network-request-failed": "Firebase could not be reached from this device. Check the internet connection and try again.",
    "auth/too-many-requests": "Firebase has temporarily blocked sign-in attempts for this account. Please wait a few minutes and try again.",
    "auth/email-already-in-use": "That email is already registered. Please sign in with the existing password.",
    "auth/weak-password": "Please choose a password with at least six characters.",
    "auth/requires-recent-login": "Please sign out and back in before changing the password.",
    "permission-denied": "Firebase blocked access to the app data. Check the coach user document is in clubs / largs-colts-2016s / users and the document ID is the full Authentication UID.",
  }[error?.code];

  return friendlyMessage || `Firebase could not complete that action. Error code: ${error?.code || "unknown"}.`;
}

function requireCoach() {
  if (hasCoachAccess()) return true;
  toast("Coach access required");
  return false;
}

function hasCoachAccess(role = state.session.role) {
  return coachRoles.includes(String(role || "").toLowerCase());
}

function isCoachGuide() {
  return state.session.loggedIn && hasCoachAccess() && state.coachGuide?.active;
}

function currentCoachGuideStep() {
  return coachGuideSteps[state.coachGuide?.step || 0] || coachGuideSteps[0];
}

function applyCoachGuideStep() {
  if (!isCoachGuide()) return;
  const step = currentCoachGuideStep();
  state.route = step.route;
  if (step.eventId) state.selectedEventId = step.eventId;
  if (step.route === "schedule") state.scheduleFilter = "all";
}

function updateCoachGuide(direction) {
  if (!isCoachGuide()) return;
  const nextStep = (state.coachGuide.step || 0) + direction;
  if (nextStep >= coachGuideSteps.length) {
    state.coachGuide.active = false;
    state.coachGuide.completed = true;
    saveState();
    render();
    toast("Coach walkthrough complete");
    return;
  }
  state.coachGuide.step = Math.max(0, nextStep);
  applyCoachGuideStep();
  saveState();
  render();
}

function stopCoachGuide() {
  state.coachGuide.active = false;
  state.coachGuide.completed = true;
  saveState();
  render();
}

function restartCoachGuide() {
  state.coachGuide = { active: true, step: 0, completed: false };
  applyCoachGuideStep();
  saveState();
  render();
}

function coachGuideButton() {
  if (!isCoachGuide()) return "";
  return `<button class="secondary-button guide-start-button" type="button" data-action="coach-guide-restart">${state.coachGuide.active ? "Restart walkthrough" : "Start walkthrough"}</button>`;
}

function coachGuideView() {
  if (!isCoachGuide()) return "";
  const step = currentCoachGuideStep();
  const stepNumber = (state.coachGuide.step || 0) + 1;
  const lastStep = stepNumber === coachGuideSteps.length;
  return `
    <section class="coach-guide-card" role="dialog" aria-live="polite" aria-label="Coach walkthrough">
      <div class="coach-guide-progress">
        <span>Coach walkthrough</span>
        <strong>${stepNumber}/${coachGuideSteps.length}</strong>
      </div>
      <h2>${escapeHtml(step.title)}</h2>
      <p>${escapeHtml(step.body)}</p>
      <div class="coach-guide-actions">
        <button class="secondary-button" type="button" data-action="coach-guide-back" ${stepNumber === 1 ? "disabled" : ""}>Back</button>
        <button class="primary-button" type="button" data-action="coach-guide-next">${lastStep ? "Finish" : "Next"}</button>
        <button class="tiny-button" type="button" data-action="coach-guide-stop">Skip</button>
      </div>
    </section>
  `;
}

function highlightCoachGuideTarget() {
  document.querySelectorAll(".coach-guide-highlight").forEach((node) => node.classList.remove("coach-guide-highlight"));
  if (!isCoachGuide()) return;
  const target = currentCoachGuideStep().target;
  const node = target ? document.querySelector(`[data-tour="${target}"]`) : null;
  if (!node) return;
  node.classList.add("coach-guide-highlight");
  node.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

function render() {
  applyCoachGuideStep();
  const app = $("#app");
  if (state.loading) {
    app.innerHTML = loadingView();
    return;
  }
  if (!state.session.loggedIn) {
    app.innerHTML = authView();
  } else {
    app.innerHTML = shellView();
  }
  bindFormDefaults();
  highlightCoachGuideTarget();
}

function loadingView() {
  return `
    <main class="auth-page">
      <section class="auth-card loading-card">
        <div class="auth-brand">
          <img src="${crestPath}" alt="Largs Colts F.C. crest">
          <div>
            <p class="eyebrow">Loading secure app</p>
            <h1>Largs Colts 2016s</h1>
            <p>Checking Firebase sign-in and loading the latest club data.</p>
          </div>
        </div>
        <div class="loading-bar" aria-hidden="true"><span></span></div>
      </section>
    </main>
  `;
}

function errorBanner() {
  return state.error ? `<section class="pending-banner error-banner"><strong>Action needed</strong><span>${escapeHtml(state.error)}</span></section>` : "";
}

function authView() {
  return `
    <main class="auth-page">
      <section class="auth-card">
        <div class="auth-brand">
          <img src="${crestPath}" alt="Largs Colts F.C. crest">
          <div>
            <p class="eyebrow">Private team app</p>
            <h1>Largs Colts 2016s</h1>
            <p>Fixtures, availability, attendance and verified parent access.</p>
          </div>
        </div>

        <div class="auth-tabs" role="group" aria-label="Choose account type">
          <button class="${state.authRole === "parent" ? "active" : ""}" type="button" data-action="set-auth-role" data-role="parent">Parent</button>
          <button class="${state.authRole === "coach" ? "active" : ""}" type="button" data-action="set-auth-role" data-role="coach">Coach</button>
        </div>

        ${state.authRole === "parent" ? parentLoginView() : coachLoginView()}
        ${errorBanner()}
      </section>
    </main>
  `;
}

function parentLoginView() {
  return `
    <form class="auth-form" data-form="parent-login">
      <label>
        <span>Email</span>
        <input name="email" type="email" autocomplete="email" required placeholder="parent@example.com">
      </label>
      <label>
        <span>Password</span>
        <input name="passcode" type="password" autocomplete="current-password" minlength="6" required placeholder="Your private password">
      </label>
      <label>
        <span>Parent name</span>
        <input name="parentName" autocomplete="name" required placeholder="Your name">
      </label>
      <label>
        <span>Child name for access request</span>
        <input name="childName" autocomplete="off" placeholder="Only needed until approved">
      </label>
      <label>
        <span>Relationship</span>
        <select name="relation">
          <option>Parent</option>
          <option>Guardian</option>
          <option>Carer</option>
        </select>
      </label>
      <label class="check-row">
        <input name="consent" type="checkbox" required>
        <span>
          I confirm that I am a parent, guardian, or otherwise authorised to request access for this child.
          I understand that Largs Colts 2016 will store and use the child's profile information, attendance records, availability status, and app notification data for the legitimate purpose of managing football training, matches, team communication, player welfare, and general team administration.
          I understand that this information will only be accessible to authorised coaches and team administrators and will not be shared outside the club except where required for football administration or safeguarding purposes.
          For support or data queries, contact: ${escapeHtml(supportEmail)}.
        </span>
      </label>
      <div class="auth-actions">
        <button class="primary-button" type="submit">Sign in or request access</button>
        <button class="secondary-button" type="button" data-action="reset-password">Forgot password</button>
      </div>
      <details class="privacy-preview">
        <summary>Privacy notice</summary>
        ${privacyNoticeContent()}
      </details>
    </form>
  `;
}

function coachLoginView() {
  return `
    <form class="auth-form" data-form="coach-login">
      <label>
        <span>Email</span>
        <input name="email" type="email" autocomplete="email" required placeholder="coach@example.com">
      </label>
      <label>
        <span>Password</span>
        <input name="passcode" type="password" autocomplete="current-password" required placeholder="Coach account password">
      </label>
      <div class="auth-actions">
        <button class="primary-button" type="submit">Sign in</button>
        <button class="secondary-button" type="button" data-action="reset-password">Forgot password</button>
      </div>
      <p class="live-build-note">Build ${appVersion} uses live Firebase Auth, Firestore and push notifications.</p>
    </form>
  `;
}

function shellView() {
  const pendingOnly = state.session.role === "parent" && !approvedPlayers().length;
  const route = pendingOnly && !["access", "install"].includes(state.route) ? "access" : state.route;
  const routes = navRoutes(pendingOnly);
  const child = currentPlayer();
  const unread = unreadMessageCount();

  return `
    <div class="app-shell">
      <aside class="side-nav">
        <a class="brand" href="#home" data-route="home">
          <span><img src="${crestPath}" alt=""></span>
          <strong>Largs Colts</strong>
          <small>2016s Team App</small>
        </a>
        <nav aria-label="Primary">
          ${routes.map((item) => navItem(item, route)).join("")}
        </nav>
        <button class="sign-out" type="button" data-action="sign-out">Sign out</button>
      </aside>

      <main class="app-main">
        <header class="topbar">
          <div>
            <p class="eyebrow">${hasCoachAccess() ? "Coach portal" : "Parent portal"}</p>
            <h1>${pageTitle(route)}</h1>
          </div>
          <div class="topbar-actions">
            ${state.session.role === "parent" && approvedPlayers().length ? childSelector(child) : ""}
            ${coachGuideButton()}
            <button class="notification-button ${unread ? "has-unread" : ""}" type="button" data-route-target="messages" aria-label="Messages">
              <span class="message-icon">M</span>
              ${unread ? `<span class="message-count">${unread}</span>` : ""}
            </button>
            ${accountControls()}
          </div>
        </header>

        ${errorBanner()}
        ${pendingOnly ? pendingBanner() : ""}
        <section class="page-frame">
          ${pageView(route)}
        </section>
      </main>

      <nav class="bottom-nav" aria-label="Mobile navigation">
        ${routes.map((item) => navItem(item, route, true)).join("")}
      </nav>
    </div>
    ${modalView()}
    ${coachGuideView()}
  `;
}

function accountControls() {
  const isCoach = hasCoachAccess();
  const canSwitch = Boolean(state.session.canSwitchPortal);
  const displayName = isCoach
    ? state.session.coachName || state.session.email || "Coach"
    : state.session.parentName || state.session.email || "Parent";
  return `
    <div class="account-controls" aria-label="Account controls">
      <span class="account-chip">
        <strong>${escapeHtml(displayName)}</strong>
        <small>${isCoach ? "Coach" : "Parent"}</small>
      </span>
      ${canSwitch ? `<button class="secondary-button account-button" type="button" data-action="switch-account" data-role="${isCoach ? "parent" : "coach"}">
        ${isCoach ? "Parent login" : "Coach login"}
      </button>` : ""}
      <button class="secondary-button account-button" type="button" data-action="sign-out">Log out</button>
    </div>
  `;
}

function navRoutes(pendingOnly = false) {
  const coachRoutes = [
    { id: "home", label: "Home" },
    { id: "schedule", label: "Schedule" },
    { id: "availability", label: "Availability" },
    { id: "attendance", label: "Attendance" },
    { id: "squads", label: "Teams" },
    { id: "messages", label: "Messages" },
    { id: "coaches", label: "Coaches" },
    { id: "venues", label: "Venues" },
    { id: "access", label: "Access" },
    { id: "privacy", label: "Privacy" },
    { id: "install", label: "Install" },
  ];
  const parentRoutes = [
    ...coachRoutes.filter((item) => item.id !== "squads"),
    { id: "guide", label: "Guide" },
  ];
  const base = hasCoachAccess() ? coachRoutes : parentRoutes;
  return pendingOnly ? base.filter((item) => ["access", "privacy", "install", "guide"].includes(item.id)) : base;
}

function navItem(item, route, compact = false) {
  return `
    <button class="nav-link ${route === item.id ? "active" : ""}" type="button" data-route-target="${item.id}" data-tour="nav-${item.id}">
      <span class="nav-mark">${item.label.slice(0, 1)}</span>
      <span>${compact ? item.label.replace("Availability", "Avail.") : item.label}</span>
    </button>
  `;
}

function pageTitle(route) {
  return {
    home: "Dashboard",
    schedule: "Fixtures",
    availability: "Availability",
    attendance: "Attendance",
    squads: "Teams",
    messages: "Messages",
    coaches: "Coaches",
    venues: "Venues",
    access: "Access",
    privacy: "Privacy",
    install: "Mobile Test",
    guide: "Parent Guide",
  }[route] || "Dashboard";
}

function childSelector(child) {
  const players = approvedPlayers();
  return `
    <label class="child-switcher">
      <span>Child</span>
      <select data-action="select-child">
        ${players.map((player) => `<option value="${player.id}" ${player.id === child?.id ? "selected" : ""}>${escapeHtml(player.name)}</option>`).join("")}
      </select>
    </label>
  `;
}

function pendingBanner() {
  return `
    <section class="pending-banner">
      <strong>Access pending</strong>
      <span>A coach needs to approve your child link before private player details are shown.</span>
    </section>
  `;
}

function pageView(route) {
  const pendingOnly = state.session.role === "parent" && !approvedPlayers().length;
  if (pendingOnly && !["privacy", "install", "guide"].includes(route)) return accessView();
  if (!hasCoachAccess() && route === "squads") return homeView();
  return {
    home: homeView,
    schedule: scheduleView,
    availability: availabilityView,
    attendance: attendanceView,
    squads: squadsView,
    messages: messagesView,
    coaches: coachesView,
    venues: venuesView,
    access: accessView,
    privacy: privacyView,
    install: installView,
    guide: guideView,
  }[route]?.() || homeView();
}

function homeView() {
  const next = state.events
    .filter((event) => new Date(event.datetime) >= startOfToday())
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))[0] || state.events[0];
  const child = currentPlayer();
  if (!next) {
    return `
      <section class="hero-panel" data-tour="dashboard-next">
        <div class="hero-text">
          <img src="${crestPath}" alt="">
          <div>
            <p class="eyebrow">Live app ready</p>
            <h2>No fixtures or training loaded yet</h2>
            <p>Seed Firestore or ask a coach to add the first event.</p>
          </div>
        </div>
        ${hasCoachAccess() ? '<div class="hero-actions"><button class="primary-button" type="button" data-modal="event">Add fixture/training</button></div>' : ""}
      </section>
    `;
  }
  const counts = availabilityCounts(next.id);
  const playerCount = hasCoachAccess() ? activePlayers().length : approvedPlayers().length;
  const pendingCount = hasCoachAccess() ? state.accessRequests.filter((request) => request.status === "pending").length : pendingRequests().length;

  return `
    <section class="hero-panel" data-tour="dashboard-next">
      <div class="hero-text">
        <img src="${crestPath}" alt="">
        <div>
          <p class="eyebrow">Next up</p>
          <h2>${escapeHtml(next.title)}</h2>
          <p>${formatDate(next.datetime)} at ${escapeHtml(next.venue)}</p>
        </div>
      </div>
      <div class="hero-actions">
        <button class="primary-button" type="button" data-route-target="availability">Availability</button>
        <button class="secondary-button on-dark" type="button" data-route-target="schedule">Schedule</button>
      </div>
    </section>

    <section class="metric-grid">
      <article><strong>${playerCount}</strong><span>${hasCoachAccess() ? "Active players" : "Linked children"}</span></article>
      <article><strong>${counts.available}</strong><span>Available next event</span></article>
      <article><strong>${averageAttendance()}%</strong><span>Attendance average</span></article>
      <button class="metric-card" type="button" data-route-target="access"><strong>${pendingCount}</strong><span>Pending requests</span></button>
    </section>

    <section class="content-grid two-col">
        ${!hasCoachAccess() && child ? linkedChildCard(child) : coachOverviewCard()}
      ${messageCard()}
    </section>
  `;
}

function linkedChildCard(child) {
  return `
    <article class="panel" data-tour="coach-tools">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Linked child</p>
          <h3>${escapeHtml(child.name)}</h3>
        </div>
        <span class="team-pill ${child.teamId}">${teamName(child.teamId)}</span>
      </div>
      <dl class="info-list">
        <div><dt>Role</dt><dd>${escapeHtml(child.role)}</dd></div>
        <div><dt>Attendance</dt><dd>${attendancePercent(child.id)}%</dd></div>
        <div><dt>Access</dt><dd>Verified</dd></div>
      </dl>
    </article>
  `;
}

function coachOverviewCard() {
  return `
    <article class="panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Coach tools</p>
          <h3>Matchday control</h3>
        </div>
      </div>
      <div class="quick-grid">
        <button type="button" data-modal="event">Add fixture</button>
        <button type="button" data-modal="message">Send message</button>
        <button type="button" data-route-target="access">Pending requests</button>
        <button type="button" data-route-target="attendance">Take attendance</button>
        <button type="button" data-route-target="venues">Venues</button>
      </div>
    </article>
  `;
}

function messageCard() {
  const latest = visibleMessagesForUser()[0];
  return `
    <article class="panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Latest update</p>
          <h3>${escapeHtml(latest?.title || "No messages")}</h3>
        </div>
        ${hasCoachAccess() ? '<button class="icon-button" type="button" data-modal="message">+</button>' : ""}
      </div>
      <p class="muted">${escapeHtml(latest?.body || "")}</p>
    </article>
  `;
}

function scheduleView() {
  const childTeamIds = new Set(approvedPlayers().map((player) => player.teamId));
  const period = state.schedulePeriod || "upcoming";
  const allVisibleEvents = state.events
    .filter((event) => hasCoachAccess() || event.teamId === "all" || childTeamIds.has(event.teamId))
    .filter((event) => state.scheduleFilter === "all" || event.teamId === state.scheduleFilter || event.teamId === "all");
  const upcomingCount = allVisibleEvents.filter((event) => !isPastEvent(event)).length;
  const pastCount = allVisibleEvents.filter(isPastEvent).length;
  const visibleEvents = allVisibleEvents
    .filter((event) => period === "past" ? isPastEvent(event) : !isPastEvent(event))
    .sort((a, b) => period === "past"
      ? eventEndDate(b) - eventEndDate(a)
      : eventEndDate(a) - eventEndDate(b));

  return `
    <section class="toolbar" data-tour="schedule-toolbar">
      <div class="schedule-controls">
        <div class="segmented light schedule-period">
          <button type="button" class="${period === "upcoming" ? "active" : ""}" data-action="set-schedule-period" data-period="upcoming">Upcoming (${upcomingCount})</button>
          <button type="button" class="${period === "past" ? "active" : ""}" data-action="set-schedule-period" data-period="past">Past (${pastCount})</button>
        </div>
      ${hasCoachAccess() ? `<div class="segmented light">
        ${["all", ...teams.map((team) => team.id)].map((id) => `
          <button type="button" class="${state.scheduleFilter === id ? "active" : ""}" data-action="set-schedule-filter" data-team-id="${id}">
            ${id === "all" ? "All" : teamName(id)}
          </button>
        `).join("")}
      </div>` : ""}
      </div>
      ${hasCoachAccess() ? '<button class="primary-button" type="button" data-modal="event">Add fixture/training</button>' : ""}
    </section>
    ${isCoachGuide() ? '<aside class="coach-guide-hint" data-tour="away-support">Away destination adds venue name and address fields, so map buttons still work for places like Bellfield Estate.</aside>' : ""}
    <div class="event-list" data-tour="event-list">
      ${visibleEvents.length ? visibleEvents.map(eventCard).join("") : `<article class="panel"><h3>No ${period === "past" ? "past" : "upcoming"} events to show</h3><p class="muted">${period === "past" ? "Completed fixtures and older training will appear here automatically." : "Once new fixtures or training are added they will appear here."}</p></article>`}
    </div>
  `;
}

function eventCard(event) {
  const tile = dateTile(event.datetime);
  const counts = availabilityCounts(event.id);
  const venue = eventVenue(event);
  const past = isPastEvent(event);
  const result = resultSummary(event);
  const openLabel = hasCoachAccess() ? "Responses" : "Respond";
  const coachActions = hasCoachAccess()
    ? `
      <button class="secondary-button" type="button" data-modal="edit-event" data-event-id="${event.id}">Edit</button>
      <button class="secondary-button danger-button" type="button" data-action="delete-event" data-event-id="${event.id}">Remove</button>
    `
    : "";
  return `
    <article class="event-card">
      <div class="date-tile"><strong>${tile.day}</strong><span>${tile.month}</span></div>
      <div class="event-main">
        <div class="panel-title">
          <div>
            <p class="eyebrow">${escapeHtml(event.type)}</p>
            <h3>${escapeHtml(event.title)}</h3>
          </div>
          <div class="event-badges">
            <span class="team-pill ${event.teamId}">${teamName(event.teamId)}</span>
            ${past ? '<span class="status-pill warn">Archived</span>' : ""}
          </div>
        </div>
        <p>${formatDate(event.datetime)}${event.finishTime ? ` to ${escapeHtml(event.finishTime)}` : ""} at ${escapeHtml(venue.name)}</p>
        <p>Pitch: ${escapeHtml(venue.address)}${event.meetTime ? ` - Report ${escapeHtml(event.meetTime)}` : ""}</p>
        ${venueParkingLine(venue)}
        <div class="mini-stats">
          <span>${counts.available} available</span>
          <span>${counts.unavailable} unavailable</span>
          <span>${counts.unknown} no reply</span>
          ${event.type === "Fixture" ? `<span>${counts.snacks} snacks</span><span>${counts.liftSeats} lift seats</span>` : ""}
          ${result ? `<span>${escapeHtml(result)}</span>` : ""}
          ${event.resultNotes ? `<span>${escapeHtml(event.resultNotes)}</span>` : ""}
          ${event.kit ? `<span>${escapeHtml(event.kit)}</span>` : ""}
          ${event.notes ? `<span>${escapeHtml(event.notes)}</span>` : ""}
        </div>
      </div>
      <div class="event-actions">
        <button class="secondary-button" type="button" data-action="focus-event" data-event-id="${event.id}">${openLabel}</button>
        <button class="secondary-button" type="button" data-modal="directions" data-event-id="${event.id}">Directions</button>
        ${coachActions}
      </div>
    </article>
  `;
}

function availabilityView() {
  const event = state.events.find((item) => item.id === state.selectedEventId) || state.events[0];
  if (!event) return emptyEventsView("Availability");
  const child = currentPlayer();
  const eventPlayers = getPlayersForEvent(event);
  const childInEvent = child && eventPlayers.some((player) => player.id === child.id);
  const players = hasCoachAccess() ? eventPlayers : [child].filter(Boolean).filter((player) => childInEvent);
  const counts = availabilityCounts(event.id);

  return `
    <section class="toolbar" data-tour="availability-summary">
      <label class="field compact-field">
        <span>Event</span>
        <select data-action="select-event">
          ${state.events.map((item) => `<option value="${item.id}" ${item.id === event.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}
        </select>
      </label>
      <div class="summary-strip">
        <span>${counts.available} available</span>
        <span>${counts.unavailable} unavailable</span>
        <span>${counts.unknown} no reply</span>
        ${event.type === "Fixture" ? `<span>${counts.snacks} snack offers</span><span>${counts.liftSeats} lift seats</span>` : ""}
      </div>
    </section>

    <section class="content-grid ${hasCoachAccess() ? "" : "two-col"}">
      ${!hasCoachAccess() ? parentAvailabilityCard(event, child, childInEvent) : ""}
      <article class="panel" data-tour="availability-responses">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Responses</p>
            <h3>${escapeHtml(event.title)}</h3>
          </div>
        </div>
        <div class="response-list">
          ${players.map((player) => responseRow(event, player)).join("")}
        </div>
      </article>
    </section>
  `;
}

function parentAvailabilityCard(event, child, childInEvent) {
  const entry = defaultAvailabilityEntry(state.availability[event.id]?.[child?.id]);
  const venue = eventVenue(event);
  if (!childInEvent) {
    return `
      <article class="panel">
        <p class="eyebrow">Availability</p>
        <h3>${escapeHtml(child?.name || "Linked child")}</h3>
        <p class="muted">This event is for ${teamName(event.teamId)}.</p>
      </article>
    `;
  }

  return `
    <article class="panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Your response</p>
          <h3>${escapeHtml(child.name)}</h3>
        </div>
        <span class="status-pill ${statusClass(entry.status)}">${statusText(entry.status)}</span>
      </div>
      <p class="muted">${formatDate(event.datetime)}${event.finishTime ? ` to ${escapeHtml(event.finishTime)}` : ""} at ${escapeHtml(venue.name)}</p>
      ${event.kit ? `<p class="muted">${escapeHtml(event.kit)}</p>` : ""}
      <p class="muted">Pitch: ${escapeHtml(venue.address)}</p>
      ${venue.parkingAddress ? `<p class="muted">Parking: ${escapeHtml(venue.parkingAddress)}</p>` : ""}
      <div class="choice-row">
        <button class="secondary-button" type="button" data-modal="directions" data-event-id="${event.id}">Directions</button>
      </div>
      <div class="choice-row">
        <button class="available-button" type="button" data-action="set-availability" data-status="available">Available</button>
        <button class="unavailable-button" type="button" data-action="set-availability" data-status="unavailable">Unavailable</button>
      </div>
      <label class="field">
        <span>Note to coach</span>
        <textarea rows="4" data-action="availability-note" placeholder="Anything the coach should know">${escapeHtml(entry.note)}</textarea>
      </label>
      ${event.type === "Fixture" ? availabilityExtras(entry) : ""}
    </article>
  `;
}

function availabilityExtras(entry) {
  const seats = Number(entry.liftSeats || 0);
  return `
    <div class="availability-options">
      <label class="toggle-card">
        <input type="checkbox" data-action="snack-volunteer" ${entry.snacks ? "checked" : ""}>
        <span>
          <strong>Can bring half-time snacks</strong>
          <small>Shown to coaches beside the fixture response.</small>
        </span>
      </label>
      <label class="toggle-card">
        <input type="checkbox" data-action="lift-offer" ${entry.liftOffer ? "checked" : ""}>
        <span>
          <strong>Can offer lifts</strong>
          <small>Add spare seats and where you are leaving from.</small>
        </span>
      </label>
      ${entry.liftOffer ? `
        <div class="lift-fields">
          <label class="field">
            <span>Spare seats</span>
            <select data-action="lift-seats">
              ${[1, 2, 3, 4, 5, 6].map((count) => `<option value="${count}" ${count === seats ? "selected" : ""}>${count}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>Leaving from</span>
            <input data-action="lift-from" value="${escapeHtml(entry.liftFrom)}" placeholder="Skelmorlie">
          </label>
        </div>
      ` : ""}
    </div>
  `;
}

function responseRow(event, player) {
  const entry = defaultAvailabilityEntry(state.availability[event.id]?.[player.id]);
  const extras = [];
  if (entry.snacks) extras.push("Snacks");
  if (entry.liftOffer) {
    const seatCount = Number(entry.liftSeats || 0);
    const seatLabel = `${seatCount || "?"} ${seatCount === 1 ? "seat" : "seats"}`;
    extras.push(`Lift: ${seatLabel}${entry.liftFrom ? ` from ${entry.liftFrom}` : ""}`);
  }
  return `
    <div class="person-row">
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <p>${teamName(player.teamId)} - ${escapeHtml(player.role)}${entry.note ? ` - ${escapeHtml(entry.note)}` : ""}</p>
        ${extras.length ? `<div class="availability-tags">${extras.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
      </div>
      <span class="status-pill ${statusClass(entry.status)}">${statusText(entry.status)}</span>
    </div>
  `;
}

function attendanceView() {
  const event = state.events.find((item) => item.id === state.selectedEventId) || state.events[0];
  if (!event) return emptyEventsView("Attendance");
  const eventPlayers = getPlayersForEvent(event);
  const child = currentPlayer();
  const players = hasCoachAccess()
    ? eventPlayers
    : [child].filter(Boolean).filter((player) => eventPlayers.some((eventPlayer) => eventPlayer.id === player.id));

  return `
    <section class="toolbar" data-tour="attendance-session">
      <label class="field compact-field">
        <span>Session</span>
        <select data-action="select-event">
          ${state.events.map((item) => `<option value="${item.id}" ${item.id === event.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}
        </select>
      </label>
    </section>
    <div class="attendance-grid" data-tour="attendance-grid">
      ${players.map((player) => attendanceCard(event, player)).join("")}
    </div>
    ${hasCoachAccess() ? parentAlertLog(event) : ""}
  `;
}

function emptyEventsView(title) {
  return `
    <section class="panel">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <h3>No events yet</h3>
      <p class="muted">Add a fixture or training session before using this page.</p>
      ${hasCoachAccess() ? '<button class="primary-button" type="button" data-modal="event">Add fixture/training</button>' : ""}
    </section>
  `;
}

function attendanceCard(event, player) {
  const value = state.attendance[event.id]?.[player.id] || "unknown";
  return `
    <article class="attendance-card">
      <div class="panel-title">
        <div>
          <h3>${escapeHtml(player.name)}</h3>
          <p>${teamName(player.teamId)} - ${attendancePercent(player.id)}% this month</p>
        </div>
        <span class="status-pill ${statusClass(value)}">${statusText(value)}</span>
      </div>
      ${hasCoachAccess() ? `
        <div class="choice-row">
          <button type="button" class="available-button" data-action="set-attendance" data-player-id="${player.id}" data-status="present">Present</button>
          <button type="button" class="unavailable-button" data-action="set-attendance" data-player-id="${player.id}" data-status="absent">Absent</button>
          <button type="button" class="collected-button" data-action="set-attendance" data-player-id="${player.id}" data-status="collected">Collected</button>
        </div>
      ` : ""}
    </article>
  `;
}

function parentAlertLog(event) {
  const alerts = (state.notifications || []).filter((alert) => alert.data?.eventId === event.id || alert.eventId === event.id).slice(0, 8);
  return `
    <article class="panel parent-alert-log">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Parent alerts</p>
          <h3>Push and in-app notification log</h3>
        </div>
        <span class="status-pill good">Firebase</span>
      </div>
      <p class="muted">Present and collected updates are written to Firestore. Firebase Cloud Functions sends the parent push notification and records it here.</p>
      ${alerts.length ? alerts.map((alert) => `
        <div class="person-row compact">
          <div>
            <strong>${escapeHtml(alert.title)}</strong>
            <p>${escapeHtml(alert.body)}</p>
          </div>
          <span class="status-pill good">${escapeHtml(displayDate(alert.createdAt || alert.sentAt))}</span>
        </div>
      `).join("") : '<p class="muted">No Firebase parent alerts recorded for this session yet.</p>'}
    </article>
  `;
}

function squadsView() {
  return `
    <section class="toolbar" data-tour="squad-actions">
      ${hasCoachAccess() ? '<button class="primary-button" type="button" data-modal="player">Add player</button>' : ""}
    </section>
    <div class="team-board" data-tour="team-board">
      ${teams.map(teamColumn).join("")}
    </div>
  `;
}

function teamColumn(team) {
  const players = activePlayers().filter((player) => player.teamId === team.id);
  return `
    <article class="team-column">
      <div class="panel-title">
        <div>
          <p class="eyebrow">${team.name}</p>
          <h3>${players.length} players</h3>
        </div>
        <span class="team-dot ${team.id}"></span>
      </div>
      ${players.map((player) => `
        <div class="person-row compact">
          <div>
            <strong>${escapeHtml(player.name)}</strong>
            <p>${escapeHtml(player.role)}</p>
            ${hasCoachAccess() ? `<p>${escapeHtml(player.parentName)} - ${escapeHtml(player.parentPhone)}</p>` : ""}
          </div>
          ${hasCoachAccess() ? `
            <div class="inline-actions">
              <button class="tiny-button" type="button" data-modal="edit-player" data-player-id="${player.id}">Edit</button>
              <button class="tiny-button" type="button" data-modal="move-player" data-player-id="${player.id}">Move</button>
            </div>
          ` : ""}
        </div>
      `).join("")}
    </article>
  `;
}

function messagesView() {
  const visible = visibleMessagesForUser();
  const parentNotifications = visibleParentNotificationsForUser();

  return `
    <section class="toolbar" data-tour="message-actions">
      <div></div>
      ${hasCoachAccess() ? '<button class="primary-button" type="button" data-modal="message">New message</button>' : ""}
    </section>
    <div class="message-list" data-tour="messages-panel">
      ${parentNotifications.map((alert) => `
        <article class="message-card parent-alert-message">
          <div class="panel-title">
            <div>
              <p class="eyebrow">Attendance alert - ${escapeHtml(displayDate(alert.createdAt || alert.sentAt))}</p>
              <h3>${escapeHtml(alert.title)}</h3>
            </div>
          </div>
          <p>${escapeHtml(alert.body)}</p>
        </article>
      `).join("")}
      ${visible.map((message) => `
        <article class="message-card">
          <div class="panel-title">
            <div>
              <p class="eyebrow">${escapeHtml(displayDate(message.createdAt))} - ${teamName(message.teamId)}</p>
              <h3>${escapeHtml(message.title)}</h3>
            </div>
          </div>
          <p>${escapeHtml(message.body)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function coachesView() {
  const contacts = appCoachContacts();
  return `
    <section class="content-grid two-col">
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Team contacts</p>
            <h3>Coaches</h3>
          </div>
        </div>
        <div class="coach-grid" data-tour="coach-contacts">
          ${contacts.map(coachCard).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Contact guidance</p>
            <h3>Parent contact rules</h3>
          </div>
        </div>
        <div class="check-list">
          <span>Use app messages for normal team updates.</span>
          <span>Use call or text for urgent fixture or pickup issues.</span>
          <span>Coach numbers are visible only inside verified parent/coach access.</span>
          <span>Email fields are left blank until the club confirms official addresses.</span>
        </div>
      </article>
    </section>
  `;
}

function venuesView() {
  const fixedVenues = appVenues().filter((venue) => venue.id !== "away-custom");
  return `
    <section class="toolbar">
      <div>
        <p class="eyebrow">Matchday places</p>
        <h2 class="section-heading">Venues and parking</h2>
      </div>
      <button class="secondary-button" type="button" data-route-target="schedule">View fixtures</button>
    </section>
    <section class="venue-grid" data-tour="venue-list">
      ${fixedVenues.map(venueCard).join("")}
    </section>
    <article class="panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Away games</p>
          <h3>Typed away destination</h3>
        </div>
      </div>
      <p class="muted">For one-off away fixtures, coaches can type the pitch name and address when creating or editing the fixture. The schedule will still show map buttons for parents.</p>
    </article>
  `;
}

function venueCard(venue) {
  return `
    <article class="venue-card">
      <div class="panel-title">
        <div>
          <p class="eyebrow">${escapeHtml(venue.surface || "Venue")}</p>
          <h3>${escapeHtml(venue.name)}</h3>
        </div>
      </div>
      <p class="muted">${escapeHtml(venue.notes || "")}</p>
      <div class="venue-location">
        <strong>Pitch</strong>
        <span>${escapeHtml(venue.address)}</span>
      </div>
      ${venue.parkingAddress ? `
        <div class="venue-location">
          <strong>Parking</strong>
          <span>${escapeHtml(venue.parkingAddress)}</span>
        </div>
      ` : ""}
      <div class="venue-media-grid">
        ${venuePhoto("Pitch", venue.pitchImage)}
        ${venuePhoto("Parking", venue.parkingImage)}
      </div>
      <div class="choice-row venue-actions">
        ${venueMapActions(venue)}
        ${hasCoachAccess() ? `<button class="secondary-button" type="button" data-modal="edit-venue" data-venue-id="${escapeHtml(venue.id)}">Edit venue</button>` : ""}
      </div>
    </article>
  `;
}

function venuePhoto(label, imagePath) {
  if (imagePath) {
    return `
      <figure class="venue-photo">
        <img src="${escapeHtml(imagePath)}" alt="${escapeHtml(label)} photo">
        <figcaption>${escapeHtml(label)}</figcaption>
      </figure>
    `;
  }

  return `
    <figure class="venue-photo empty">
      <img src="${crestPath}" alt="">
      <figcaption>${escapeHtml(label)}</figcaption>
    </figure>
  `;
}

function coachCard(coach) {
  const displayPhone = formatPhone(coach.phone);
  const tel = phoneHref(coach.phone);
  return `
    <article class="coach-card">
      <div class="coach-avatar">${escapeHtml(coach.name.slice(0, 1))}</div>
      <div class="coach-copy">
        <div class="panel-title">
          <div>
            <h3>${escapeHtml(coach.name)}</h3>
            <p>${escapeHtml(coach.role)} - ${teamName(coach.teamId)}</p>
          </div>
          <span class="team-pill all">All teams</span>
        </div>
        <p class="phone-line">${escapeHtml(displayPhone)}</p>
        <div class="contact-actions">
          <a class="primary-button" href="tel:${tel}">Call</a>
          <a class="secondary-link" href="sms:${tel}">Text</a>
          ${hasCoachAccess() ? `<button class="secondary-button" type="button" data-modal="edit-coach" data-coach-id="${escapeHtml(coach.id)}">Edit</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

function formatPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length === 11 ? digits.replace(/^(\d{5})(\d{3})(\d{3})$/, "$1 $2 $3") : phone;
}

function phoneHref(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.startsWith("0") ? `+44${digits.slice(1)}` : digits;
}

function accessView() {
  return hasCoachAccess() ? coachAccessView() : parentAccessView();
}

function parentAccessView() {
  const approved = approvedLinks();
  const pending = pendingRequests();
  return `
    <section class="content-grid two-col">
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Verified children</p>
            <h3>${state.session.parentName || "Parent account"}</h3>
          </div>
        </div>
        ${approved.length ? approved.map((link) => accessLinkRow(link)).join("") : '<p class="muted">No verified child links yet.</p>'}
        ${pending.length ? `<div class="divider"></div>${pending.map((request) => accessRequestRow(request)).join("")}` : ""}
      </article>
      ${parentProfileCard()}
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Account security</p>
            <h3>Change password</h3>
          </div>
          <span class="status-pill good">Firebase Auth</span>
        </div>
        <form class="stacked-form" data-form="change-password">
          <label class="field">
            <span>New password</span>
            <input name="newPassword" type="password" minlength="6" required placeholder="Choose a new password">
          </label>
          <label class="field">
            <span>Confirm password</span>
            <input name="confirmPassword" type="password" minlength="6" required placeholder="Repeat password">
          </label>
          <button class="primary-button" type="submit">Update password</button>
        </form>
      </article>
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Request access</p>
            <h3>Link another child</h3>
          </div>
        </div>
        <form class="stacked-form" data-form="request-access">
          <label class="field">
            <span>Child name</span>
            <input name="childName" required placeholder="Child name">
          </label>
          <label class="field">
            <span>Relationship</span>
            <select name="relation"><option>Parent</option><option>Guardian</option><option>Carer</option></select>
          </label>
          <label class="check-row">
            <input type="checkbox" name="consent" required>
            <span>I have permission to request access to this child profile.</span>
          </label>
          <button class="primary-button" type="submit">Send request</button>
        </form>
      </article>
    </section>
  `;
}

function parentProfileCard() {
  return `
    <article class="panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Your contact details</p>
          <h3>Parent profile</h3>
        </div>
        <span class="status-pill good">Self-edit</span>
      </div>
      <p class="muted">Keep your phone number current so coaches can contact you if plans change.</p>
      <form class="stacked-form" data-form="parent-profile">
        <label class="field">
          <span>Name</span>
          <input name="parentName" autocomplete="name" required value="${escapeHtml(state.session.parentName || "")}">
        </label>
        <label class="field">
          <span>Phone number</span>
          <input name="phone" type="tel" autocomplete="tel" value="${escapeHtml(formatPhone(state.session.phone || ""))}" placeholder="07123 456 789">
        </label>
        <label class="field">
          <span>Email</span>
          <input value="${escapeHtml(state.session.email || "")}" disabled>
        </label>
        <button class="primary-button" type="submit">Save contact details</button>
      </form>
    </article>
  `;
}

function accessLinkRow(link) {
  const player = activePlayers().find((item) => item.id === link.playerId);
  return `
    <div class="person-row">
      <div>
        <strong>${escapeHtml(player?.name || "Unknown child")}</strong>
        <p>${escapeHtml(link.relation)} - ${player ? teamName(player.teamId) : "Team to confirm"}</p>
      </div>
      <span class="status-pill good">Approved</span>
    </div>
  `;
}

function accessRequestRow(request) {
  const player = activePlayers().find((item) => item.id === request.playerId);
  return `
    <div class="person-row">
      <div>
        <strong>${escapeHtml(player?.name || request.childName || "Child requested")}</strong>
        <p>${escapeHtml(request.relation)}</p>
      </div>
      <span class="status-pill warn">Pending</span>
    </div>
  `;
}

function coachAccessView() {
  const requests = state.accessRequests;
  const appUsers = state.users.slice().sort((a, b) => (a.name || a.email || "").localeCompare(b.name || b.email || ""));
  return `
    <section class="content-grid two-col">
      <article class="panel" data-tour="access-queue">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Parent verification</p>
            <h3>${requests.filter((request) => request.status === "pending").length} pending</h3>
          </div>
        </div>
        <div class="request-list">
          ${requests.map((request) => coachRequestRow(request)).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Dual account switch</p>
            <h3>Parent and coach accounts</h3>
          </div>
        </div>
        <p class="muted">Turn this on only for known coaches who also need a parent account shortcut. Normal parents will only see Log out.</p>
        <div class="request-list">
          ${appUsers.length ? appUsers.map(userSwitchRow).join("") : '<p class="muted">No user accounts loaded yet.</p>'}
        </div>
      </article>
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Approved links</p>
            <h3>${state.parentLinks.length} active</h3>
          </div>
        </div>
        ${state.parentLinks.map((link) => accessLinkRow(link)).join("")}
      </article>
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Verification flow</p>
            <h3>How parents get access</h3>
          </div>
        </div>
        <div class="check-list">
          <span>Parent requests access to their child.</span>
          <span>Coach checks the parent is known to the team.</span>
          <span>Coach chooses the matching player and approves the link.</span>
          <span>Parent uses their own Firebase email and password.</span>
          <span>Once approved, the parent only sees their linked child.</span>
        </div>
      </article>
    </section>
  `;
}

function userSwitchRow(user) {
  return `
    <div class="person-row compact">
      <div>
        <strong>${escapeHtml(user.name || user.email || "Unnamed account")}</strong>
        <p>${escapeHtml(user.email || "")} - ${escapeHtml(user.role || "no role")}</p>
      </div>
      <div class="inline-actions">
        <span class="status-pill ${user.canSwitchPortal ? "good" : "warn"}">${user.canSwitchPortal ? "Switch on" : "Switch off"}</span>
        <button class="tiny-button" type="button" data-action="toggle-dual-user" data-user-id="${escapeHtml(user.id)}" data-enabled="${user.canSwitchPortal ? "false" : "true"}">
          ${user.canSwitchPortal ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  `;
}

function coachRequestRow(request) {
  const player = activePlayers().find((item) => item.id === request.playerId);
  return `
    <div class="person-row">
      <div>
        <strong>${escapeHtml(request.parentName)}</strong>
        <p>${escapeHtml(player?.name || request.childName || "Child requested")} - ${escapeHtml(request.relation)}</p>
        ${request.email ? `<p>${escapeHtml(request.email)}</p>` : ""}
      </div>
      <div class="inline-actions">
        <span class="status-pill ${statusClass(request.status)}">${statusText(request.status)}</span>
        ${request.status === "pending" ? `
          <select class="tiny-select" data-request-player="${escapeHtml(request.id)}">
            <option value="">Choose child</option>
            ${activePlayers().map((item) => `<option value="${item.id}" ${item.id === request.playerId ? "selected" : ""}>${escapeHtml(item.name)} - ${teamName(item.teamId)}</option>`).join("")}
          </select>
          <button class="tiny-button approve" type="button" data-action="review-request" data-request-id="${request.id}" data-status="approved">Approve</button>
          <button class="tiny-button reject" type="button" data-action="review-request" data-request-id="${request.id}" data-status="rejected">Reject</button>
        ` : ""}
        <button class="tiny-button reject" type="button" data-action="delete-access-request" data-request-id="${escapeHtml(request.id)}">Delete</button>
      </div>
    </div>
  `;
}

function privacyView() {
  return `
    <section class="content-grid two-col">
      <article class="panel privacy-panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Privacy notice</p>
            <h3>Largs Colts 2016</h3>
          </div>
          <span class="status-pill good">Live</span>
        </div>
        ${privacyNoticeContent()}
      </article>
      ${hasCoachAccess() ? coachDataRequestsPanel() : parentDataRequestPanel()}
    </section>
  `;
}

function privacyNoticeContent() {
  return `
    <div class="privacy-copy">
      <h4>Introduction</h4>
      <p>Largs Colts 2016 uses a team management app to help organise training, matches, player availability, attendance, and team communication.</p>
      <p>We are committed to protecting the privacy and security of players' and parents' personal information and handling data responsibly in line with UK data protection legislation.</p>

      <h4>What Information We Collect</h4>
      <p>Player information may include player name, date of birth or age group, team/squad information, attendance records, match and training availability, parent/guardian contact details, and app notification preferences.</p>
      <p>Parent/guardian information may include name, email address, telephone number, and relationship to the player.</p>
      <p>We aim to minimise the information collected and only request information necessary for running the team safely and effectively.</p>

      <h4>Why We Use This Information</h4>
      <ul>
        <li>Organising training sessions and matches</li>
        <li>Managing player availability and attendance</li>
        <li>Communicating important team updates</li>
        <li>Supporting player welfare and safeguarding</li>
        <li>Managing team operations and administration</li>
      </ul>

      <h4>Lawful Basis</h4>
      <p>Our lawful basis for processing this information is legitimate interests, as the data is necessary for the safe and effective management of the football team.</p>
      <p>Where required, we may also rely on parental consent for certain communications or optional features.</p>

      <h4>Who Can Access the Information</h4>
      <p>Information is only accessible to authorised coaches and team administrators who require access for team management purposes.</p>
      <p>We do not sell or share personal information with third parties for marketing purposes.</p>
      <p>Information may be shared where necessary for football administration, fixture organisation, player registration, safeguarding, or legal obligations.</p>

      <h4>Data Security</h4>
      <p>We take reasonable steps to protect information held within the app, including restricted administrator access, password-protected accounts, and limiting access to relevant team officials only.</p>

      <h4>How Long We Keep Information</h4>
      <p>Information will only be retained for as long as reasonably necessary for team administration and safeguarding purposes.</p>
      <p>Data relating to players who leave the club will be periodically reviewed and removed where no longer required.</p>

      <h4>Your Rights</h4>
      <ul>
        <li>Request access to the information held about their child</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of information where appropriate</li>
        <li>Raise concerns regarding how information is being used</li>
      </ul>

      <h4>Contact</h4>
      <p>For questions, support, or data-related requests, please contact: <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.</p>
    </div>
  `;
}

function parentDataRequestPanel() {
  const players = approvedPlayers();
  const requests = state.dataRequests.filter((request) => request.parentUid === state.session.userId);
  return `
    <article class="panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Data request</p>
          <h3>Remove or correct data</h3>
        </div>
      </div>
      <p class="muted">Use this form for requests such as removing your child's data, checking what is held, correcting details, or raising a privacy concern.</p>
      <form class="stacked-form" data-form="data-request">
        <label class="field">
          <span>Request type</span>
          <select name="requestType">
            <option value="delete">Remove my child's data</option>
            <option value="access">Access information held</option>
            <option value="correct">Correct inaccurate information</option>
            <option value="concern">Raise a data concern</option>
          </select>
        </label>
        ${players.length ? `
          <label class="field">
            <span>Child</span>
            <select name="playerId">
              <option value="">Choose child</option>
              ${players.map((player) => `<option value="${player.id}">${escapeHtml(player.name)} - ${teamName(player.teamId)}</option>`).join("")}
            </select>
          </label>
        ` : ""}
        <label class="field">
          <span>Child name</span>
          <input name="childName" ${players.length ? "" : "required"} placeholder="Child name if not listed above">
        </label>
        <label class="field">
          <span>Details</span>
          <textarea name="details" rows="5" placeholder="Add any detail that will help coaches deal with the request"></textarea>
        </label>
        <button class="primary-button" type="submit">Send data request</button>
      </form>
      <div class="divider"></div>
      <div class="request-list">
        ${requests.length ? requests.map(dataRequestRow).join("") : '<p class="muted">No data requests submitted yet.</p>'}
      </div>
    </article>
  `;
}

function coachDataRequestsPanel() {
  const requests = state.dataRequests.slice().sort(sortByCreatedAtDesc);
  return `
    <article class="panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Parent data requests</p>
          <h3>${requests.filter((request) => request.status === "pending").length} pending</h3>
        </div>
      </div>
      <p class="muted">Review requests with the coaches/admins before deleting or changing any child record, especially where safeguarding or football administration records may need to be retained.</p>
      <div class="request-list">
        ${requests.length ? requests.map(dataRequestRow).join("") : '<p class="muted">No parent data requests yet.</p>'}
      </div>
    </article>
  `;
}

function dataRequestRow(request) {
  const player = activePlayers().find((item) => item.id === request.playerId);
  const typeText = {
    delete: "Remove data",
    access: "Access data",
    correct: "Correct data",
    concern: "Data concern",
  }[request.requestType] || request.requestType || "Data request";
  return `
    <div class="person-row">
      <div>
        <strong>${escapeHtml(typeText)} - ${escapeHtml(player?.name || request.childName || "Child")}</strong>
        <p>${escapeHtml(request.parentName || "Parent")} - ${escapeHtml(request.email || "")}</p>
        ${request.details ? `<p>${escapeHtml(request.details)}</p>` : ""}
      </div>
      <div class="inline-actions">
        <span class="status-pill ${request.status === "resolved" ? "good" : "warn"}">${request.status === "resolved" ? "Resolved" : "Pending"}</span>
        ${hasCoachAccess() && request.status !== "resolved" ? `<button class="tiny-button approve" type="button" data-action="resolve-data-request" data-request-id="${escapeHtml(request.id)}">Mark resolved</button>` : ""}
        ${hasCoachAccess() ? `<button class="tiny-button reject" type="button" data-action="delete-data-request" data-request-id="${escapeHtml(request.id)}">Delete</button>` : ""}
      </div>
    </div>
  `;
}

function guideView() {
  return `
    <section class="content-grid two-col">
      <article class="panel parent-guide-panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">How to use the app</p>
            <h3>Parent quick start</h3>
          </div>
          <span class="status-pill good">Parent guide</span>
        </div>
        <div class="guide-steps">
          <div><strong>1. Sign in</strong><p>Use your own email and password. If you forget it, use the Forgot password button on the sign-in screen.</p></div>
          <div><strong>2. Request your child</strong><p>Ask for access to your child once. A coach checks the request before player details appear.</p></div>
          <div><strong>3. Mark availability</strong><p>Open Availability, choose the event, then tap Available or Unavailable. For fixtures you can also offer snacks or lifts.</p></div>
          <div><strong>4. Check venues</strong><p>Use Schedule or Venues for pitch, parking, Google Maps and Apple Maps links.</p></div>
          <div><strong>5. Read messages</strong><p>The message badge clears after you open Messages. Parent alerts for attendance and collection also appear there.</p></div>
          <div><strong>6. Keep details current</strong><p>Use Access to update your own name and phone number, or Privacy to request a correction or removal of data.</p></div>
        </div>
      </article>
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Need help?</p>
            <h3>Support and privacy</h3>
          </div>
        </div>
        <div class="check-list">
          <span>For app support, contact ${escapeHtml(supportEmail)}.</span>
          <span>Only approved coaches and team admins can see child records.</span>
          <span>Parents only see linked children approved by a coach.</span>
          <span>You can request data removal or corrections from the Privacy page.</span>
        </div>
      </article>
    </section>
  `;
}

function installView() {
  const appUrl = `${window.location.origin}${window.location.pathname}`;
  const backendEnabled = Boolean(backendConfig.enabled);
  return `
    <section class="content-grid two-col">
      <article class="panel install-panel" data-tour="install-panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Mobile test link</p>
            <h3>Install on phone</h3>
          </div>
        </div>
        <div class="link-box">${escapeHtml(appUrl)}</div>
        <div class="choice-row">
          <button class="primary-button" type="button" data-action="copy-link" data-copy="${escapeHtml(appUrl)}">Copy link</button>
          <a class="secondary-link" href="dist/largs-colts-2016s-pwa.zip" download>Download package</a>
        </div>
      </article>
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Live backend</p>
            <h3>${backendEnabled ? "Firebase connected" : "Firebase config needed"}</h3>
          </div>
          <span class="status-pill ${backendEnabled ? "good" : "warn"}">${backendEnabled ? "Ready" : "Setup"}</span>
        </div>
        <p class="muted">Support contact: ${escapeHtml(supportEmail)}</p>
        <p class="muted">${backendEnabled ? "You can request push permission on this device." : "Add your Firebase web config and VAPID key in firebase-config.js before real login and push testing."}</p>
        <div class="choice-row">
          <button class="primary-button" type="button" data-action="enable-push">Enable push on this device</button>
          <a class="secondary-link" href="FIREBASE-SETUP.md" target="_blank" rel="noreferrer">Firebase setup guide</a>
        </div>
      </article>
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Before parent rollout</p>
            <h3>Firebase hardening</h3>
          </div>
          <span class="status-pill warn">Owner checks</span>
        </div>
        <div class="check-list">
          <span>Budget alerts set in Google Cloud Billing</span>
          <span>Latest Firestore rules deployed</span>
          <span>Only coaches/admins can write players, fixtures, venues and protected records</span>
          <span>Old test access requests and data requests cleared</span>
          <span>App Check reviewed before wide parent rollout</span>
          <span>Service account files kept off GitHub</span>
        </div>
      </article>
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Release status</p>
            <h3>Parent test build</h3>
          </div>
        </div>
        <div class="check-list">
          <span>Exact club crest loaded</span>
          <span>Firebase email and password login active</span>
          <span>Coach and parent routes separated by Firestore role</span>
          <span>Coach parent verification queue writes to Firestore</span>
          <span>Parents can change their Firebase password</span>
          <span>Full roster and teams seeded into Firestore</span>
          <span>Fixtures and training stored in Firestore</span>
          <span>Availability and attendance stored per event in Firestore</span>
          <span>Announcements trigger parent push notifications</span>
          <span>Home, 3G, Barrfields and typed away venues loaded</span>
          <span>Google Maps and Apple Maps buttons added</span>
          <span>Venue page includes pitch, parking and photo spaces</span>
          <span>Upcoming and past event archive added</span>
          <span>Fixture result fields added for completed matches</span>
          <span>Cleaner fixture cards with directions tucked into one button</span>
          <span>Parents can offer snacks and lifts on fixture availability</span>
          <span>Privacy notice and parent data request process added</span>
          <span>Parent self-edit added for name and phone number</span>
          <span>Forgot password reset added to coach and parent sign-in</span>
          <span>Parent how-to-use guide added</span>
          <span>Coach contacts can now be updated in the app</span>
          <span>Venues, pitch pins, parking pins and photo paths can now be updated in the app</span>
          <span>Firestore rules tightened for parent-safe writes</span>
          <span>Coach contacts added with call and text links</span>
          <span>App icons and red splash screen ready for mobile wrapping</span>
          <span>Capacitor config ready for iOS and Android wrapping</span>
        </div>
      </article>
    </section>
  `;
}

function modalView() {
  if (!state.modal) return "";
  const type = state.modal.type;
  return `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal-close" type="button" data-action="close-modal" aria-label="Close">x</button>
        ${modalContent(type)}
      </section>
    </div>
  `;
}

function modalContent(type) {
  if (type === "event") return eventModal();
  if (type === "edit-event") return eventModal(state.modal.eventId);
  if (type === "directions") return directionsModal(state.modal.eventId);
  if (type === "message") return messageModal();
  if (type === "player") return playerModal();
  if (type === "move-player") return movePlayerModal(state.modal.playerId);
  if (type === "edit-player") return editPlayerModal(state.modal.playerId);
  if (type === "edit-coach") return editCoachModal(state.modal.coachId);
  if (type === "edit-venue") return editVenueModal(state.modal.venueId);
  return "";
}

function directionsModal(eventId = "") {
  const event = state.events.find((item) => item.id === eventId);
  const venue = event ? eventVenue(event) : venueById("bowencraig");
  return `
    <p class="eyebrow">Matchday directions</p>
    <h2 id="modal-title">${escapeHtml(event?.title || venue.name)}</h2>
    <div class="directions-panel">
      <div class="venue-location">
        <strong>Pitch</strong>
        <span>${escapeHtml(venue.address)}</span>
      </div>
      ${venue.parkingAddress ? `
        <div class="venue-location">
          <strong>Parking</strong>
          <span>${escapeHtml(venue.parkingAddress)}</span>
        </div>
      ` : ""}
      <div class="direction-actions">
        ${venueMapActions(venue)}
      </div>
    </div>
  `;
}

function eventModal(eventId = "") {
  const event = state.events.find((item) => item.id === eventId);
  const editing = Boolean(event);
  const venueChoices = appVenues();
  const venue = event ? eventVenue(event) : venueChoices[0];
  const selectedVenueId = event?.venueId || venue.id;
  const isAway = selectedVenueId === "away-custom";
  const type = event?.type || "Fixture";
  const teamId = event?.teamId || "all";
  const opponent = type === "Fixture" ? event?.opponent || "" : event?.title || "";
  const date = dateValue(event?.datetime);
  const startTime = timeValue(event?.datetime) || "09:30";
  const finishTime = event?.finishTime || suggestFinishTime(event?.datetime || combineDateTime(date || "2026-05-16", startTime), type);
  const meetTime = event?.meetTime || "";
  const kit = event?.kit || "Home kit";
  const homeScore = event?.homeScore ?? "";
  const awayScore = event?.awayScore ?? "";
  const resultNotes = event?.resultNotes || "";
  return `
    <p class="eyebrow">Coach action</p>
    <h2 id="modal-title">${editing ? "Edit fixture/training" : "Add fixture/training"}</h2>
    <form class="stacked-form" data-form="${editing ? "edit-event" : "event"}">
      ${editing ? `<input type="hidden" name="eventId" value="${escapeHtml(event.id)}">` : ""}
      <label class="field"><span>Type</span><select name="type" data-action="event-type-choice"><option ${type === "Fixture" ? "selected" : ""}>Fixture</option><option ${type === "Training" ? "selected" : ""}>Training</option></select></label>
      <label class="field"><span>Team</span><select name="teamId"><option value="all" ${teamId === "all" ? "selected" : ""}>All teams</option>${teams.map((team) => `<option value="${team.id}" ${team.id === teamId ? "selected" : ""}>${team.name}</option>`).join("")}</select></label>
      <label class="field"><span>Opponent or title</span><input name="opponent" required value="${escapeHtml(opponent)}" placeholder="Kilwinning Rangers"></label>
      <label class="field"><span>Date</span><input name="date" type="date" required value="${escapeHtml(date)}"></label>
      <label class="field"><span>Start time</span><select name="startTime">${timeOptions(startTime)}</select></label>
      <label class="field"><span>Finish time</span><select name="finishTime">${timeOptions(finishTime)}</select></label>
      <label class="field"><span>Report time</span><select name="meetTime">${timeOptions(meetTime, true)}</select></label>
      <label class="field"><span>Kit</span><select name="kit">${kitOptions.map((option) => `<option value="${option}" ${option === kit ? "selected" : ""}>${option}</option>`).join("")}</select></label>
      <label class="field"><span>Venue</span><select name="venueId" data-action="venue-choice">${venueChoices.map((item) => `<option value="${item.id}" ${item.id === selectedVenueId ? "selected" : ""}>${item.name}</option>`).join("")}</select></label>
      <div class="away-fields" data-away-fields ${isAway ? "" : "hidden"}>
        <label class="field"><span>Away venue name</span><input name="customVenue" value="${escapeHtml(isAway ? venue.name : "")}" placeholder="Bellfield Estate"></label>
        <label class="field"><span>Away address</span><input name="customAddress" value="${escapeHtml(isAway ? venue.address : "")}" placeholder="Bellfield Estate, Kilmarnock KA1 3XG"></label>
      </div>
      <div class="result-fields" data-result-fields ${type === "Fixture" ? "" : "hidden"}>
        <p class="eyebrow">Result after match</p>
        <div class="score-fields">
          <label class="field"><span>Largs score</span><input name="homeScore" type="number" min="0" inputmode="numeric" value="${escapeHtml(homeScore)}" placeholder="0"></label>
          <label class="field"><span>Opposition score</span><input name="awayScore" type="number" min="0" inputmode="numeric" value="${escapeHtml(awayScore)}" placeholder="0"></label>
        </div>
        <label class="field"><span>Result notes</span><input name="resultNotes" value="${escapeHtml(resultNotes)}" placeholder="Optional match note"></label>
      </div>
      <label class="field"><span>Notes</span><input name="notes" value="${escapeHtml(event?.notes || "")}" placeholder="Home kit, bring water"></label>
      <button class="primary-button" type="submit">${editing ? "Save changes" : "Add fixture/training"}</button>
    </form>
  `;
}

function messageModal() {
  return `
    <p class="eyebrow">Coach action</p>
    <h2 id="modal-title">Send message</h2>
    <form class="stacked-form" data-form="message">
      <label class="field"><span>Send to</span><select name="teamId"><option value="all">All teams</option>${teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join("")}</select></label>
      <label class="field"><span>Title</span><input name="title" required placeholder="Training update"></label>
      <label class="field"><span>Message</span><textarea name="body" rows="5" required placeholder="Message for parents"></textarea></label>
      <button class="primary-button" type="submit">Send message</button>
    </form>
  `;
}

function playerModal() {
  return `
    <p class="eyebrow">Coach action</p>
    <h2 id="modal-title">Add player</h2>
    <form class="stacked-form" data-form="player">
      <label class="field"><span>Name</span><input name="name" required placeholder="Player name"></label>
      <label class="field"><span>Team</span><select name="teamId">${teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join("")}</select></label>
      <label class="field"><span>Role</span><input name="role" required placeholder="Player"></label>
      <label class="field"><span>Parent name</span><input name="parentName" required placeholder="Parent Placeholder"></label>
      <label class="field"><span>Parent phone</span><input name="parentPhone" required placeholder="07000 000000"></label>
      <button class="primary-button" type="submit">Add player</button>
    </form>
  `;
}

function movePlayerModal(playerId) {
  const player = activePlayers().find((item) => item.id === playerId);
  return `
    <p class="eyebrow">Coach action</p>
    <h2 id="modal-title">Move ${escapeHtml(player?.name || "player")}</h2>
    <form class="stacked-form" data-form="move-player">
      <input type="hidden" name="playerId" value="${escapeHtml(playerId)}">
      <label class="field"><span>Team</span><select name="teamId">${teams.map((team) => `<option value="${team.id}" ${team.id === player?.teamId ? "selected" : ""}>${team.name}</option>`).join("")}</select></label>
      <button class="primary-button" type="submit">Move player</button>
    </form>
  `;
}

function editPlayerModal(playerId) {
  const player = activePlayers().find((item) => item.id === playerId);
  return `
    <p class="eyebrow">Coach action</p>
    <h2 id="modal-title">Edit ${escapeHtml(player?.name || "player")}</h2>
    <form class="stacked-form" data-form="edit-player">
      <input type="hidden" name="playerId" value="${escapeHtml(playerId)}">
      <label class="field"><span>Name</span><input name="name" required value="${escapeHtml(player?.name || "")}"></label>
      <label class="field"><span>Team</span><select name="teamId">${teams.map((team) => `<option value="${team.id}" ${team.id === player?.teamId ? "selected" : ""}>${team.name}</option>`).join("")}</select></label>
      <label class="field"><span>Role</span><input name="role" required value="${escapeHtml(player?.role || "Player")}"></label>
      <label class="field"><span>Parent name</span><input name="parentName" required value="${escapeHtml(player?.parentName || placeholderParent)}"></label>
      <label class="field"><span>Parent phone</span><input name="parentPhone" required value="${escapeHtml(player?.parentPhone || placeholderPhone)}"></label>
      <button class="primary-button" type="submit">Save player</button>
    </form>
  `;
}

function editCoachModal(coachId) {
  const coach = appCoachContacts().find((item) => item.id === coachId) || appCoachContacts()[0] || {};
  return `
    <p class="eyebrow">Coach admin</p>
    <h2 id="modal-title">Edit coach contact</h2>
    <form class="stacked-form" data-form="edit-coach">
      <input type="hidden" name="coachId" value="${escapeHtml(coach.id || coachId || "")}">
      <label class="field"><span>Name</span><input name="name" required value="${escapeHtml(coach.name || "")}"></label>
      <label class="field"><span>Team</span><select name="teamId"><option value="all" ${coach.teamId === "all" ? "selected" : ""}>All teams</option>${teams.map((team) => `<option value="${team.id}" ${team.id === coach.teamId ? "selected" : ""}>${team.name}</option>`).join("")}</select></label>
      <label class="field"><span>Role</span><input name="role" required value="${escapeHtml(coach.role || "Coach")}"></label>
      <label class="field"><span>Phone</span><input name="phone" type="tel" value="${escapeHtml(formatPhone(coach.phone || ""))}" placeholder="07123 456 789"></label>
      <label class="field"><span>Email</span><input name="email" type="email" value="${escapeHtml(coach.email || "")}" placeholder="Optional"></label>
      <button class="primary-button" type="submit">Save coach contact</button>
    </form>
  `;
}

function editVenueModal(venueId) {
  const venue = venueById(venueId);
  return `
    <p class="eyebrow">Venue admin</p>
    <h2 id="modal-title">Edit venue</h2>
    <form class="stacked-form" data-form="edit-venue">
      <input type="hidden" name="venueId" value="${escapeHtml(venue.id || venueId || "")}">
      <label class="field"><span>Name</span><input name="name" required value="${escapeHtml(venue.name || "")}"></label>
      <label class="field"><span>Pitch address or map pin</span><input name="address" required value="${escapeHtml(venue.address || "")}"></label>
      <label class="field"><span>Parking address or map pin</span><input name="parkingAddress" value="${escapeHtml(venue.parkingAddress || "")}"></label>
      <label class="field"><span>Surface</span><input name="surface" value="${escapeHtml(venue.surface || "")}" placeholder="Grass pitch"></label>
      <label class="field"><span>Notes</span><textarea name="notes" rows="3" placeholder="Useful parent information">${escapeHtml(venue.notes || "")}</textarea></label>
      <label class="field"><span>Pitch photo path or URL</span><input name="pitchImage" value="${escapeHtml(venue.pitchImage || "")}" placeholder="assets/venues/bowencraig-pitch.jpg"></label>
      <label class="field"><span>Parking photo path or URL</span><input name="parkingImage" value="${escapeHtml(venue.parkingImage || "")}" placeholder="assets/venues/bowencraig-parking.jpg"></label>
      <button class="primary-button" type="submit">Save venue</button>
    </form>
  `;
}

function bindFormDefaults() {
  toggleAwayFields();
  toggleResultFields();
}

function toggleAwayFields() {
  const venueChoice = $('[data-action="venue-choice"]');
  const awayFields = $('[data-away-fields]');
  if (!venueChoice || !awayFields) return;
  awayFields.hidden = venueChoice.value !== "away-custom";
}

function toggleResultFields() {
  const typeChoice = $('[data-action="event-type-choice"]');
  const resultFields = $('[data-result-fields]');
  if (!typeChoice || !resultFields) return;
  resultFields.hidden = typeChoice.value !== "Fixture";
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action], [data-route], [data-route-target], [data-modal]");
  if (!target) return;

  const backdropClick = event.target.classList.contains("modal-backdrop");
  const action = target.dataset.action;

  if (target.dataset.route) {
    event.preventDefault();
    state.route = target.dataset.route;
    if (state.route === "messages") await markMessagesRead();
    saveState();
    render();
    return;
  }

  if (target.dataset.routeTarget) {
    state.route = target.dataset.routeTarget;
    if (state.route === "messages") await markMessagesRead();
    saveState();
    render();
    return;
  }

  if (target.dataset.modal) {
    state.modal = {
      type: target.dataset.modal,
      playerId: target.dataset.playerId,
      eventId: target.dataset.eventId,
      coachId: target.dataset.coachId,
      venueId: target.dataset.venueId,
    };
    render();
    return;
  }

  if (action === "close-modal" && (backdropClick || target.classList.contains("modal-close"))) {
    delete state.modal;
    render();
    return;
  }

  if (action === "set-auth-role") {
    state.authRole = target.dataset.role;
    render();
    return;
  }

  if (action === "sign-out") {
    await signOutLive();
    return;
  }

  if (action === "reset-password") {
    await sendPasswordReset(target);
    return;
  }

  if (action === "switch-account") {
    await signOutLive(target.dataset.role || "parent");
    return;
  }

  if (action === "coach-guide-next") {
    updateCoachGuide(1);
    return;
  }

  if (action === "coach-guide-back") {
    updateCoachGuide(-1);
    return;
  }

  if (action === "coach-guide-stop") {
    stopCoachGuide();
    return;
  }

  if (action === "coach-guide-restart") {
    restartCoachGuide();
    return;
  }

  if (action === "set-schedule-filter") {
    state.scheduleFilter = target.dataset.teamId;
    saveState();
    render();
    return;
  }

  if (action === "set-schedule-period") {
    state.schedulePeriod = target.dataset.period || "upcoming";
    saveState();
    render();
    return;
  }

  if (action === "focus-event") {
    state.selectedEventId = target.dataset.eventId;
    state.route = "availability";
    saveState();
    render();
    return;
  }

  if (action === "delete-event") {
    await deleteEvent(target.dataset.eventId);
    return;
  }

  if (action === "set-availability") {
    const child = currentPlayer();
    if (child) {
      const previous = state.availability[state.selectedEventId]?.[child.id] || { status: "unknown", note: "" };
      state.availability[state.selectedEventId] = state.availability[state.selectedEventId] || {};
      state.availability[state.selectedEventId][child.id] = {
        ...defaultAvailabilityEntry(previous),
        status: target.dataset.status,
      };
      if (target.dataset.status === "unavailable") {
        state.availability[state.selectedEventId][child.id].snacks = false;
        state.availability[state.selectedEventId][child.id].liftOffer = false;
        state.availability[state.selectedEventId][child.id].liftSeats = 0;
        state.availability[state.selectedEventId][child.id].liftFrom = "";
      }
      try {
        await saveAvailability(child.id);
      } catch {
        state.availability[state.selectedEventId][child.id] = previous;
        render();
        return;
      }
      saveState();
      render();
      toast("Availability saved");
    }
    return;
  }

  if (action === "set-attendance") {
    await setAttendance(target.dataset.playerId, target.dataset.status);
    return;
  }

  if (action === "review-request") {
    await reviewRequest(target.dataset.requestId, target.dataset.status);
    saveState();
    render();
    return;
  }

  if (action === "toggle-dual-user") {
    await toggleDualUser(target.dataset.userId, target.dataset.enabled === "true");
    return;
  }

  if (action === "resolve-data-request") {
    await resolveDataRequest(target.dataset.requestId);
    return;
  }

  if (action === "delete-access-request") {
    await deleteAccessRequest(target.dataset.requestId);
    return;
  }

  if (action === "delete-data-request") {
    await deleteDataRequest(target.dataset.requestId);
    return;
  }

  if (action === "copy-link") {
    copyText(target.dataset.copy);
    return;
  }

  if (action === "enable-push") {
    enablePushNotifications();
    return;
  }
});

document.addEventListener("change", async (event) => {
  const target = event.target;
  if (target.dataset.action === "select-child") {
    state.session.selectedPlayerId = target.value;
    saveState();
    render();
    return;
  }
  if (target.dataset.action === "select-event") {
    state.selectedEventId = target.value;
    saveState();
    render();
    return;
  }
  if (target.dataset.action === "venue-choice") {
    toggleAwayFields();
    return;
  }
  if (target.dataset.action === "event-type-choice") {
    toggleResultFields();
    return;
  }
  if (["snack-volunteer", "lift-offer", "lift-seats"].includes(target.dataset.action)) {
    const child = currentPlayer();
    if (!child) return;
    state.availability[state.selectedEventId] = state.availability[state.selectedEventId] || {};
    const entry = defaultAvailabilityEntry(state.availability[state.selectedEventId][child.id]);

    if (target.dataset.action === "snack-volunteer") {
      entry.snacks = target.checked;
    }
    if (target.dataset.action === "lift-offer") {
      entry.liftOffer = target.checked;
      entry.liftSeats = target.checked ? Number(entry.liftSeats || 1) : 0;
      if (!target.checked) entry.liftFrom = "";
    }
    if (target.dataset.action === "lift-seats") {
      entry.liftSeats = Number(target.value || 1);
      entry.liftOffer = true;
    }

    state.availability[state.selectedEventId][child.id] = entry;
    try {
      await saveAvailability(child.id);
    } catch {
      return;
    }
    saveState();
    render();
    toast("Availability saved");
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.dataset.action === "availability-note") {
    const child = currentPlayer();
    if (!child) return;
    state.availability[state.selectedEventId] = state.availability[state.selectedEventId] || {};
    state.availability[state.selectedEventId][child.id] = {
      ...defaultAvailabilityEntry(state.availability[state.selectedEventId][child.id]),
      note: target.value,
    };
    scheduleAvailabilitySave(child.id);
    saveState();
    return;
  }
  if (target.dataset.action === "lift-from") {
    const child = currentPlayer();
    if (!child) return;
    state.availability[state.selectedEventId] = state.availability[state.selectedEventId] || {};
    state.availability[state.selectedEventId][child.id] = {
      ...defaultAvailabilityEntry(state.availability[state.selectedEventId][child.id]),
      liftOffer: true,
      liftSeats: Number(state.availability[state.selectedEventId][child.id]?.liftSeats || 1),
      liftFrom: target.value,
    };
    scheduleAvailabilitySave(child.id);
    saveState();
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);

  try {
    if (form.dataset.form === "parent-login") await handleParentLogin(data);
    if (form.dataset.form === "coach-login") await handleCoachLogin(data);
    if (form.dataset.form === "request-access") await requestAccess(data);
    if (form.dataset.form === "parent-profile") await updateParentProfile(data);
    if (form.dataset.form === "data-request") await submitDataRequest(data);
    if (form.dataset.form === "change-password") await changePassword(data);
    if (form.dataset.form === "event") await addEvent(data);
    if (form.dataset.form === "edit-event") await editEvent(data);
    if (form.dataset.form === "message") await addMessage(data);
    if (form.dataset.form === "player") await addPlayer(data);
    if (form.dataset.form === "move-player") await movePlayer(data);
    if (form.dataset.form === "edit-player") await editPlayer(data);
    if (form.dataset.form === "edit-coach") await editCoach(data);
    if (form.dataset.form === "edit-venue") await editVenue(data);
    saveState();
    render();
  } catch (error) {
    console.error(error);
    showError(error?.code ? authErrorMessage(error) : "That action could not be completed. Check Firebase permissions and try again.");
  }
});

async function sendPasswordReset(target) {
  if (!backendConfig.enabled) {
    showError("Firebase is not enabled yet. Add the Firebase config before password reset can work.");
    return;
  }
  const form = target.closest("form");
  const email = String(form?.elements?.email?.value || "").trim();
  if (!email) {
    toast("Type your email first, then tap Forgot password");
    return;
  }
  try {
    const runtime = await ensureFirebase();
    await runtime.modules.sendPasswordResetEmail(runtime.auth, email);
    toast("Password reset email sent");
  } catch (error) {
    console.error(error);
    showError(authErrorMessage(error));
  }
}

async function handleParentLogin(data) {
  const parentName = String(data.get("parentName") || "").trim();
  const childName = String(data.get("childName") || "").trim();
  const relation = String(data.get("relation") || "Parent");
  const password = String(data.get("passcode") || "");
  const email = String(data.get("email") || "").trim();

  if (!backendConfig.enabled) {
    showError("Firebase is not enabled yet. Add the Firebase config before parents can sign in.");
    return;
  }

  await handleFirebaseParentLogin({ email, password, parentName, childName, relation });
}

async function handleCoachLogin(data) {
  const password = String(data.get("passcode") || "");
  const email = String(data.get("email") || "").trim();

  if (!backendConfig.enabled) {
    showError("Firebase is not enabled yet. Add the Firebase config before coaches can sign in.");
    return;
  }

  await handleFirebaseCoachLogin(email, password);
}

async function handleFirebaseCoachLogin(email, password) {
  try {
    setBusy("Signing coach in...");
    const runtime = await ensureFirebase();
    const credential = await runtime.modules.signInWithEmailAndPassword(runtime.auth, email, password);
    const profileSnap = await runtime.modules.getDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "users", credential.user.uid));
    const profile = profileSnap.exists() ? profileSnap.data() : {};
    if (!["coach", "admin"].includes(profile.role)) {
      await runtime.modules.signOut(runtime.auth);
      showError("This Firebase account is not approved as a coach.");
      return;
    }
    state.session = {
      loggedIn: true,
      role: "coach",
      userId: credential.user.uid,
      email,
      phone: profile.phone || "",
      parentName: "",
      coachName: profile.name || "Coach",
      selectedPlayerId: "",
      canSwitchPortal: Boolean(profile.canSwitchPortal),
    };
    state.messageReadAt = profile.messageReadAt || "";
    await loadLiveStateFromFirebase();
    await startLiveSubscriptions();
    state.route = "home";
    state.error = "";
    toast("Coach signed in with Firebase");
  } catch (error) {
    console.error(error);
    showError(authErrorMessage(error));
  } finally {
    state.loading = false;
    render();
  }
}

async function handleFirebaseParentLogin({ email, password, parentName, childName, relation }) {
  try {
    setBusy("Signing parent in...");
    const runtime = await ensureFirebase();
    const credential = await signInOrCreateParent(runtime, email, password, parentName);
    const profileSnap = await runtime.modules.getDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "users", credential.user.uid));
    const profile = profileSnap.exists() ? profileSnap.data() : {};
    if (!profileSnap.exists()) {
      await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "users", credential.user.uid), {
        role: "parent",
        name: parentName,
        email,
        consentAcceptedAt: runtime.modules.serverTimestamp(),
        createdAt: runtime.modules.serverTimestamp(),
        updatedAt: runtime.modules.serverTimestamp(),
      }, { merge: true });
      profile.role = "parent";
      profile.name = parentName;
    }
    if (profile.role && profile.role !== "parent") {
      await runtime.modules.signOut(runtime.auth);
      showError("This account is not set up as a parent account.");
      return;
    }

    state.session = {
      loggedIn: true,
      role: "parent",
      userId: credential.user.uid,
      email,
      phone: profile.phone || "",
      parentName: profile.name || parentName,
      coachName: "",
      selectedPlayerId: "",
      canSwitchPortal: Boolean(profile.canSwitchPortal),
    };
    state.messageReadAt = profile.messageReadAt || "";
    await loadLiveStateFromFirebase();

    if (!approvedPlayers().length && childName) {
      await createAccessRequest({ childName, relation, parentName: profile.name || parentName, email });
      await loadLiveStateFromFirebase();
    }

    await startLiveSubscriptions();
    state.route = approvedPlayers().length ? "home" : "access";
    state.error = "";
    toast("Parent signed in with Firebase");
  } catch (error) {
    console.error(error);
    showError(authErrorMessage(error));
  } finally {
    state.loading = false;
    render();
  }
}

async function signInOrCreateParent(runtime, email, password, parentName) {
  try {
    return await runtime.modules.signInWithEmailAndPassword(runtime.auth, email, password);
  } catch (error) {
    if (!["auth/user-not-found", "auth/invalid-credential"].includes(error.code)) throw error;
    const credential = await runtime.modules.createUserWithEmailAndPassword(runtime.auth, email, password);
    await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "users", credential.user.uid), {
      role: "parent",
      name: parentName,
      email,
      consentAcceptedAt: runtime.modules.serverTimestamp(),
      createdAt: runtime.modules.serverTimestamp(),
      updatedAt: runtime.modules.serverTimestamp(),
    }, { merge: true });
    return credential;
  }
}

async function requestAccess(data) {
  await createAccessRequest({
    childName: String(data.get("childName") || "").trim(),
    relation: String(data.get("relation") || "Parent"),
    parentName: state.session.parentName,
    email: state.session.email,
  });
  await loadLiveStateFromFirebase();
  toast("Access request sent");
}

async function updateParentProfile(data) {
  if (!state.session.loggedIn || hasCoachAccess()) return;
  const runtime = await ensureFirebase();
  const parentName = String(data.get("parentName") || "").trim();
  const phone = String(data.get("phone") || "").replace(/\D/g, "");
  if (!parentName) {
    toast("Add your name before saving");
    return;
  }
  await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "users", runtime.user.uid), {
    name: parentName,
    phone,
    email: state.session.email || runtime.user.email || "",
    updatedAt: runtime.modules.serverTimestamp(),
  }, { merge: true });
  state.session.parentName = parentName;
  state.session.phone = phone;
  toast("Contact details saved");
}

async function submitDataRequest(data) {
  if (!state.session.loggedIn || hasCoachAccess()) return;
  const runtime = await ensureFirebase();
  const playerId = String(data.get("playerId") || "");
  const player = approvedPlayers().find((item) => item.id === playerId);
  const childName = player?.name || String(data.get("childName") || "").trim();
  const requestType = String(data.get("requestType") || "delete");
  const details = String(data.get("details") || "").trim();

  if (!childName) {
    toast("Add the child name for the data request");
    return;
  }

  const requestId = `${runtime.user.uid}_${requestType}_${Date.now()}`;
  await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "dataRequests", requestId), {
    parentUid: runtime.user.uid,
    parentName: state.session.parentName || "",
    email: state.session.email || "",
    playerId: player?.id || "",
    playerTeamId: player?.teamId || "",
    childName,
    requestType,
    details,
    status: "pending",
    createdAt: runtime.modules.serverTimestamp(),
    updatedAt: runtime.modules.serverTimestamp(),
  }, { merge: true });
  await loadLiveStateFromFirebase();
  toast("Data request sent");
}

async function createAccessRequest({ childName, relation, parentName, email }) {
  if (!childName) {
    toast("Add the child name for the request");
    return;
  }
  const runtime = await ensureFirebase();
  const normalizedChild = childName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const requestId = `${runtime.user.uid}_${normalizedChild || "child"}_${Date.now()}`;
  await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "accessRequests", requestId), {
    parentUid: runtime.user.uid,
    parentName,
    email,
    childName,
    relation,
    status: "pending",
    consent: true,
    createdAt: runtime.modules.serverTimestamp(),
    updatedAt: runtime.modules.serverTimestamp(),
  }, { merge: true });
}

async function resolveDataRequest(requestId) {
  if (!requireCoach() || !requestId) return;
  const runtime = await ensureFirebase();
  await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "dataRequests", requestId), {
    status: "resolved",
    reviewedBy: state.session.userId,
    reviewedAt: runtime.modules.serverTimestamp(),
    updatedAt: runtime.modules.serverTimestamp(),
  }, { merge: true });
  state.dataRequests = state.dataRequests.map((request) => request.id === requestId ? { ...request, status: "resolved" } : request);
  render();
  toast("Data request marked resolved");
}

async function deleteAccessRequest(requestId) {
  if (!requireCoach() || !requestId) return;
  const confirmed = window.confirm("Delete this parent access request? Use this for old test requests or duplicates.");
  if (!confirmed) return;
  await deleteLiveDocument("accessRequests", requestId);
  state.accessRequests = state.accessRequests.filter((request) => request.id !== requestId);
  render();
  toast("Access request deleted");
}

async function deleteDataRequest(requestId) {
  if (!requireCoach() || !requestId) return;
  const confirmed = window.confirm("Delete this data request? Only remove it after it has been dealt with or if it was test data.");
  if (!confirmed) return;
  await deleteLiveDocument("dataRequests", requestId);
  state.dataRequests = state.dataRequests.filter((request) => request.id !== requestId);
  render();
  toast("Data request deleted");
}

async function changePassword(data) {
  const password = data.get("newPassword");
  const confirm = data.get("confirmPassword");
  if (password !== confirm) {
    toast("Passwords do not match");
    return;
  }
  const runtime = await ensureFirebase();
  await runtime.modules.updatePassword(runtime.auth.currentUser, password);
  await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "users", runtime.auth.currentUser.uid), {
    updatedAt: runtime.modules.serverTimestamp(),
  }, { merge: true });
  toast("Password changed");
}

async function reviewRequest(requestId, status) {
  if (!requireCoach()) return;
  const request = state.accessRequests.find((item) => item.id === requestId);
  if (!request) return;
  const runtime = await ensureFirebase();
  request.status = status;
  if (status === "approved") {
    const selectedPlayerId = $(`[data-request-player="${CSS.escape(requestId)}"]`)?.value || request.playerId;
    const player = activePlayers().find((item) => item.id === selectedPlayerId);
    if (!player) {
      toast("Choose the matching child before approving");
      return;
    }
    const linkId = `${request.parentUid}_${player.id}`;
    const batch = runtime.modules.writeBatch(runtime.db);
    batch.set(runtime.modules.doc(runtime.db, "clubs", clubId, "parentLinks", linkId), {
      parentUid: request.parentUid,
      parentName: request.parentName,
      email: request.email || "",
      playerId: player.id,
      playerTeamId: player.teamId,
      relation: request.relation,
      status: "approved",
      consent: true,
      createdAt: runtime.modules.serverTimestamp(),
      updatedAt: runtime.modules.serverTimestamp(),
    }, { merge: true });
    batch.set(runtime.modules.doc(runtime.db, "clubs", clubId, "accessRequests", requestId), {
      status: "approved",
      playerId: player.id,
      playerTeamId: player.teamId,
      reviewedBy: state.session.userId,
      reviewedAt: runtime.modules.serverTimestamp(),
      updatedAt: runtime.modules.serverTimestamp(),
    }, { merge: true });
    await batch.commit();
  } else {
    await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "accessRequests", requestId), {
      status: "rejected",
      reviewedBy: state.session.userId,
      reviewedAt: runtime.modules.serverTimestamp(),
      updatedAt: runtime.modules.serverTimestamp(),
    }, { merge: true });
  }
  await loadLiveStateFromFirebase();
  toast(`Request ${status}`);
}

async function toggleDualUser(userId, enabled) {
  if (!requireCoach() || !userId) return;
  const runtime = await ensureFirebase();
  await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "users", userId), {
    canSwitchPortal: enabled,
    updatedAt: runtime.modules.serverTimestamp(),
  }, { merge: true });
  state.users = state.users.map((user) => user.id === userId ? { ...user, canSwitchPortal: enabled } : user);
  if (state.session.userId === userId) state.session.canSwitchPortal = enabled;
  render();
  toast(enabled ? "Dual switch enabled" : "Dual switch disabled");
}

function scheduleAvailabilitySave(playerId) {
  clearTimeout(scheduleAvailabilitySave.timer);
  scheduleAvailabilitySave.timer = setTimeout(() => {
    saveAvailability(playerId).catch((error) => {
      console.error(error);
      toast("Availability note could not be saved");
    });
  }, 650);
}

async function saveAvailability(playerId) {
  const entry = defaultAvailabilityEntry(state.availability[state.selectedEventId]?.[playerId]);
  if (!entry) return;
  await saveLiveDocument(`availability/${state.selectedEventId}/players`, playerId, {
    playerId,
    eventId: state.selectedEventId,
    status: entry.status || "unknown",
    note: entry.note || "",
    snacks: Boolean(entry.snacks),
    liftOffer: Boolean(entry.liftOffer),
    liftSeats: Number(entry.liftSeats || 0),
    liftFrom: entry.liftFrom || "",
    updatedBy: state.session.userId,
  });
}

function eventTitle(type, teamId, opponent, venueId) {
  if (type !== "Fixture") return opponent;
  if (opponent.trim().toLowerCase() === "opposition tbc") return `${teamName(teamId)} home match`;
  if (venueId === "away-custom") return `${teamName(teamId)} away to ${opponent}`;
  return `${teamName(teamId)} vs ${opponent}`;
}

function eventVenueFromForm(data) {
  const venueId = data.get("venueId");
  const selectedVenue = venueById(venueId);
  const customVenue = String(data.get("customVenue") || "").trim();
  const customAddress = String(data.get("customAddress") || "").trim();
  return venueId === "away-custom"
    ? {
      id: "away-custom",
      name: customVenue || "Away destination",
      address: customAddress || "Address to be confirmed",
    }
    : selectedVenue;
}

function eventDataFromForm(data, id = uid("event")) {
  const type = data.get("type");
  const teamId = data.get("teamId");
  const opponent = String(data.get("opponent") || "").trim();
  const venue = eventVenueFromForm(data);
  return {
    id,
    type,
    teamId,
    title: eventTitle(type, teamId, opponent, venue.id),
    opponent: type === "Fixture" ? opponent : "",
    datetime: combineDateTime(data.get("date"), data.get("startTime")),
    finishTime: data.get("finishTime"),
    venue: venue.name,
    venueId: venue.id,
    address: venue.address,
    parkingAddress: venue.parkingAddress || "",
    meetTime: data.get("meetTime"),
    kit: type === "Fixture" ? data.get("kit") : "",
    homeScore: type === "Fixture" ? String(data.get("homeScore") || "").trim() : "",
    awayScore: type === "Fixture" ? String(data.get("awayScore") || "").trim() : "",
    resultNotes: type === "Fixture" ? String(data.get("resultNotes") || "").trim() : "",
    notes: data.get("notes"),
  };
}

function syncEventRoster(event) {
  state.availability[event.id] = state.availability[event.id] || {};
  state.attendance[event.id] = state.attendance[event.id] || {};
  getPlayersForEvent(event).forEach((player) => {
    state.availability[event.id][player.id] = defaultAvailabilityEntry(state.availability[event.id][player.id]);
    state.attendance[event.id][player.id] = state.attendance[event.id][player.id] || "unknown";
  });
}

async function addEvent(data) {
  if (!requireCoach()) return;
  const event = eventDataFromForm(data);
  await saveLiveDocument("events", event.id, event);
  state.events.push(event);
  syncEventRoster(event);
  state.selectedEventId = event.id;
  delete state.modal;
  toast("Event added");
}

async function editEvent(data) {
  if (!requireCoach()) return;
  const eventId = data.get("eventId");
  const index = state.events.findIndex((event) => event.id === eventId);
  if (index === -1) return;
  const nextEvent = eventDataFromForm(data, eventId);
  await saveLiveDocument("events", eventId, nextEvent);
  state.events[index] = nextEvent;
  syncEventRoster(nextEvent);
  state.selectedEventId = eventId;
  delete state.modal;
  toast("Event updated");
}

async function setAttendance(playerId, status) {
  if (!requireCoach()) return;
  state.attendance[state.selectedEventId] = state.attendance[state.selectedEventId] || {};
  await saveLiveDocument(`attendance/${state.selectedEventId}/players`, playerId, {
    playerId,
    eventId: state.selectedEventId,
    status,
    markedBy: state.session.coachName || "Coach",
    markedByUid: state.session.userId,
  });
  state.attendance[state.selectedEventId][playerId] = status;
  saveState();
  render();
  toast(["present", "collected"].includes(status) ? "Attendance updated and parent push queued" : "Attendance updated");
}

async function deleteEvent(eventId) {
  if (!requireCoach()) return;
  const event = state.events.find((item) => item.id === eventId);
  if (!event) return;

  const confirmed = window.confirm(`Remove "${event.title}"? This will also remove its availability and attendance marks.`);
  if (!confirmed) return;

  await deleteEventLive(eventId);
  state.events = state.events.filter((item) => item.id !== eventId);
  delete state.availability[eventId];
  delete state.attendance[eventId];

  if (state.selectedEventId === eventId) {
    state.selectedEventId = state.events[0]?.id || "";
  }

  saveState();
  render();
  toast("Event removed");
}

async function addMessage(data) {
  if (!requireCoach()) return;
  const message = {
    id: uid("msg"),
    title: data.get("title"),
    body: data.get("body"),
    teamId: data.get("teamId"),
    createdBy: state.session.userId,
  };
  await saveLiveDocument("announcements", message.id, message);
  state.messages.unshift(message);
  delete state.modal;
  toast("Message sent");
}

async function addPlayer(data) {
  if (!requireCoach()) return;
  const player = {
    id: uid("player"),
    name: data.get("name"),
    teamId: data.get("teamId"),
    role: data.get("role"),
    parentName: data.get("parentName"),
    parentPhone: data.get("parentPhone"),
    status: "active",
  };
  await saveLiveDocument("players", player.id, player);
  state.players.push(player);
  state.events.forEach((event) => {
    if (event.teamId === "all" || event.teamId === player.teamId) {
      state.availability[event.id][player.id] = defaultAvailabilityEntry();
      state.attendance[event.id][player.id] = "unknown";
    }
  });
  delete state.modal;
  toast("Player added");
}

async function movePlayer(data) {
  if (!requireCoach()) return;
  const player = activePlayers().find((item) => item.id === data.get("playerId"));
  if (!player) return;
  const updated = { ...player, teamId: data.get("teamId") };
  await saveLiveDocument("players", player.id, updated);
  Object.assign(player, updated);
  delete state.modal;
  toast("Player moved");
}

async function editPlayer(data) {
  if (!requireCoach()) return;
  const player = activePlayers().find((item) => item.id === data.get("playerId"));
  if (!player) return;
  const updated = {
    ...player,
    name: data.get("name"),
    teamId: data.get("teamId"),
    role: data.get("role"),
    parentName: data.get("parentName"),
    parentPhone: data.get("parentPhone"),
  };
  await saveLiveDocument("players", player.id, updated);
  Object.assign(player, updated);
  delete state.modal;
  toast("Player updated");
}

async function editCoach(data) {
  if (!requireCoach()) return;
  const coachId = String(data.get("coachId") || "").trim();
  if (!coachId) return;
  const updated = {
    id: coachId,
    name: String(data.get("name") || "").trim(),
    teamId: String(data.get("teamId") || "all"),
    role: String(data.get("role") || "Coach").trim(),
    phone: String(data.get("phone") || "").replace(/\D/g, ""),
    email: String(data.get("email") || "").trim(),
  };
  await saveLiveDocument("coachContacts", coachId, updated);
  state.coachContacts = [
    ...state.coachContacts.filter((coach) => coach.id !== coachId),
    updated,
  ];
  delete state.modal;
  toast("Coach contact saved");
}

async function editVenue(data) {
  if (!requireCoach()) return;
  const venueId = String(data.get("venueId") || "").trim();
  if (!venueId) return;
  const updated = {
    id: venueId,
    name: String(data.get("name") || "").trim(),
    address: String(data.get("address") || "").trim(),
    parkingAddress: String(data.get("parkingAddress") || "").trim(),
    surface: String(data.get("surface") || "").trim(),
    notes: String(data.get("notes") || "").trim(),
    pitchImage: String(data.get("pitchImage") || "").trim(),
    parkingImage: String(data.get("parkingImage") || "").trim(),
  };
  await saveLiveDocument("venues", venueId, updated);
  state.venues = [
    ...state.venues.filter((venue) => venue.id !== venueId),
    updated,
  ];
  delete state.modal;
  toast("Venue saved");
}

async function ensureFirebase() {
  if (!backendConfig.enabled) {
    throw new Error("Firebase config is not enabled yet.");
  }
  if (firebaseRuntime.ready) return firebaseRuntime;

  const [
    appModule,
    authModule,
    firestoreModule,
    messagingModule,
  ] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js"),
  ]);

  firebaseRuntime.modules = {
    ...appModule,
    ...authModule,
    ...firestoreModule,
    ...messagingModule,
  };
  firebaseRuntime.app = appModule.initializeApp(backendConfig.firebaseConfig);
  firebaseRuntime.auth = authModule.getAuth(firebaseRuntime.app);
  firebaseRuntime.db = firestoreModule.getFirestore(firebaseRuntime.app);
  firebaseRuntime.messaging = messagingModule.isSupported && await messagingModule.isSupported()
    ? messagingModule.getMessaging(firebaseRuntime.app)
    : null;
  firebaseRuntime.user = firebaseRuntime.auth.currentUser;
  authModule.onAuthStateChanged(firebaseRuntime.auth, (user) => {
    firebaseRuntime.user = user;
  });
  firebaseRuntime.ready = true;
  return firebaseRuntime;
}

function isFirebaseSignedIn() {
  return backendConfig.enabled && firebaseRuntime.ready && Boolean(firebaseRuntime.user);
}

async function liveCollection(name) {
  const runtime = await ensureFirebase();
  return runtime.modules.collection(runtime.db, "clubs", clubId, name);
}

async function liveDoc(collectionName, id) {
  const runtime = await ensureFirebase();
  return runtime.modules.doc(runtime.db, "clubs", clubId, collectionName, id);
}

async function loadDocs(collectionName) {
  const runtime = await ensureFirebase();
  const snapshot = await runtime.modules.getDocs(await liveCollection(collectionName));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

async function loadLiveStateFromFirebase() {
  if (!isFirebaseSignedIn()) return;
  try {
    const runtime = await ensureFirebase();
    const role = state.session.role;
    const [squadDocs, teamDocs, events, announcements, venueDocs, coachContactDocs] = await Promise.all([
      loadDocs("squads"),
      loadDocs("teams"),
      loadDocs("events"),
      loadDocs("announcements"),
      loadDocs("venues"),
      loadDocs("coachContacts"),
    ]);

    const squadSource = squadDocs.length ? squadDocs : teamDocs;
    state.teams = squadSource.length ? squadSource.sort((a, b) => (a.order || 0) - (b.order || 0)) : teams;
    liveTeams = state.teams;
    state.events = events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    state.messages = announcements.sort(sortByCreatedAtDesc);
    state.venues = venueDocs;
    state.coachContacts = coachContactDocs;

    if (hasCoachAccess(role)) {
      const [players, parentLinks, accessRequests, notifications, users, dataRequests] = await Promise.all([
        loadDocs("players"),
        loadDocs("parentLinks"),
        loadDocs("accessRequests"),
        loadDocs("notifications"),
        loadDocs("users"),
        loadDocs("dataRequests"),
      ]);
      state.players = players.sort((a, b) => a.name.localeCompare(b.name));
      state.parentLinks = parentLinks;
      state.accessRequests = accessRequests.sort(sortByCreatedAtDesc);
      state.notifications = notifications.sort(sortByCreatedAtDesc);
      state.users = users;
      state.dataRequests = dataRequests.sort(sortByCreatedAtDesc);
    } else {
      const uid = runtime.user.uid;
      const [parentLinks, accessRequests, notifications, dataRequests] = await Promise.all([
        loadDocsWhere("parentLinks", "parentUid", "==", uid),
        loadDocsWhere("accessRequests", "parentUid", "==", uid),
        loadDocsWhere("notifications", "userId", "==", uid),
        loadDocsWhere("dataRequests", "parentUid", "==", uid),
      ]);
      state.parentLinks = parentLinks;
      state.accessRequests = accessRequests.sort(sortByCreatedAtDesc);
      state.notifications = notifications.sort(sortByCreatedAtDesc);
      state.dataRequests = dataRequests.sort(sortByCreatedAtDesc);
      state.players = await loadApprovedPlayerDocs(parentLinks);
    }

    await loadEventSubcollections();
    if (!state.selectedEventId || !state.events.some((event) => event.id === state.selectedEventId)) {
      state.selectedEventId = state.events[0]?.id || "";
    }
    if (state.session.role === "parent" && !state.session.selectedPlayerId) {
      state.session.selectedPlayerId = approvedPlayers()[0]?.id || "";
    }
  } catch (error) {
    console.error(error);
    showError("Live Firestore data could not be loaded. Check the rules, seed data and account role.");
  }
}

function sortByCreatedAtDesc(a, b) {
  const left = a.createdAt?.seconds || Date.parse(a.createdAt || "") / 1000 || 0;
  const right = b.createdAt?.seconds || Date.parse(b.createdAt || "") / 1000 || 0;
  return right - left;
}

async function loadDocsWhere(collectionName, field, operator, value) {
  const runtime = await ensureFirebase();
  const queryRef = runtime.modules.query(await liveCollection(collectionName), runtime.modules.where(field, operator, value));
  const snapshot = await runtime.modules.getDocs(queryRef);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

async function loadApprovedPlayerDocs(parentLinks) {
  const runtime = await ensureFirebase();
  const approved = parentLinks.filter((link) => link.status === "approved");
  const docs = await Promise.all(approved.map((link) => runtime.modules.getDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "players", link.playerId))));
  return docs.filter((snap) => snap.exists()).map((snap) => ({ id: snap.id, ...snap.data() })).sort((a, b) => a.name.localeCompare(b.name));
}

async function loadEventSubcollections() {
  const runtime = await ensureFirebase();
    const approvedIds = approvedPlayers().map((player) => player.id);
  state.availability = {};
  state.attendance = {};

  await Promise.all(state.events.map(async (event) => {
    const availabilityCollection = runtime.modules.collection(runtime.db, "clubs", clubId, "availability", event.id, "players");
    const attendanceCollection = runtime.modules.collection(runtime.db, "clubs", clubId, "attendance", event.id, "players");
    const approvedChunks = chunkArray(approvedIds, 10);
    const [availabilitySnap, attendanceSnap] = await Promise.all([
      getEventPlayerDocs(runtime, availabilityCollection, approvedChunks),
      getEventPlayerDocs(runtime, attendanceCollection, approvedChunks),
    ]);

    state.availability[event.id] = {};
    availabilitySnap.forEach((docSnap) => {
      const data = docSnap.data();
      state.availability[event.id][data.playerId || docSnap.id] = data;
    });

    state.attendance[event.id] = {};
    attendanceSnap.forEach((docSnap) => {
      const data = docSnap.data();
      state.attendance[event.id][data.playerId || docSnap.id] = data.status || "unknown";
    });
  }));
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function getEventPlayerDocs(runtime, collectionRef, approvedChunks) {
  if (hasCoachAccess()) {
    const snapshot = await runtime.modules.getDocs(collectionRef);
    return snapshot.docs;
  }
  if (!approvedChunks.length) return [];
  const snapshots = await Promise.all(approvedChunks.map((chunk) => runtime.modules.getDocs(
    runtime.modules.query(collectionRef, runtime.modules.where("playerId", "in", chunk)),
  )));
  return snapshots.flatMap((snapshot) => snapshot.docs);
}

function clearLiveSubscriptions() {
  liveUnsubscribers.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch {}
  });
  eventDataUnsubscribers.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch {}
  });
  liveUnsubscribers = [];
  eventDataUnsubscribers = [];
}

function clearEventDataSubscriptions() {
  eventDataUnsubscribers.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch {}
  });
  eventDataUnsubscribers = [];
}

async function startLiveSubscriptions() {
  if (!isFirebaseSignedIn()) return;
  clearLiveSubscriptions();
  const runtime = await ensureFirebase();
  const watchCollection = (collectionName, apply) => {
    const unsubscribe = runtime.modules.onSnapshot(
      runtime.modules.collection(runtime.db, "clubs", clubId, collectionName),
      (snapshot) => {
        Promise.resolve(apply(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))).then(render).catch(console.error);
      },
      (error) => console.error(error),
    );
    liveUnsubscribers.push(unsubscribe);
  };
  const watchQuery = (queryRef, apply) => {
    const unsubscribe = runtime.modules.onSnapshot(
      queryRef,
      (snapshot) => {
        Promise.resolve(apply(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))).then(render).catch(console.error);
      },
      (error) => console.error(error),
    );
    liveUnsubscribers.push(unsubscribe);
  };

  watchCollection("announcements", (items) => {
    state.messages = items.sort(sortByCreatedAtDesc);
  });
  watchCollection("squads", (items) => {
    if (!items.length) return;
    state.teams = items.sort((a, b) => (a.order || 0) - (b.order || 0));
    liveTeams = state.teams;
  });
  watchCollection("events", async (items) => {
    state.events = items.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    if (!state.selectedEventId || !state.events.some((event) => event.id === state.selectedEventId)) {
      state.selectedEventId = state.events[0]?.id || "";
    }
    await loadEventSubcollections();
    startEventDataSubscriptions(runtime);
  });
  watchCollection("venues", (items) => {
    state.venues = items;
  });
  watchCollection("coachContacts", (items) => {
    state.coachContacts = items;
  });

  if (hasCoachAccess()) {
    watchCollection("players", (items) => {
      state.players = items.sort((a, b) => a.name.localeCompare(b.name));
    });
    watchCollection("accessRequests", (items) => {
      state.accessRequests = items.sort(sortByCreatedAtDesc);
    });
    watchCollection("parentLinks", (items) => {
      state.parentLinks = items;
    });
    watchCollection("notifications", (items) => {
      state.notifications = items.sort(sortByCreatedAtDesc);
    });
    watchCollection("users", (items) => {
      state.users = items;
      const current = items.find((item) => item.id === state.session.userId);
      if (current) state.session.canSwitchPortal = Boolean(current.canSwitchPortal);
    });
    watchCollection("dataRequests", (items) => {
      state.dataRequests = items.sort(sortByCreatedAtDesc);
    });
  } else {
    const uid = state.session.userId;
    watchQuery(runtime.modules.query(
      runtime.modules.collection(runtime.db, "clubs", clubId, "notifications"),
      runtime.modules.where("userId", "==", uid),
    ), (items) => {
      state.notifications = items.sort(sortByCreatedAtDesc);
    });
    watchQuery(runtime.modules.query(
      runtime.modules.collection(runtime.db, "clubs", clubId, "accessRequests"),
      runtime.modules.where("parentUid", "==", uid),
    ), (items) => {
      state.accessRequests = items.sort(sortByCreatedAtDesc);
    });
    watchQuery(runtime.modules.query(
      runtime.modules.collection(runtime.db, "clubs", clubId, "dataRequests"),
      runtime.modules.where("parentUid", "==", uid),
    ), (items) => {
      state.dataRequests = items.sort(sortByCreatedAtDesc);
    });
    watchQuery(runtime.modules.query(
      runtime.modules.collection(runtime.db, "clubs", clubId, "parentLinks"),
      runtime.modules.where("parentUid", "==", uid),
    ), async (items) => {
      state.parentLinks = items;
      state.players = await loadApprovedPlayerDocs(items);
      if (!state.session.selectedPlayerId) state.session.selectedPlayerId = approvedPlayers()[0]?.id || "";
    });
  }

  startEventDataSubscriptions(runtime);
}

function startEventDataSubscriptions(runtime) {
  clearEventDataSubscriptions();
  const approvedIds = approvedPlayers().map((player) => player.id);
  const approvedChunks = chunkArray(approvedIds, 10);
  const canReadAll = hasCoachAccess();

  state.events.forEach((event) => {
    const availabilityRef = runtime.modules.collection(runtime.db, "clubs", clubId, "availability", event.id, "players");
    const attendanceRef = runtime.modules.collection(runtime.db, "clubs", clubId, "attendance", event.id, "players");

    const watchPlayerCollection = (collectionRef, applyDocs) => {
      if (canReadAll) {
        const unsubscribe = runtime.modules.onSnapshot(
          collectionRef,
          (snapshot) => applyDocs(snapshot.docs),
          (error) => console.error(error),
        );
        eventDataUnsubscribers.push(unsubscribe);
        return;
      }
      approvedChunks.forEach((chunk) => {
        const unsubscribe = runtime.modules.onSnapshot(
          runtime.modules.query(collectionRef, runtime.modules.where("playerId", "in", chunk)),
          (snapshot) => applyDocs(snapshot.docs),
          (error) => console.error(error),
        );
        eventDataUnsubscribers.push(unsubscribe);
      });
    };

    watchPlayerCollection(
      availabilityRef,
      (snapshot) => {
        state.availability[event.id] = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          state.availability[event.id][data.playerId || docSnap.id] = data;
        });
        render();
      },
    );
    watchPlayerCollection(
      attendanceRef,
      (snapshot) => {
        state.attendance[event.id] = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          state.attendance[event.id][data.playerId || docSnap.id] = data.status || "unknown";
        });
        render();
      },
    );
  });
}

async function saveLiveDocument(collectionName, id, data) {
  if (!isFirebaseSignedIn()) return;
  try {
    const runtime = await ensureFirebase();
    const payload = {
      ...data,
      updatedAt: runtime.modules.serverTimestamp(),
    };
    if (!data.createdAt) payload.createdAt = runtime.modules.serverTimestamp();
    await runtime.modules.setDoc(await liveDoc(collectionName, id), payload, { merge: true });
  } catch (error) {
    console.error(error);
    showError("Firestore save failed. Check this user has permission for that action.");
    throw error;
  }
}

async function deleteLiveDocument(collectionName, id) {
  if (!isFirebaseSignedIn()) return;
  try {
    const runtime = await ensureFirebase();
    await runtime.modules.deleteDoc(await liveDoc(collectionName, id));
  } catch (error) {
    console.error(error);
    showError("Firestore delete failed. Check this user has permission for that action.");
    throw error;
  }
}

async function deleteEventLive(eventId) {
  const runtime = await ensureFirebase();
  const batch = runtime.modules.writeBatch(runtime.db);
  const eventRef = runtime.modules.doc(runtime.db, "clubs", clubId, "events", eventId);
  const [availabilitySnap, attendanceSnap] = await Promise.all([
    runtime.modules.getDocs(runtime.modules.collection(runtime.db, "clubs", clubId, "availability", eventId, "players")),
    runtime.modules.getDocs(runtime.modules.collection(runtime.db, "clubs", clubId, "attendance", eventId, "players")),
  ]);
  availabilitySnap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
  attendanceSnap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
  batch.delete(eventRef);
  await batch.commit();
}

async function enablePushNotifications() {
  if (isNativeCapacitor()) {
    await enableNativePushNotifications();
    return;
  }

  if (!backendConfig.enabled) {
    toast("Add Firebase config before push testing");
    return;
  }
  if (!("Notification" in window)) {
    toast("This browser does not support push notifications");
    return;
  }

  try {
    const runtime = await ensureFirebase();
    if (!runtime.messaging) {
      toast("Firebase messaging is not supported in this browser");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast("Push permission was not granted");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const token = await runtime.modules.getToken(runtime.messaging, {
      vapidKey: backendConfig.vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!token) {
      toast("No push token returned");
      return;
    }

    await savePushToken(token, "web");
    toast("Push enabled on this device");
  } catch (error) {
    console.error(error);
    toast("Push setup needs Firebase details");
  }
}

function isNativeCapacitor() {
  return Boolean(window.Capacitor?.isNativePlatform?.() && window.Capacitor?.Plugins?.PushNotifications);
}

async function enableNativePushNotifications() {
  try {
    const PushNotifications = window.Capacitor.Plugins.PushNotifications;
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== "granted") {
      toast("Push permission was not granted");
      return;
    }

    await PushNotifications.addListener("registration", async (token) => {
      await savePushToken(token.value, "capacitor");
      toast("Push enabled on this phone");
    });
    await PushNotifications.addListener("registrationError", () => {
      toast("Phone push registration failed");
    });
    await PushNotifications.addListener("pushNotificationReceived", (notification) => {
      toast(notification.title || "Largs Colts update");
    });
    await PushNotifications.register();
  } catch (error) {
    console.error(error);
    toast("Native push setup needs the Capacitor push plugin");
  }
}

async function savePushToken(token, platform) {
  if (!token) return;
  const runtime = await ensureFirebase();
  if (!runtime.user) return;
  await runtime.modules.setDoc(
    runtime.modules.doc(runtime.db, "clubs", clubId, "notificationTokens", `${runtime.user.uid}_${token.slice(-18)}`),
    {
      token,
      platform,
      userId: runtime.user.uid,
      role: state.session.role || "unknown",
      updatedAt: runtime.modules.serverTimestamp(),
    },
    { merge: true },
  );
}

async function signOutLive(nextAuthRole = "parent") {
  try {
    clearLiveSubscriptions();
    const runtime = await ensureFirebase();
    await runtime.modules.signOut(runtime.auth);
  } catch (error) {
    console.error(error);
  }
  state = loadState();
  state.loading = false;
  state.route = "home";
  state.authRole = nextAuthRole;
  render();
  toast(nextAuthRole === "coach" ? "Ready for coach sign in" : "Ready for parent sign in");
}

async function bootApp() {
  render();
  if (!backendConfig.enabled) {
    state.loading = false;
    state.error = "Firebase is not enabled. Add your config before testing real accounts.";
    render();
    return;
  }

  try {
    const runtime = await ensureFirebase();
    runtime.modules.onAuthStateChanged(runtime.auth, async (user) => {
      if (!user) {
        clearLiveSubscriptions();
        state = loadState();
        state.loading = false;
        render();
        return;
      }

      state.loading = true;
      render();
      try {
        const profileSnap = await runtime.modules.getDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "users", user.uid));
        const profile = profileSnap.exists() ? profileSnap.data() : {};
        const role = profile.role || "parent";
        state.session = {
          loggedIn: true,
          role,
          userId: user.uid,
          email: user.email || "",
          phone: profile.phone || "",
          parentName: role === "parent" ? profile.name || user.email || "Parent" : "",
          coachName: ["coach", "admin"].includes(role) ? profile.name || "Coach" : "",
          selectedPlayerId: state.session.selectedPlayerId || "",
          canSwitchPortal: Boolean(profile.canSwitchPortal),
        };
        state.messageReadAt = profile.messageReadAt || "";
        state.route = ["coach", "admin"].includes(role) ? state.route || "home" : state.route || "home";
        if (role === "admin") state.session.role = "coach";
        await loadLiveStateFromFirebase();
        await startLiveSubscriptions();
        state.loading = false;
        state.error = "";
        render();
      } catch (error) {
        console.error(error);
        showError("Could not load this Firebase account. Check the user role document.");
      }
    });
  } catch (error) {
    console.error(error);
    showError("Firebase could not start. Check firebase-config.js and the enabled Firebase services.");
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied");
  } catch {
    toast("Copy failed. Select the link and copy it manually.");
  }
}

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}

bootApp();
