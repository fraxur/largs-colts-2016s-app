const storageKey = "largs-colts-2016s-coach-test-4";
const appVersion = "3.7";
const crestPath = "assets/LargsColtsCrest.png";

const teams = [
  { id: "orange", name: "Orange", colour: "#f97316" },
  { id: "blue", name: "Blue", colour: "#2563eb" },
  { id: "yellow", name: "Yellow", colour: "#eab308" },
];

const coaches = [
  { id: "carl", name: "Carl", teamId: "all", role: "Coach", phone: "07999696043", email: "" },
  { id: "faroque", name: "Faroque", teamId: "all", role: "Coach", phone: "07791199936", email: "" },
  { id: "ed", name: "Ed", teamId: "all", role: "Coach", phone: "07818480627", email: "" },
  { id: "martin", name: "Martin", teamId: "all", role: "Coach", phone: "07904718672", email: "" },
  { id: "gordy", name: "Gordy", teamId: "all", role: "Coach", phone: "07984645328", email: "" },
];

const venues = [
  {
    id: "bowencraig",
    name: "Bowencraig (Home pitch)",
    address: "Bowencraig, Largs",
  },
  {
    id: "inverclyde-3g",
    name: "Inverclyde Sports Centre 3G",
    address: "Burnside Road, Largs KA30 8RW",
  },
  {
    id: "barrfields",
    name: "Barrfields Park",
    address: "Barrfields Park, Greenock Road, Largs",
  },
  {
    id: "away-custom",
    name: "Away destination",
    address: "Address to be confirmed",
  },
];

const kitOptions = ["Home kit", "Away kit"];
const leavers = ["Caleb", "Robyn", "Alexander", "Harry Smith"];
const placeholderParent = "Parent Placeholder";
const placeholderPhone = "07000 000000";

const defaultPlayers = [
  player("p1", "Arthur Atkinson", "orange"),
  player("p2", "Harry Riley", "orange"),
  player("p3", "Jacob Hussain", "orange"),
  player("p4", "Harris Beckwith", "orange"),
  player("p5", "Jack Rossiter", "orange"),
  player("p6", "Jack Craig", "orange"),
  player("p7", "Murphy Auld", "orange"),
  player("p8", "Oscar McGarvey", "orange"),
  player("p9", "Fraser Clark", "orange"),
  player("p10", "Grace Blacklock", "blue"),
  player("p11", "Muir Balmforth", "blue"),
  player("p12", "Leo Lazzerini", "blue"),
  player("p13", "Kammy Cassidy", "blue"),
  player("p14", "Brooklyn Fraser", "blue"),
  player("p15", "Logan Fraser", "blue"),
  player("p16", "Luke Dowds", "blue"),
  player("p17", "Teddy Holland", "blue"),
  player("p18", "Gianluca Greenwood", "blue"),
  player("p19", "Luke McCready", "yellow"),
  player("p20", "Ethan Maguire", "yellow"),
  player("p21", "Brice Fergusson", "yellow"),
  player("p22", "Luke McGowan", "yellow"),
  player("p23", "Ethan Hughes", "yellow"),
  player("p24", "Harris Jardine", "yellow"),
  player("p25", "Lucas Reilly", "yellow"),
  player("p26", "Jacob McShane", "yellow"),
];

function player(id, name, teamId) {
  return {
    id,
    name,
    teamId,
    role: "Player",
    parentName: placeholderParent,
    parentPhone: placeholderPhone,
    status: "active",
  };
}

const defaultEvents = [
  {
    ...fixture("e1", "blue", "Opposition TBC", "2026-05-16T09:30", "10:45", "Bowencraig (Home pitch)", "bowencraig", "09:00", "Home kit", "Home match. Report for 9:00am."),
    title: "Blue home match",
  },
  {
    ...fixture("e2", "yellow", "Bellfield", "2026-05-16T10:00", "11:15", "Bellfield Estate", "away-custom", "09:30", "Away kit", "Grass pitch. Please report for 9:30am."),
    title: "Yellow away to Bellfield",
    address: "Bellfield Estate, Kilmarnock KA1 3XG",
  },
  training("t1", "all", "Training", "2026-05-19T18:00", "Bowencraig (Home pitch)", "bowencraig"),
  training("t2", "all", "Training", "2026-05-20T18:00", "Bowencraig (Home pitch)", "bowencraig"),
  training("t3", "all", "Training", "2026-05-26T18:00", "Bowencraig (Home pitch)", "bowencraig"),
  training("t4", "all", "Training", "2026-05-27T18:00", "Bowencraig (Home pitch)", "bowencraig"),
];

function fixture(id, teamId, opponent, datetime, finishTime, venue, venueId, meetTime, kit, notes) {
  return {
    id,
    type: "Fixture",
    teamId,
    title: `${teamName(teamId)} vs ${opponent}`,
    opponent,
    datetime,
    finishTime,
    venue,
    venueId,
    meetTime,
    kit,
    notes,
  };
}

function training(id, teamId, title, datetime, venue, venueId) {
  return {
    id,
    type: "Training",
    teamId,
    title,
    opponent: "",
    datetime,
    finishTime: "19:30",
    venue,
    venueId,
    meetTime: "",
    kit: "",
    notes: "18:00-19:30. All teams. Bring boots, water and shin pads.",
  };
}

const defaultState = {
  session: {
    loggedIn: false,
    role: "parent",
    parentName: "",
    coachName: "",
    selectedPlayerId: "p1",
    demoMode: false,
  },
  route: "home",
  authRole: "parent",
  scheduleFilter: "all",
  selectedEventId: "e1",
  coachGuide: {
    active: false,
    step: 0,
    completed: false,
  },
  players: defaultPlayers,
  inactivePlayers: leavers.map((name, index) => ({
    id: `left-${index + 1}`,
    name,
    teamId: "left",
    role: "Left club",
    status: "left",
  })),
  parentLinks: [
    {
      id: "link-placeholder-arthur",
      parentName: placeholderParent,
      playerId: "p1",
      relation: "Parent",
      status: "approved",
      consent: true,
      createdAt: "2026-05-01",
    },
  ],
  parentAccounts: [
    {
      parentName: placeholderParent,
      phone: placeholderPhone,
      password: "parent2016",
      temporaryPassword: "",
      mustChangePassword: false,
      status: "active",
      updatedAt: "2026-05-01",
    },
  ],
  accessRequests: [
    {
      id: "req-sarah-finlay",
      parentName: placeholderParent,
      playerId: "p13",
      relation: "Parent",
      status: "pending",
      temporaryPassword: "",
      expiresAt: "",
      createdAt: "2026-05-13",
    },
  ],
  events: defaultEvents,
  availability: {
    e1: {
      p10: { status: "available", note: "" },
      p13: { status: "unknown", note: "" },
      p16: { status: "available", note: "" },
      p18: { status: "unknown", note: "" },
    },
    e2: {
      p19: { status: "available", note: "" },
      p22: { status: "available", note: "" },
      p26: { status: "unknown", note: "" },
    },
    t1: {},
    t2: {},
  },
  attendance: {
    t1: {
      p1: "present",
      p2: "present",
      p3: "present",
      p4: "present",
      p5: "present",
      p6: "present",
      p7: "present",
      p8: "absent",
      p9: "present",
      p10: "present",
      p11: "present",
      p12: "present",
      p13: "absent",
      p14: "present",
      p15: "present",
      p16: "present",
      p17: "present",
      p18: "unknown",
      p19: "present",
      p20: "present",
      p21: "present",
      p22: "present",
      p23: "absent",
      p24: "present",
      p25: "present",
      p26: "unknown",
    },
  },
  parentAlerts: [],
  messages: [
    {
      id: "m1",
      title: "Weekend fixtures confirmed",
      body: "Please check your child's team fixture and mark availability by Thursday evening.",
      teamId: "all",
      createdAt: "Today",
    },
    {
      id: "m2",
      title: "New app test build",
      body: "Parents can now test login, verification, fixtures, availability and team messages in one place.",
      teamId: "all",
      createdAt: "Today",
    },
  ],
};

const coachGuideSteps = [
  {
    route: "home",
    target: "dashboard-next",
    title: "Coach demo start",
    body: "This walkthrough is only shown in coach demo mode. The dashboard starts with the next event: Blue home match, Saturday 16 May, kick-off 09:30, report 09:00 at Bowencraig.",
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
    body: "This is where a coach marks players present, absent or collected. Present and collected also log the parent email/app notification that would be sent in the live system.",
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
    route: "access",
    target: "access-queue",
    title: "Parent verification",
    body: "This is the safeguarding gate. A parent requests access to a child, a coach approves it, and the app generates a temporary password for the parent to change.",
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
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved ? normalizeState(saved) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function normalizeState(saved) {
  const merged = {
    ...structuredClone(defaultState),
    ...saved,
    session: { ...defaultState.session, ...(saved.session || {}) },
  };

  const names = new Set((merged.players || []).map((player) => player.name));
  defaultPlayers.forEach((player) => {
    if (!names.has(player.name)) merged.players.push(player);
  });
  merged.players = merged.players.filter((player) => !leavers.includes(player.name));

  merged.inactivePlayers = defaultState.inactivePlayers;
  merged.events = merged.events?.length ? merged.events : defaultEvents;
  merged.selectedEventId = merged.selectedEventId || merged.events[0].id;
  if (!merged.events.some((event) => event.id === merged.selectedEventId)) {
    merged.selectedEventId = merged.events[0]?.id || "";
  }
  merged.scheduleFilter = merged.scheduleFilter || "all";
  merged.parentAccounts = merged.parentAccounts?.length ? merged.parentAccounts : defaultState.parentAccounts;
  merged.parentAlerts = merged.parentAlerts || [];
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
    merged.availability[event.id] = merged.availability[event.id] || {};
    getPlayersForEvent(event, merged.players).forEach((player) => {
      merged.availability[event.id][player.id] = merged.availability[event.id][player.id] || {
        status: "unknown",
        note: "",
      };
    });
    merged.attendance[event.id] = merged.attendance[event.id] || {};
  });

  return merged;
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

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

function approvedLinks(parentName = state.session.parentName) {
  return state.parentLinks.filter(
    (link) => sameName(link.parentName, parentName) && link.status === "approved",
  );
}

function pendingRequests(parentName = state.session.parentName) {
  return state.accessRequests.filter(
    (request) => sameName(request.parentName, parentName) && request.status === "pending",
  );
}

function approvedPlayers(parentName = state.session.parentName) {
  const ids = new Set(approvedLinks(parentName).map((link) => link.playerId));
  return activePlayers().filter((player) => ids.has(player.id));
}

function sameName(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

function teamById(teamId) {
  if (teamId === "all") return { id: "all", name: "All teams", colour: "#850008" };
  return teams.find((team) => team.id === teamId) || teams[0];
}

function teamName(teamId) {
  return teamById(teamId).name;
}

function venueById(venueId) {
  return venues.find((venue) => venue.id === venueId) || venues[0];
}

function venueIdFromName(name = "") {
  const normalized = name.toLowerCase();
  return venues.find((venue) => venue.name.toLowerCase() === normalized)?.id || "away-custom";
}

function eventVenue(event) {
  if (event.venueId === "away-custom" || event.address) {
    return {
      id: event.venueId || "away-custom",
      name: event.venue || "Away destination",
      address: event.address || "Address to be confirmed",
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

function generateTemporaryPassword() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const pick = (pool, count) => Array.from({ length: count }, () => pool[Math.floor(Math.random() * pool.length)]).join("");
  return `LC-${pick(letters, 3)}${pick(numbers, 3)}`;
}

function temporaryPasswordExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().slice(0, 10);
}

function parentAccount(parentName) {
  return state.parentAccounts.find((account) => sameName(account.parentName, parentName));
}

function upsertParentAccount(parentName, phone = placeholderPhone, temporaryPassword = "") {
  let account = parentAccount(parentName);
  if (!account) {
    account = {
      parentName,
      phone,
      password: "",
      temporaryPassword,
      mustChangePassword: Boolean(temporaryPassword),
      status: "active",
      updatedAt: "Today",
    };
    state.parentAccounts.push(account);
  } else if (temporaryPassword) {
    account.temporaryPassword = temporaryPassword;
    account.mustChangePassword = true;
    account.updatedAt = "Today";
  }
  return account;
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

function dateTile(value) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date),
  };
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
      const entry = state.availability[eventId]?.[player.id];
      const status = entry?.status || "unknown";
      acc[status] += 1;
      return acc;
    },
    { available: 0, unavailable: 0, unknown: 0 },
  );
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

function isCoachDemo() {
  return state.session.loggedIn && state.session.role === "coach" && state.session.demoMode;
}

function currentCoachGuideStep() {
  return coachGuideSteps[state.coachGuide?.step || 0] || coachGuideSteps[0];
}

function applyCoachGuideStep() {
  if (!isCoachDemo() || !state.coachGuide?.active) return;
  const step = currentCoachGuideStep();
  state.route = step.route;
  if (step.eventId) state.selectedEventId = step.eventId;
  if (step.route === "schedule") state.scheduleFilter = "all";
}

function updateCoachGuide(direction) {
  if (!isCoachDemo()) return;
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
  if (!isCoachDemo()) return "";
  return `<button class="secondary-button guide-start-button" type="button" data-action="coach-guide-restart">${state.coachGuide.active ? "Restart walkthrough" : "Start walkthrough"}</button>`;
}

function coachGuideView() {
  if (!isCoachDemo() || !state.coachGuide?.active) return "";
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
  if (!isCoachDemo() || !state.coachGuide?.active) return;
  const target = currentCoachGuideStep().target;
  const node = target ? document.querySelector(`[data-tour="${target}"]`) : null;
  if (!node) return;
  node.classList.add("coach-guide-highlight");
  node.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

function render() {
  applyCoachGuideStep();
  const app = $("#app");
  if (!state.session.loggedIn) {
    app.innerHTML = authView();
  } else {
    app.innerHTML = shellView();
  }
  bindFormDefaults();
  highlightCoachGuideTarget();
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
      </section>
    </main>
  `;
}

function parentLoginView() {
  return `
    <form class="auth-form" data-form="parent-login">
      <label>
        <span>Parent name</span>
        <input name="parentName" autocomplete="name" required placeholder="Parent Placeholder">
      </label>
      <label>
        <span>Child</span>
        <select name="playerId">
          ${activePlayers().map((player) => `<option value="${player.id}">${escapeHtml(player.name)} - ${teamName(player.teamId)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Relationship</span>
        <select name="relation">
          <option>Parent</option>
          <option>Guardian</option>
          <option>Carer</option>
        </select>
      </label>
      <label>
        <span>Passcode</span>
        <input name="passcode" type="password" autocomplete="current-password" placeholder="parent2016 or temporary password" required>
      </label>
      <label class="check-row">
        <input name="consent" type="checkbox" required>
        <span>I agree this prototype stores test child information on this device.</span>
      </label>
      <div class="auth-actions">
        <button class="primary-button" type="submit">Continue</button>
        <button class="secondary-button" type="button" data-action="demo-parent">Use parent demo</button>
      </div>
    </form>
  `;
}

function coachLoginView() {
  return `
    <form class="auth-form" data-form="coach-login">
      <label>
        <span>Coach name</span>
        <input name="coachName" autocomplete="name" required placeholder="Coach">
      </label>
      <label>
        <span>Coach passcode</span>
        <input name="passcode" type="password" autocomplete="current-password" placeholder="coach2016" required>
      </label>
      <div class="auth-actions">
        <button class="primary-button" type="submit">Sign in</button>
        <button class="secondary-button" type="button" data-action="demo-coach">Use guided coach demo</button>
      </div>
      <p class="demo-build-note">Build ${appVersion} includes the coach walkthrough pop-ups.</p>
    </form>
  `;
}

function shellView() {
  const pendingOnly = state.session.role === "parent" && !approvedPlayers().length;
  const route = pendingOnly && !["access", "install"].includes(state.route) ? "access" : state.route;
  const routes = navRoutes(pendingOnly);
  const child = currentPlayer();

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
            <p class="eyebrow">${state.session.role === "coach" ? "Coach portal" : "Parent portal"}</p>
            <h1>${pageTitle(route)}</h1>
          </div>
          <div class="topbar-actions">
            ${state.session.role === "parent" && approvedPlayers().length ? childSelector(child) : ""}
            ${coachGuideButton()}
            <button class="notification-button" type="button" data-route-target="messages" aria-label="Messages">
              <span>${state.messages.length}</span>
            </button>
          </div>
        </header>

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

function navRoutes(pendingOnly = false) {
  const base = [
    { id: "home", label: "Home" },
    { id: "schedule", label: "Schedule" },
    { id: "availability", label: "Availability" },
    { id: "attendance", label: "Attendance" },
    { id: "squads", label: "Teams" },
    { id: "messages", label: "Messages" },
    { id: "coaches", label: "Coaches" },
    { id: "access", label: "Access" },
    { id: "install", label: "Install" },
  ];
  return pendingOnly ? base.filter((item) => ["access", "install"].includes(item.id)) : base;
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
    access: "Access",
    install: "Mobile Test",
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
  if (pendingOnly && route !== "install") return accessView();
  return {
    home: homeView,
    schedule: scheduleView,
    availability: availabilityView,
    attendance: attendanceView,
    squads: squadsView,
    messages: messagesView,
    coaches: coachesView,
    access: accessView,
    install: installView,
  }[route]?.() || homeView();
}

function homeView() {
  const next = state.events
    .filter((event) => new Date(event.datetime) >= startOfToday())
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))[0] || state.events[0];
  const child = currentPlayer();
  const counts = availabilityCounts(next.id);

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
      <article><strong>${activePlayers().length}</strong><span>Active players</span></article>
      <article><strong>${counts.available}</strong><span>Available next event</span></article>
      <article><strong>${averageAttendance()}%</strong><span>Attendance average</span></article>
      <article><strong>${state.accessRequests.filter((request) => request.status === "pending").length}</strong><span>Pending requests</span></article>
    </section>

    <section class="content-grid two-col">
      ${state.session.role === "parent" && child ? linkedChildCard(child) : coachOverviewCard()}
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
        <button type="button" data-route-target="access">Verify parents</button>
        <button type="button" data-route-target="attendance">Take attendance</button>
      </div>
    </article>
  `;
}

function messageCard() {
  return `
    <article class="panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Latest update</p>
          <h3>${escapeHtml(state.messages[0]?.title || "No messages")}</h3>
        </div>
        ${state.session.role === "coach" ? '<button class="icon-button" type="button" data-modal="message">+</button>' : ""}
      </div>
      <p class="muted">${escapeHtml(state.messages[0]?.body || "")}</p>
    </article>
  `;
}

function scheduleView() {
  const visibleEvents = state.events
    .filter((event) => state.scheduleFilter === "all" || event.teamId === state.scheduleFilter || event.teamId === "all")
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  return `
    <section class="toolbar" data-tour="schedule-toolbar">
      <div class="segmented light">
        ${["all", ...teams.map((team) => team.id)].map((id) => `
          <button type="button" class="${state.scheduleFilter === id ? "active" : ""}" data-action="set-schedule-filter" data-team-id="${id}">
            ${id === "all" ? "All" : teamName(id)}
          </button>
        `).join("")}
      </div>
      ${state.session.role === "coach" ? '<button class="primary-button" type="button" data-modal="event">Add fixture/training</button>' : ""}
    </section>
    ${isCoachDemo() ? '<aside class="coach-demo-hint" data-tour="away-support">Away destination adds venue name and address fields, so map buttons still work for places like Bellfield Estate.</aside>' : ""}
    <div class="event-list" data-tour="event-list">
      ${visibleEvents.map(eventCard).join("")}
    </div>
  `;
}

function eventCard(event) {
  const tile = dateTile(event.datetime);
  const counts = availabilityCounts(event.id);
  const venue = eventVenue(event);
  const coachActions = state.session.role === "coach"
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
          <span class="team-pill ${event.teamId}">${teamName(event.teamId)}</span>
        </div>
        <p>${formatDate(event.datetime)}${event.finishTime ? ` to ${escapeHtml(event.finishTime)}` : ""} at ${escapeHtml(venue.name)}</p>
        <p>${escapeHtml(venue.address)}${event.meetTime ? ` - Report ${escapeHtml(event.meetTime)}` : ""}</p>
        <div class="mini-stats">
          <span>${counts.available} available</span>
          <span>${counts.unavailable} unavailable</span>
          <span>${counts.unknown} no reply</span>
          ${event.kit ? `<span>${escapeHtml(event.kit)}</span>` : ""}
          ${event.notes ? `<span>${escapeHtml(event.notes)}</span>` : ""}
        </div>
      </div>
      <div class="event-actions">
        <button class="secondary-button" type="button" data-action="focus-event" data-event-id="${event.id}">Open</button>
        <a class="secondary-link" href="${mapsUrl(venue.address)}" target="_blank" rel="noreferrer">Google Maps</a>
        <a class="secondary-link" href="${mapsAppleUrl(venue.address)}" target="_blank" rel="noreferrer">Apple Maps</a>
        <button class="secondary-button" type="button" data-action="copy-link" data-copy="${escapeHtml(venue.address)}">Copy address</button>
        ${coachActions}
      </div>
    </article>
  `;
}

function availabilityView() {
  const event = state.events.find((item) => item.id === state.selectedEventId) || state.events[0];
  if (!event) return emptyEventsView("Availability");
  const players = getPlayersForEvent(event);
  const counts = availabilityCounts(event.id);
  const child = currentPlayer();
  const childInEvent = child && players.some((player) => player.id === child.id);

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
      </div>
    </section>

    <section class="content-grid ${state.session.role === "coach" ? "" : "two-col"}">
      ${state.session.role === "parent" ? parentAvailabilityCard(event, child, childInEvent) : ""}
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
  const entry = state.availability[event.id]?.[child?.id] || { status: "unknown", note: "" };
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
      <p class="muted">${formatDate(event.datetime)}${event.finishTime ? ` to ${escapeHtml(event.finishTime)}` : ""} at ${escapeHtml(event.venue)}</p>
      ${event.kit ? `<p class="muted">${escapeHtml(event.kit)}</p>` : ""}
      <p class="muted">${escapeHtml(venue.address)}</p>
      <div class="choice-row">
        <a class="secondary-link" href="${mapsUrl(venue.address)}" target="_blank" rel="noreferrer">Google Maps</a>
        <a class="secondary-link" href="${mapsAppleUrl(venue.address)}" target="_blank" rel="noreferrer">Apple Maps</a>
        <button class="secondary-button" type="button" data-action="copy-link" data-copy="${escapeHtml(venue.address)}">Copy address</button>
      </div>
      <div class="choice-row">
        <button class="available-button" type="button" data-action="set-availability" data-status="available">Available</button>
        <button class="unavailable-button" type="button" data-action="set-availability" data-status="unavailable">Unavailable</button>
      </div>
      <label class="field">
        <span>Note to coach</span>
        <textarea rows="4" data-action="availability-note" placeholder="Anything the coach should know">${escapeHtml(entry.note)}</textarea>
      </label>
    </article>
  `;
}

function responseRow(event, player) {
  const entry = state.availability[event.id]?.[player.id] || { status: "unknown", note: "" };
  return `
    <div class="person-row">
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <p>${teamName(player.teamId)} - ${escapeHtml(player.role)}${entry.note ? ` - ${escapeHtml(entry.note)}` : ""}</p>
      </div>
      <span class="status-pill ${statusClass(entry.status)}">${statusText(entry.status)}</span>
    </div>
  `;
}

function attendanceView() {
  const event = state.events.find((item) => item.id === state.selectedEventId) || state.events[0];
  if (!event) return emptyEventsView("Attendance");
  const players = state.session.role === "coach" ? getPlayersForEvent(event) : [currentPlayer()].filter(Boolean);

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
    ${state.session.role === "coach" ? parentAlertLog(event) : ""}
  `;
}

function emptyEventsView(title) {
  return `
    <section class="panel">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <h3>No events yet</h3>
      <p class="muted">Add a fixture or training session before using this page.</p>
      ${state.session.role === "coach" ? '<button class="primary-button" type="button" data-modal="event">Add fixture/training</button>' : ""}
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
      ${state.session.role === "coach" ? `
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
  const alerts = (state.parentAlerts || []).filter((alert) => alert.eventId === event.id).slice(0, 8);
  return `
    <article class="panel parent-alert-log">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Parent alerts</p>
          <h3>Email and app notification log</h3>
        </div>
        <span class="status-pill warn">Demo send</span>
      </div>
      <p class="muted">This GitHub demo logs the alert that would be sent. Real email and push delivery needs the secure backend.</p>
      ${alerts.length ? alerts.map((alert) => `
        <div class="person-row compact">
          <div>
            <strong>${escapeHtml(alert.title)}</strong>
            <p>${escapeHtml(alert.body)}</p>
          </div>
          <span class="status-pill good">${escapeHtml(alert.sentAt)}</span>
        </div>
      `).join("") : '<p class="muted">No parent alerts sent for this session yet.</p>'}
    </article>
  `;
}

function squadsView() {
  return `
    <section class="toolbar" data-tour="squad-actions">
      ${state.session.role === "coach" ? '<button class="primary-button" type="button" data-modal="player">Add player</button>' : ""}
    </section>
    <div class="team-board" data-tour="team-board">
      ${teams.map(teamColumn).join("")}
      <article class="team-column">
        <div class="panel-title">
          <h3>Left club</h3>
          <span class="status-pill bad">${state.inactivePlayers.length}</span>
        </div>
        ${state.inactivePlayers.map((player) => `<div class="person-row compact"><strong>${escapeHtml(player.name)}</strong><span>Inactive</span></div>`).join("")}
      </article>
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
            ${state.session.role === "coach" ? `<p>${escapeHtml(player.parentName)} - ${escapeHtml(player.parentPhone)}</p>` : ""}
          </div>
          ${state.session.role === "coach" ? `
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
  const visible = state.messages.filter((message) => {
    if (state.session.role === "coach") return true;
    const child = currentPlayer();
    return message.teamId === "all" || message.teamId === child?.teamId;
  });
  const child = currentPlayer();
  const parentAlerts = state.session.role === "parent" && child
    ? (state.parentAlerts || []).filter((alert) => alert.playerId === child.id)
    : [];

  return `
    <section class="toolbar" data-tour="message-actions">
      <div></div>
      ${state.session.role === "coach" ? '<button class="primary-button" type="button" data-modal="message">New message</button>' : ""}
    </section>
    <div class="message-list" data-tour="messages-panel">
      ${parentAlerts.map((alert) => `
        <article class="message-card parent-alert-message">
          <div class="panel-title">
            <div>
              <p class="eyebrow">Attendance alert - ${escapeHtml(alert.sentAt)}</p>
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
              <p class="eyebrow">${escapeHtml(message.createdAt)} - ${teamName(message.teamId)}</p>
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
          ${coaches.map(coachCard).join("")}
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
        </div>
      </div>
    </article>
  `;
}

function formatPhone(phone) {
  return phone.replace(/^(\d{5})(\d{3})(\d{3})$/, "$1 $2 $3");
}

function phoneHref(phone) {
  return `+44${phone.replace(/^0/, "")}`;
}

function accessView() {
  return state.session.role === "coach" ? coachAccessView() : parentAccessView();
}

function parentAccessView() {
  const approved = approvedLinks();
  const pending = pendingRequests();
  const account = parentAccount(state.session.parentName);
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
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Account security</p>
            <h3>${account?.mustChangePassword ? "Change temporary password" : "Password"}</h3>
          </div>
          <span class="status-pill ${account?.mustChangePassword ? "warn" : "good"}">${account?.mustChangePassword ? "Required" : "Set"}</span>
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
            <span>Child</span>
            <select name="playerId">
              ${activePlayers().map((player) => `<option value="${player.id}">${escapeHtml(player.name)} - ${teamName(player.teamId)}</option>`).join("")}
            </select>
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

function accessLinkRow(link) {
  const player = activePlayers().find((item) => item.id === link.playerId);
  return `
    <div class="person-row">
      <div>
        <strong>${escapeHtml(player?.name || "Unknown child")}</strong>
        <p>${escapeHtml(link.relation)} - ${teamName(player?.teamId)}</p>
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
        <strong>${escapeHtml(player?.name || "Unknown child")}</strong>
        <p>${escapeHtml(request.relation)}</p>
      </div>
      <span class="status-pill warn">Pending</span>
    </div>
  `;
}

function coachAccessView() {
  const requests = state.accessRequests;
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
          <span>Coach approves the request and the app creates a temporary password.</span>
          <span>Coach sends the temporary password to the parent.</span>
          <span>Parent signs in and changes the password.</span>
        </div>
      </article>
    </section>
  `;
}

function coachRequestRow(request) {
  const player = activePlayers().find((item) => item.id === request.playerId);
  const tempPassword = request.temporaryPassword || "";
  return `
    <div class="person-row">
      <div>
        <strong>${escapeHtml(request.parentName)}</strong>
        <p>${escapeHtml(player?.name || "Unknown child")} - ${escapeHtml(request.relation)}</p>
        ${tempPassword ? `<p>Temporary password: <strong>${escapeHtml(tempPassword)}</strong> expires ${escapeHtml(request.expiresAt)}</p>` : ""}
      </div>
      <div class="inline-actions">
        <span class="status-pill ${statusClass(request.status)}">${statusText(request.status)}</span>
        ${request.status === "pending" ? `
          <button class="tiny-button approve" type="button" data-action="review-request" data-request-id="${request.id}" data-status="approved">Approve</button>
          <button class="tiny-button reject" type="button" data-action="review-request" data-request-id="${request.id}" data-status="rejected">Reject</button>
        ` : ""}
        ${tempPassword ? `<button class="tiny-button" type="button" data-action="copy-link" data-copy="${escapeHtml(tempPassword)}">Copy password</button>` : ""}
      </div>
    </div>
  `;
}

function installView() {
  const appUrl = `${window.location.origin}${window.location.pathname}`;
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
            <p class="eyebrow">Release status</p>
            <h3>Parent test build</h3>
          </div>
        </div>
        <div class="check-list">
          <span>Exact club crest loaded</span>
          <span>Parent login and child verification mocked</span>
          <span>Coach approval generates a temporary parent password</span>
          <span>Parents can change temporary passwords</span>
          <span>Coach approval queue working</span>
          <span>Full roster with placeholder parent contacts loaded</span>
          <span>Blue and Yellow weekend fixtures loaded</span>
          <span>Tuesday and Wednesday training loaded</span>
          <span>Home, 3G, Barrfields and typed away venues loaded</span>
          <span>Google Maps and Apple Maps buttons added</span>
          <span>Coach contacts added with call and text links</span>
          <span>Offline app shell enabled after HTTPS upload</span>
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
  if (type === "message") return messageModal();
  if (type === "player") return playerModal();
  if (type === "move-player") return movePlayerModal(state.modal.playerId);
  if (type === "edit-player") return editPlayerModal(state.modal.playerId);
  return "";
}

function eventModal(eventId = "") {
  const event = state.events.find((item) => item.id === eventId);
  const editing = Boolean(event);
  const venue = event ? eventVenue(event) : venues[0];
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
  return `
    <p class="eyebrow">Coach action</p>
    <h2 id="modal-title">${editing ? "Edit fixture/training" : "Add fixture/training"}</h2>
    <form class="stacked-form" data-form="${editing ? "edit-event" : "event"}">
      ${editing ? `<input type="hidden" name="eventId" value="${escapeHtml(event.id)}">` : ""}
      <label class="field"><span>Type</span><select name="type"><option ${type === "Fixture" ? "selected" : ""}>Fixture</option><option ${type === "Training" ? "selected" : ""}>Training</option></select></label>
      <label class="field"><span>Team</span><select name="teamId"><option value="all" ${teamId === "all" ? "selected" : ""}>All teams</option>${teams.map((team) => `<option value="${team.id}" ${team.id === teamId ? "selected" : ""}>${team.name}</option>`).join("")}</select></label>
      <label class="field"><span>Opponent or title</span><input name="opponent" required value="${escapeHtml(opponent)}" placeholder="Kilwinning Rangers"></label>
      <label class="field"><span>Date</span><input name="date" type="date" required value="${escapeHtml(date)}"></label>
      <label class="field"><span>Start time</span><select name="startTime">${timeOptions(startTime)}</select></label>
      <label class="field"><span>Finish time</span><select name="finishTime">${timeOptions(finishTime)}</select></label>
      <label class="field"><span>Report time</span><select name="meetTime">${timeOptions(meetTime, true)}</select></label>
      <label class="field"><span>Kit</span><select name="kit">${kitOptions.map((option) => `<option value="${option}" ${option === kit ? "selected" : ""}>${option}</option>`).join("")}</select></label>
      <label class="field"><span>Venue</span><select name="venueId" data-action="venue-choice">${venues.map((item) => `<option value="${item.id}" ${item.id === selectedVenueId ? "selected" : ""}>${item.name}</option>`).join("")}</select></label>
      <div class="away-fields" data-away-fields ${isAway ? "" : "hidden"}>
        <label class="field"><span>Away venue name</span><input name="customVenue" value="${escapeHtml(isAway ? venue.name : "")}" placeholder="Bellfield Estate"></label>
        <label class="field"><span>Away address</span><input name="customAddress" value="${escapeHtml(isAway ? venue.address : "")}" placeholder="Bellfield Estate, Kilmarnock KA1 3XG"></label>
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

function bindFormDefaults() {
  const parentName = $('[name="parentName"]');
  if (parentName && !parentName.value) parentName.value = placeholderParent;
  toggleAwayFields();
}

function toggleAwayFields() {
  const venueChoice = $('[data-action="venue-choice"]');
  const awayFields = $('[data-away-fields]');
  if (!venueChoice || !awayFields) return;
  awayFields.hidden = venueChoice.value !== "away-custom";
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action], [data-route], [data-route-target], [data-modal]");
  if (!target) return;

  const backdropClick = event.target.classList.contains("modal-backdrop");
  const action = target.dataset.action;

  if (target.dataset.route) {
    event.preventDefault();
    state.route = target.dataset.route;
    saveState();
    render();
    return;
  }

  if (target.dataset.routeTarget) {
    state.route = target.dataset.routeTarget;
    saveState();
    render();
    return;
  }

  if (target.dataset.modal) {
    state.modal = { type: target.dataset.modal, playerId: target.dataset.playerId, eventId: target.dataset.eventId };
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

  if (action === "demo-parent") {
    state.session = { loggedIn: true, role: "parent", parentName: placeholderParent, coachName: "", selectedPlayerId: "p1", demoMode: false };
    state.route = "home";
    saveState();
    render();
    return;
  }

  if (action === "demo-coach") {
    state.session = { loggedIn: true, role: "coach", parentName: "", coachName: "Coach", selectedPlayerId: "", demoMode: true };
    state.coachGuide = { active: true, step: 0, completed: false };
    applyCoachGuideStep();
    saveState();
    render();
    return;
  }

  if (action === "sign-out") {
    state.session = { ...defaultState.session };
    state.route = "home";
    saveState();
    render();
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

  if (action === "focus-event") {
    state.selectedEventId = target.dataset.eventId;
    state.route = "availability";
    saveState();
    render();
    return;
  }

  if (action === "delete-event") {
    deleteEvent(target.dataset.eventId);
    return;
  }

  if (action === "set-availability") {
    const child = currentPlayer();
    if (child) {
      state.availability[state.selectedEventId][child.id] = {
        ...(state.availability[state.selectedEventId][child.id] || {}),
        status: target.dataset.status,
      };
      saveState();
      render();
      toast("Availability saved");
    }
    return;
  }

  if (action === "set-attendance") {
    setAttendance(target.dataset.playerId, target.dataset.status);
    return;
  }

  if (action === "review-request") {
    reviewRequest(target.dataset.requestId, target.dataset.status);
    saveState();
    render();
    return;
  }

  if (action === "copy-link") {
    copyText(target.dataset.copy);
    return;
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.dataset.action === "select-child") {
    state.session.selectedPlayerId = target.value;
    saveState();
    render();
  }
  if (target.dataset.action === "select-event") {
    state.selectedEventId = target.value;
    saveState();
    render();
  }
  if (target.dataset.action === "venue-choice") {
    toggleAwayFields();
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.dataset.action === "availability-note") {
    const child = currentPlayer();
    if (!child) return;
    state.availability[state.selectedEventId][child.id] = {
      ...(state.availability[state.selectedEventId][child.id] || { status: "unknown" }),
      note: target.value,
    };
    saveState();
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);

  if (form.dataset.form === "parent-login") handleParentLogin(data);
  if (form.dataset.form === "coach-login") handleCoachLogin(data);
  if (form.dataset.form === "request-access") requestAccess(data);
  if (form.dataset.form === "change-password") changePassword(data);
  if (form.dataset.form === "event") addEvent(data);
  if (form.dataset.form === "edit-event") editEvent(data);
  if (form.dataset.form === "message") addMessage(data);
  if (form.dataset.form === "player") addPlayer(data);
  if (form.dataset.form === "move-player") movePlayer(data);
  if (form.dataset.form === "edit-player") editPlayer(data);

  saveState();
  render();
});

function handleParentLogin(data) {
  const parentName = data.get("parentName").trim();
  const playerId = data.get("playerId");
  const relation = data.get("relation");
  const passcode = data.get("passcode");
  const existingLink = state.parentLinks.find(
    (link) => sameName(link.parentName, parentName) && link.playerId === playerId && link.status === "approved",
  );

  if (!existingLink) {
    state.session = { loggedIn: true, role: "parent", parentName, coachName: "", selectedPlayerId: playerId, demoMode: false };
    ensureRequest(parentName, playerId, relation);
    state.route = "access";
    toast("Access request sent to coaches");
  } else {
    const account = parentAccount(parentName) || upsertParentAccount(parentName);
    const accepted = passcode === account.password || passcode === account.temporaryPassword;
    if (!accepted) {
      toast("Use the current password or coach-issued temporary password");
      return;
    }
    if (passcode === account.temporaryPassword) account.mustChangePassword = true;
    state.session = { loggedIn: true, role: "parent", parentName, coachName: "", selectedPlayerId: playerId, demoMode: false };
    state.route = "home";
    toast("Signed in");
  }
}

function handleCoachLogin(data) {
  const passcode = data.get("passcode");
  if (passcode !== "coach2016") {
    toast("Coach passcode is coach2016 for this test build");
    return;
  }
  state.session = {
    loggedIn: true,
    role: "coach",
    parentName: "",
    coachName: data.get("coachName").trim(),
    selectedPlayerId: "",
    demoMode: false,
  };
  state.route = "home";
  toast("Coach signed in");
}

function ensureRequest(parentName, playerId, relation) {
  const existing = state.accessRequests.find(
    (request) => sameName(request.parentName, parentName) && request.playerId === playerId && request.status === "pending",
  );
  if (!existing) {
    state.accessRequests.unshift({
      id: uid("req"),
      parentName,
      playerId,
      relation,
      status: "pending",
      createdAt: "Today",
    });
  }
}

function requestAccess(data) {
  ensureRequest(state.session.parentName, data.get("playerId"), data.get("relation"));
  toast("Access request sent");
}

function changePassword(data) {
  const password = data.get("newPassword");
  const confirm = data.get("confirmPassword");
  if (password !== confirm) {
    toast("Passwords do not match");
    return;
  }
  const account = upsertParentAccount(state.session.parentName);
  account.password = password;
  account.temporaryPassword = "";
  account.mustChangePassword = false;
  account.updatedAt = "Today";
  toast("Password changed");
}

function reviewRequest(requestId, status) {
  const request = state.accessRequests.find((item) => item.id === requestId);
  if (!request) return;
  request.status = status;
  if (status === "approved") {
    const tempPassword = generateTemporaryPassword();
    request.temporaryPassword = tempPassword;
    request.expiresAt = temporaryPasswordExpiry();
    upsertParentAccount(request.parentName, placeholderPhone, tempPassword);
    const exists = state.parentLinks.some(
      (link) => sameName(link.parentName, request.parentName) && link.playerId === request.playerId,
    );
    if (!exists) {
      state.parentLinks.push({
        id: uid("link"),
        parentName: request.parentName,
        playerId: request.playerId,
        relation: request.relation,
        status: "approved",
        consent: true,
        createdAt: "Today",
      });
    }
  }
  toast(`Request ${status}`);
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
    meetTime: data.get("meetTime"),
    kit: type === "Fixture" ? data.get("kit") : "",
    notes: data.get("notes"),
  };
}

function syncEventRoster(event) {
  state.availability[event.id] = state.availability[event.id] || {};
  state.attendance[event.id] = state.attendance[event.id] || {};
  getPlayersForEvent(event).forEach((player) => {
    state.availability[event.id][player.id] = state.availability[event.id][player.id] || { status: "unknown", note: "" };
    state.attendance[event.id][player.id] = state.attendance[event.id][player.id] || "unknown";
  });
}

function addEvent(data) {
  const event = eventDataFromForm(data);
  state.events.push(event);
  syncEventRoster(event);
  state.selectedEventId = event.id;
  delete state.modal;
  toast("Event added");
}

function editEvent(data) {
  const eventId = data.get("eventId");
  const index = state.events.findIndex((event) => event.id === eventId);
  if (index === -1) return;
  state.events[index] = eventDataFromForm(data, eventId);
  syncEventRoster(state.events[index]);
  state.selectedEventId = eventId;
  delete state.modal;
  toast("Event updated");
}

function setAttendance(playerId, status) {
  state.attendance[state.selectedEventId] = state.attendance[state.selectedEventId] || {};
  const previous = state.attendance[state.selectedEventId][playerId];
  state.attendance[state.selectedEventId][playerId] = status;
  if (previous !== status && ["present", "collected"].includes(status)) {
    queueParentAlert(playerId, state.selectedEventId, status);
  }
  saveState();
  render();
  toast(["present", "collected"].includes(status) ? "Attendance updated and parent alert logged" : "Attendance updated");
}

function queueParentAlert(playerId, eventId, status) {
  const player = activePlayers().find((item) => item.id === playerId);
  const event = state.events.find((item) => item.id === eventId);
  if (!player || !event) return;
  const actionText = status === "present"
    ? `${player.name} has been marked present. We have the child at ${event.title}.`
    : `${player.name} has been marked collected from ${event.title}.`;
  state.parentAlerts = state.parentAlerts || [];
  state.parentAlerts.unshift({
    id: uid("alert"),
    playerId,
    eventId,
    status,
    parentName: player.parentName,
    parentPhone: player.parentPhone,
    title: status === "present" ? `${player.name} checked in` : `${player.name} collected`,
    body: `Demo email + app notification to ${player.parentName}: ${actionText}`,
    sentAt: "Just now",
  });
}

function deleteEvent(eventId) {
  if (state.session.role !== "coach") return;
  const event = state.events.find((item) => item.id === eventId);
  if (!event) return;

  const confirmed = window.confirm(`Remove "${event.title}"? This will also remove its availability and attendance marks.`);
  if (!confirmed) return;

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

function addMessage(data) {
  state.messages.unshift({
    id: uid("msg"),
    title: data.get("title"),
    body: data.get("body"),
    teamId: data.get("teamId"),
    createdAt: "Just now",
  });
  delete state.modal;
  toast("Message sent");
}

function addPlayer(data) {
  const player = {
    id: uid("player"),
    name: data.get("name"),
    teamId: data.get("teamId"),
    role: data.get("role"),
    parentName: data.get("parentName"),
    parentPhone: data.get("parentPhone"),
    status: "active",
  };
  state.players.push(player);
  state.events.forEach((event) => {
    if (event.teamId === "all" || event.teamId === player.teamId) {
      state.availability[event.id][player.id] = { status: "unknown", note: "" };
      state.attendance[event.id][player.id] = "unknown";
    }
  });
  delete state.modal;
  toast("Player added");
}

function movePlayer(data) {
  const player = activePlayers().find((item) => item.id === data.get("playerId"));
  if (!player) return;
  player.teamId = data.get("teamId");
  delete state.modal;
  toast("Player moved");
}

function editPlayer(data) {
  const player = activePlayers().find((item) => item.id === data.get("playerId"));
  if (!player) return;
  player.name = data.get("name");
  player.teamId = data.get("teamId");
  player.role = data.get("role");
  player.parentName = data.get("parentName");
  player.parentPhone = data.get("parentPhone");
  delete state.modal;
  toast("Player updated");
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

render();
