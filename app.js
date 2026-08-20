const appVersion = "4.0-live-rollout-22";
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
  storage: null,
  user: null,
};
const clubId = "largs-colts-2016s";
let liveTeams = [];
let liveUnsubscribers = [];
let eventDataUnsubscribers = [];
let builderPointerDrag = null;
let builderArrowDraft = null;
let suppressBuilderClickUntil = 0;

const unassignedTeam = { id: "unassigned", name: "Unassigned", colour: "#6b7280" };
const teams = [
  { id: "team1", name: "Largs Orange", colour: "#f97316" },
  { id: "team2", name: "Largs Blue", colour: "#2563eb" },
];
const legacyTeamIds = new Set(["orange", "blue", "yellow", "", null, undefined]);
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
const developmentLevels = ["Not assessed", "Developmental", "Intermediate", "Advanced"];
const developmentBands = ["Not set", "Low", "Mid", "High"];
const footOptions = ["Not set", "Right", "Left", "Both"];
const allowedDocumentExtensions = [".pdf", ".doc", ".docx"];
const allowedDocumentTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const maxDocumentBytes = 15 * 1024 * 1024;
const playerPositions = [
  "Goalkeeper",
  "Left Back",
  "Centre Back",
  "Right Back",
  "Left Wing Back",
  "Right Wing Back",
  "Defensive Midfielder",
  "Centre Midfield",
  "Attacking Midfielder",
  "Left Winger",
  "Right Winger",
  "Striker",
];
const formationDefinitions = {
  "7": {
    label: "7-a-side",
    slots: [
      { id: "gk", label: "GK", position: "Goalkeeper", x: 50, y: 86 },
      { id: "lb", label: "LB", position: "Left Back", x: 30, y: 66 },
      { id: "rb", label: "RB", position: "Right Back", x: 70, y: 66 },
      { id: "lw", label: "LW", position: "Left Winger", x: 22, y: 40 },
      { id: "cm", label: "CM", position: "Centre Midfield", x: 50, y: 43 },
      { id: "rw", label: "RW", position: "Right Winger", x: 78, y: 40 },
      { id: "st", label: "ST", position: "Striker", x: 50, y: 18 },
    ],
  },
  "9": {
    label: "9-a-side",
    slots: [
      { id: "gk", label: "GK", position: "Goalkeeper", x: 50, y: 88 },
      { id: "lb", label: "LB", position: "Left Back", x: 22, y: 68 },
      { id: "cb", label: "CB", position: "Centre Back", x: 50, y: 70 },
      { id: "rb", label: "RB", position: "Right Back", x: 78, y: 68 },
      { id: "lm", label: "LM", position: "Left Winger", x: 18, y: 44 },
      { id: "cm", label: "CM", position: "Centre Midfield", x: 50, y: 46 },
      { id: "rm", label: "RM", position: "Right Winger", x: 82, y: 44 },
      { id: "am", label: "AM", position: "Attacking Midfielder", x: 50, y: 28 },
      { id: "st", label: "ST", position: "Striker", x: 50, y: 13 },
    ],
  },
};
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
  scheduleType: "matches",
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
  coachQueries: [],
  playerDocuments: [],
  documentFilter: "all",
  documentSort: "newest",
  events: [],
  availability: {},
  attendance: {},
  notifications: [],
  messages: [],
  users: [],
  coachContacts: [],
  venues: [],
  playerDevelopment: {},
  squadListSort: "name",
  squadListPositionFilter: "all",
  squadBuilder: {
    format: "7",
    teamFilter: "all",
    levelFilter: "all",
    selectedPlayerId: "",
    arrowMode: false,
    arrows: {
      "7": [],
      "9": [],
    },
    customSlots: {
      "7": {},
      "9": {},
    },
    selections: {
      "7": {},
      "9": {},
    },
  },
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

function defaultDevelopmentRecord(playerId = "", record = {}) {
  return {
    id: playerId || record.id || "",
    playerId: playerId || record.playerId || record.id || "",
    level: developmentLevels.includes(record.level) ? record.level : "Not assessed",
    band: developmentBands.includes(record.band) ? record.band : "Not set",
    foot: footOptions.includes(record.foot) ? record.foot : "Not set",
    positions: Array.isArray(record.positions) ? record.positions.filter((position) => playerPositions.includes(position)) : [],
    notes: record.notes || "",
  };
}

function developmentFor(playerId) {
  return defaultDevelopmentRecord(playerId, state.playerDevelopment?.[playerId] || {});
}

function developmentLabel(record) {
  const safe = defaultDevelopmentRecord(record.playerId, record);
  if (safe.level === "Not assessed") return "Not assessed";
  return safe.band === "Not set" ? safe.level : `${safe.band} ${safe.level}`;
}

function developmentClass(record) {
  return defaultDevelopmentRecord(record.playerId, record).level.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function developmentScore(record) {
  const safe = defaultDevelopmentRecord(record.playerId, record);
  const levelScore = { "Not assessed": -3, Developmental: 0, Intermediate: 3, Advanced: 6 }[safe.level] ?? -3;
  const bandScore = { "Not set": 0, Low: 0, Mid: 1, High: 2 }[safe.band] ?? 0;
  return levelScore + bandScore;
}

function formationDefinition(format = state.squadBuilder.format) {
  return formationDefinitions[format] || formationDefinitions["7"];
}

function formationSlotOverrides(format = state.squadBuilder.format) {
  state.squadBuilder.customSlots = state.squadBuilder.customSlots || { "7": {}, "9": {} };
  state.squadBuilder.customSlots[format] = state.squadBuilder.customSlots[format] || {};
  return state.squadBuilder.customSlots[format];
}

function shortLabelForPosition(position = "") {
  const labels = {
    Goalkeeper: "GK",
    "Left Back": "LB",
    "Centre Back": "CB",
    "Right Back": "RB",
    "Left Wing Back": "LWB",
    "Right Wing Back": "RWB",
    "Defensive Midfielder": "DM",
    "Centre Midfield": "CM",
    "Attacking Midfielder": "AM",
    "Left Winger": "LW",
    "Right Winger": "RW",
    Striker: "ST",
  };
  return labels[position] || position.split(" ").map((part) => part[0]).join("").slice(0, 4).toUpperCase() || "POS";
}

function pitchPositionFromPoint(x, y) {
  if (y >= 84 && x >= 35 && x <= 65) return "Goalkeeper";
  if (y >= 68) {
    if (x < 38) return "Left Back";
    if (x > 62) return "Right Back";
    return "Centre Back";
  }
  if (y >= 54) {
    if (x < 24) return "Left Wing Back";
    if (x > 76) return "Right Wing Back";
    return "Defensive Midfielder";
  }
  if (y >= 36) {
    if (x < 30) return "Left Winger";
    if (x > 70) return "Right Winger";
    return "Centre Midfield";
  }
  if (y >= 20) {
    if (x < 30) return "Left Winger";
    if (x > 70) return "Right Winger";
    return "Attacking Midfielder";
  }
  if (x < 30) return "Left Winger";
  if (x > 70) return "Right Winger";
  return "Striker";
}

function starterSlots(format = state.squadBuilder.format) {
  const overrides = formationSlotOverrides(format);
  return formationDefinition(format).slots.map((slot) => {
    const custom = overrides[slot.id] || {};
    const x = Number(custom.x);
    const y = Number(custom.y);
    return {
      ...slot,
      ...custom,
      id: slot.id,
      isSub: false,
      position: playerPositions.includes(custom.position) ? custom.position : slot.position,
      label: String(custom.label || slot.label || shortLabelForPosition(custom.position || slot.position)).slice(0, 8),
      x: Number.isFinite(x) ? x : slot.x,
      y: Number.isFinite(y) ? y : slot.y,
    };
  });
}

function substituteSlots() {
  return [
    { id: "sub1", label: "SUB 1", position: "Substitute", isSub: true },
    { id: "sub2", label: "SUB 2", position: "Substitute", isSub: true },
  ];
}

function allBuilderSlots(format = state.squadBuilder.format) {
  return [
    ...starterSlots(format),
    ...substituteSlots(),
  ];
}

function builderSelections(format = state.squadBuilder.format) {
  state.squadBuilder.selections[format] = state.squadBuilder.selections[format] || {};
  return state.squadBuilder.selections[format];
}

function builderArrows(format = state.squadBuilder.format) {
  state.squadBuilder.arrows = state.squadBuilder.arrows || { "7": [], "9": [] };
  state.squadBuilder.arrows[format] = state.squadBuilder.arrows[format] || [];
  return state.squadBuilder.arrows[format];
}

const coachGuideSteps = [
  {
    route: "home",
    target: "dashboard-next",
    title: "Coach walkthrough start",
    body: "The dashboard starts with the next event and gives coaches quick access to fixtures, availability, the register and parent verification.",
  },
  {
    route: "home",
    target: "coach-tools",
    title: "Quick coach actions",
    body: "These four buttons are the main coach shortcuts: add a fixture or training session, send a message, verify parents, and take the register.",
  },
  {
    route: "schedule",
    target: "schedule-toolbar",
    title: "Fixtures and training",
    body: "Use the team filters to show All, Largs Orange or Largs Blue. The add button lets a coach add either a fixture or training session.",
  },
  {
    route: "schedule",
    target: "event-list",
    title: "Fixture cards",
    body: "Fixture cards show kick-off time, report time, venue, map buttons and the Remove button for fixtures that need cleared.",
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
    title: "Register",
    body: "This is where a coach marks players present, absent or collected. Present and collected also log the parent push/in-app notification that would be sent in the live system.",
  },
  {
    route: "squads",
    target: "team-board",
    title: "Teams and squads",
    body: "The team board lists Unassigned, Largs Orange and Largs Blue. Coaches can add a player, edit parent contact placeholders, or move a player when squads are agreed.",
  },
  {
    route: "messages",
    target: "messages-panel",
    title: "Coach messages",
    body: "Messages can go to all parents or a selected team. In the real rollout this area links naturally to push notifications.",
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
    coachQueries: [],
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

  merged.players = (merged.players || [])
    .filter((player) => !leavers.includes(player.name))
    .map(normalizePlayerRecord);
  merged.teams = normalizeLiveTeams(merged.teams?.length ? merged.teams : teams);
  liveTeams = merged.teams;
  merged.events = merged.events || [];
  merged.messages = merged.messages || [];
  merged.notifications = merged.notifications || [];
  merged.dataRequests = merged.dataRequests || [];
  merged.coachQueries = merged.coachQueries || [];
  merged.users = merged.users || [];
  merged.coachContacts = merged.coachContacts || [];
  merged.venues = merged.venues || [];
  merged.playerDevelopment = merged.playerDevelopment || {};
  merged.squadBuilder = {
    ...defaultState.squadBuilder,
    ...(saved.squadBuilder || {}),
    customSlots: {
      ...defaultState.squadBuilder.customSlots,
      ...(saved.squadBuilder?.customSlots || {}),
    },
    arrows: {
      ...defaultState.squadBuilder.arrows,
      ...(saved.squadBuilder?.arrows || {}),
    },
    selections: {
      ...defaultState.squadBuilder.selections,
      ...(saved.squadBuilder?.selections || {}),
    },
  };
  merged.messageReadAt = merged.messageReadAt || "";
  merged.selectedEventId = merged.selectedEventId || merged.events[0]?.id || "";
  if (!merged.events.some((event) => event.id === merged.selectedEventId)) {
    merged.selectedEventId = merged.events[0]?.id || "";
  }
  merged.scheduleFilter = merged.scheduleFilter || "all";
  if (merged.scheduleFilter !== "all" && !eventTeamOptions().some((team) => team.id === merged.scheduleFilter)) {
    merged.scheduleFilter = "all";
  }
  merged.scheduleType = ["matches", "training"].includes(merged.scheduleType) ? merged.scheduleType : "matches";
  merged.schedulePeriod = merged.schedulePeriod || "upcoming";
  merged.coachGuide = {
    ...defaultState.coachGuide,
    ...(saved.coachGuide || {}),
  };
  if (merged.coachGuide.step >= coachGuideSteps.length) {
    merged.coachGuide.step = coachGuideSteps.length - 1;
  }
  merged.squadBuilder.teamFilter = normalizeTeamId(merged.squadBuilder.teamFilter);
  if (!["all", ...filterTeamOptions().map((team) => team.id)].includes(merged.squadBuilder.teamFilter)) merged.squadBuilder.teamFilter = "all";

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

function normalizeTeamId(teamId) {
  if (teamId === "all") return "all";
  if (teams.some((team) => team.id === teamId)) return teamId;
  if (teamId === "unassigned" || legacyTeamIds.has(teamId)) return "unassigned";
  return "unassigned";
}

function normalizeEventTeamId(teamId) {
  if (teamId === "all") return "all";
  if (teams.some((team) => team.id === teamId)) return teamId;
  return "all";
}

function normalizePlayerRecord(player) {
  return {
    ...player,
    teamId: normalizeTeamId(player.teamId),
  };
}

function appTeams() {
  return normalizeLiveTeams(liveTeams);
}

function normalizeLiveTeams(items = []) {
  const liveById = new Map((items || []).filter((team) => teams.some((item) => item.id === team.id)).map((team) => [team.id, team]));
  return teams.map((team) => ({
    ...team,
    ...(liveById.get(team.id) || {}),
    id: team.id,
    name: liveById.get(team.id)?.name || team.name,
    colour: liveById.get(team.id)?.colour || team.colour,
  }));
}

function playerTeamOptions() {
  return [unassignedTeam, ...appTeams()];
}

function eventTeamOptions() {
  return appTeams();
}

function filterTeamOptions() {
  return [unassignedTeam, ...appTeams()];
}

function teamById(teamId) {
  if (teamId === "all") return { id: "all", name: "All teams", colour: "#850008" };
  if (normalizeTeamId(teamId) === "unassigned") return unassignedTeam;
  return appTeams().find((team) => team.id === teamId) || unassignedTeam;
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
  const eventTeamId = normalizeTeamId(event.teamId);
  if (eventTeamId === "all") return players;
  return players.filter((player) => normalizeTeamId(player.teamId) === eventTeamId);
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

function formatDateOnly(value) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
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
  if (event.type === "Free Week") return "No fixture";
  if (event.type !== "Fixture") return "";
  const hasHome = event.homeScore !== "" && event.homeScore != null;
  const hasAway = event.awayScore !== "" && event.awayScore != null;
  if (hasHome && hasAway) return `Result ${event.homeScore}-${event.awayScore}`;
  return isPastEvent(event) ? "Result pending" : "";
}

function eventDateLine(event, venue) {
  if (event.type === "Free Week") return `${formatDateOnly(event.datetime)} - no match scheduled`;
  if (event.timeTbc) return `${formatDateOnly(event.datetime)} - Kick-off TBC at ${escapeHtml(venue.name)}`;
  return `${formatDate(event.datetime)}${event.finishTime ? ` to ${escapeHtml(event.finishTime)}` : ""} at ${escapeHtml(venue.name)}`;
}

function eventPitchLine(event, venue) {
  if (event.type === "Free Week") return "";
  if (event.timeTbc && event.meetTime) return `Pitch: ${escapeHtml(venue.address)} - Report ${escapeHtml(event.meetTime)}`;
  if (event.timeTbc) return `Pitch: ${escapeHtml(venue.address)} - Report TBC`;
  return `Pitch: ${escapeHtml(venue.address)}${event.meetTime ? ` - Report ${escapeHtml(event.meetTime)}` : ""}`;
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
    open: "Open",
    handled: "Handled",
  }[status] || status;
}

function statusClass(status) {
  if (["available", "present", "approved", "collected", "handled"].includes(status)) return "good";
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
  return state.messages.filter((message) => hasCoachAccess() || message.teamId === "all" || normalizeTeamId(message.teamId) === normalizeTeamId(child?.teamId));
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
          <p>Fixtures, availability, register and verified parent access.</p>
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
        ${mobileNav(routes, route)}
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
    { id: "home", label: "Home", mark: "H" },
    { id: "schedule", label: "Schedule", mark: "S" },
    { id: "availability", label: "Availability", mobileLabel: "Avail.", mark: "AV" },
    { id: "attendance", label: "Register", mark: "R" },
    { id: "squads", label: "Teams", mark: "T" },
    { id: "development", label: "Development", mark: "D" },
    { id: "documents", label: "Documents", mobileLabel: "Docs", mark: "DOC" },
    { id: "squad-builder", label: "Whiteboard", mark: "WB" },
    { id: "messages", label: "Messages", mark: "M" },
    { id: "coach-inbox", label: "Inbox", mark: "IN" },
    { id: "coaches", label: "Coaches", mark: "C" },
    { id: "venues", label: "Venues", mark: "V" },
    { id: "access", label: "Requests", mark: "RQ" },
    { id: "privacy", label: "Privacy", mark: "P" },
    { id: "install", label: "Install", mark: "I" },
  ];
  const parentRoutes = [
    ...coachRoutes.filter((item) => !["squads", "development", "squad-builder", "coach-inbox"].includes(item.id)),
    { id: "contact", label: "Contact", mark: "CT" },
    { id: "guide", label: "Guide", mark: "G" },
  ];
  const base = hasCoachAccess() ? coachRoutes : parentRoutes;
  return pendingOnly ? base.filter((item) => ["access", "contact", "privacy", "install", "guide"].includes(item.id)) : base;
}

function navItem(item, route, compact = false) {
  const label = compact ? item.mobileLabel || item.label : item.label;
  return `
    <button class="nav-link ${route === item.id ? "active" : ""}" type="button" data-route-target="${item.id}" data-tour="nav-${item.id}">
      <span class="nav-mark">${escapeHtml(item.mark || item.label.slice(0, 1))}</span>
      <span>${escapeHtml(label)}</span>
    </button>
  `;
}

function mobileNav(routes, route) {
  if (routes.length <= 5) {
    return routes.map((item) => navItem(item, route, true)).join("");
  }
  const primaryIds = hasCoachAccess()
    ? ["home", "schedule", "availability", "attendance"]
    : ["home", "schedule", "availability", "messages"];
  const primary = primaryIds.map((id) => routes.find((item) => item.id === id)).filter(Boolean);
  const hidden = routes.filter((item) => !primaryIds.includes(item.id));
  const moreActive = hidden.some((item) => item.id === route);
  return `
    ${primary.map((item) => navItem(item, route, true)).join("")}
    <button class="nav-link ${moreActive ? "active" : ""}" type="button" data-modal="mobile-nav" data-tour="nav-more">
      <span class="nav-mark">+</span>
      <span>More</span>
    </button>
  `;
}

function pageTitle(route) {
  return {
    home: "Dashboard",
    schedule: "Schedule",
    availability: "Availability",
    attendance: "Register",
    squads: "Teams",
    development: "Player Development",
    documents: "Documents",
    "squad-builder": "Squad Whiteboard",
    messages: "Messages",
    "coach-inbox": "Coach Inbox",
    coaches: "Coaches",
    venues: "Venues",
    contact: "Contact Coaches",
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
  if (pendingOnly && !["access", "contact", "privacy", "install", "guide"].includes(route)) return accessView();
  if (!hasCoachAccess() && ["squads", "development", "squad-builder", "coach-inbox"].includes(route)) return homeView();
  if (hasCoachAccess() && route === "contact") return coachInboxView();
  return {
    home: homeView,
    schedule: scheduleView,
    availability: availabilityView,
    attendance: attendanceView,
    squads: squadsView,
    development: developmentView,
    documents: documentsView,
    "squad-builder": squadBuilderView,
    messages: messagesView,
    "coach-inbox": coachInboxView,
    coaches: coachesView,
    venues: venuesView,
    contact: contactCoachesView,
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
      <article><strong>${averageAttendance()}%</strong><span>Register average</span></article>
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
        <span class="team-pill ${normalizeTeamId(child.teamId)}">${teamName(child.teamId)}</span>
      </div>
      <dl class="info-list">
        <div><dt>Role</dt><dd>${escapeHtml(child.role)}</dd></div>
        <div><dt>Register</dt><dd>${attendancePercent(child.id)}%</dd></div>
        <div><dt>Access</dt><dd>Verified</dd></div>
      </dl>
      <button class="secondary-button panel-action" type="button" data-route-target="documents">View documents</button>
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
        <button type="button" data-route-target="attendance">Take register</button>
        <button type="button" data-route-target="venues">Venues</button>
        <button type="button" data-route-target="documents">Documents</button>
        <button type="button" data-route-target="coach-inbox">Coach inbox</button>
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
  const childTeamIds = new Set(approvedPlayers().map((player) => normalizeTeamId(player.teamId)));
  const scheduleType = state.scheduleType || "matches";
  const period = state.schedulePeriod || "upcoming";
  const allVisibleEvents = state.events
    .filter((event) => hasCoachAccess() || event.teamId === "all" || childTeamIds.has(normalizeTeamId(event.teamId)))
    .filter((event) => state.scheduleFilter === "all" || normalizeTeamId(event.teamId) === normalizeTeamId(state.scheduleFilter) || event.teamId === "all");
  const matchEvents = allVisibleEvents.filter((event) => event.type !== "Training");
  const trainingEvents = allVisibleEvents.filter((event) => event.type === "Training");
  const typeEvents = scheduleType === "training" ? trainingEvents : matchEvents;
  const upcomingCount = typeEvents.filter((event) => !isPastEvent(event)).length;
  const pastCount = typeEvents.filter(isPastEvent).length;
  const visibleEvents = typeEvents
    .filter((event) => period === "past" ? isPastEvent(event) : !isPastEvent(event))
    .sort((a, b) => period === "past"
      ? eventEndDate(b) - eventEndDate(a)
      : eventEndDate(a) - eventEndDate(b));
  const emptyLabel = scheduleType === "training" ? "training sessions" : "matches";
  const emptyCopy = scheduleType === "training"
    ? "Tuesday and Thursday Bowencraig training will appear here when the season training dates are seeded."
    : "Send over the two fixture lists and the matches will be added here by team.";

  return `
    <section class="toolbar" data-tour="schedule-toolbar">
      <div class="schedule-controls">
        <div class="segmented light schedule-type">
          <button type="button" class="${scheduleType === "matches" ? "active" : ""}" data-action="set-schedule-type" data-type="matches">Matches (${matchEvents.length})</button>
          <button type="button" class="${scheduleType === "training" ? "active" : ""}" data-action="set-schedule-type" data-type="training">Training (${trainingEvents.length})</button>
        </div>
        <div class="segmented light schedule-period">
          <button type="button" class="${period === "upcoming" ? "active" : ""}" data-action="set-schedule-period" data-period="upcoming">Upcoming (${upcomingCount})</button>
          <button type="button" class="${period === "past" ? "active" : ""}" data-action="set-schedule-period" data-period="past">Past (${pastCount})</button>
        </div>
      ${hasCoachAccess() ? `<div class="segmented light">
        ${["all", ...eventTeamOptions().map((team) => team.id)].map((id) => `
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
      ${visibleEvents.length ? visibleEvents.map(eventCard).join("") : `<article class="panel"><h3>No ${period === "past" ? "past" : "upcoming"} ${emptyLabel} to show</h3><p class="muted">${period === "past" ? "Completed items will appear here automatically." : emptyCopy}</p></article>`}
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
  const isFreeWeek = event.type === "Free Week";
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
            <span class="team-pill ${normalizeTeamId(event.teamId)}">${teamName(event.teamId)}</span>
            ${past ? '<span class="status-pill warn">Archived</span>' : ""}
          </div>
        </div>
        <p>${eventDateLine(event, venue)}</p>
        ${eventPitchLine(event, venue) ? `<p>${eventPitchLine(event, venue)}</p>` : ""}
        ${isFreeWeek ? "" : venueParkingLine(venue)}
        <div class="mini-stats">
          ${isFreeWeek ? "" : `<span>${counts.available} available</span><span>${counts.unavailable} unavailable</span><span>${counts.unknown} no reply</span>`}
          ${event.type === "Fixture" ? `<span>${counts.snacks} snacks</span><span>${counts.liftSeats} lift seats</span>` : ""}
          ${result ? `<span>${escapeHtml(result)}</span>` : ""}
          ${event.resultNotes ? `<span>${escapeHtml(event.resultNotes)}</span>` : ""}
          ${event.kit ? `<span>${escapeHtml(event.kit)}</span>` : ""}
          ${event.notes ? `<span>${escapeHtml(event.notes)}</span>` : ""}
        </div>
      </div>
      <div class="event-actions">
        ${isFreeWeek ? "" : `<button class="secondary-button" type="button" data-action="focus-event" data-event-id="${event.id}">${openLabel}</button>`}
        ${isFreeWeek ? "" : `<button class="secondary-button" type="button" data-modal="directions" data-event-id="${event.id}">Directions</button>`}
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
      <p class="muted">${eventDateLine(event, venue)}</p>
      ${event.kit ? `<p class="muted">${escapeHtml(event.kit)}</p>` : ""}
      ${eventPitchLine(event, venue) ? `<p class="muted">${eventPitchLine(event, venue)}</p>` : ""}
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
  if (!event) return emptyEventsView("Register");
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
      ${playerTeamOptions().map(teamColumn).join("")}
    </div>
  `;
}

function teamColumn(team) {
  const players = activePlayers().filter((player) => normalizeTeamId(player.teamId) === team.id);
  return `
    <article class="team-column">
      <div class="panel-title">
        <div>
          <p class="eyebrow">${team.name}</p>
          <h3>${players.length} players</h3>
        </div>
        <span class="team-dot ${team.id}"></span>
      </div>
      <div class="team-player-list" tabindex="0" aria-label="${escapeHtml(team.name)} player list">
        ${players.length ? players.map((player) => `
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
        `).join("") : '<p class="muted empty-team-note">No players assigned yet.</p>'}
      </div>
    </article>
  `;
}

function documentsView() {
  const docs = visiblePlayerDocuments();
  const currentChild = currentPlayer();
  const players = activePlayers();
  const selectedFilter = state.documentFilter || "all";
  return `
    <section class="toolbar documents-toolbar">
      <div>
        <p class="eyebrow">${hasCoachAccess() ? "Coach documents" : "Player documents"}</p>
        <h2 class="section-heading">${hasCoachAccess() ? "Share files with parents" : escapeHtml(currentChild?.name || "Documents")}</h2>
      </div>
      ${hasCoachAccess() ? `
        <div class="document-controls">
          <label class="field compact-field">
            <span>Player</span>
            <select data-action="set-document-filter">
              <option value="all" ${selectedFilter === "all" ? "selected" : ""}>All players</option>
              ${players.map((player) => `<option value="${player.id}" ${selectedFilter === player.id ? "selected" : ""}>${escapeHtml(player.name)}</option>`).join("")}
            </select>
          </label>
          <label class="field compact-field">
            <span>Sort</span>
            <select data-action="set-document-sort">
              <option value="newest" ${state.documentSort === "newest" ? "selected" : ""}>Newest first</option>
              <option value="name" ${state.documentSort === "name" ? "selected" : ""}>Player name</option>
              <option value="title" ${state.documentSort === "title" ? "selected" : ""}>Document title</option>
            </select>
          </label>
          <button class="primary-button" type="button" data-modal="document">Upload document</button>
        </div>
      ` : ""}
    </section>
    ${!hasCoachAccess() && !currentChild ? `
      <article class="panel">
        <h3>No linked child selected</h3>
        <p class="muted">A coach needs to approve your child link before documents can be shown.</p>
      </article>
    ` : `
      <section class="document-grid">
        ${docs.length ? docs.map(playerDocumentCard).join("") : `
          <article class="panel">
            <h3>No documents yet</h3>
            <p class="muted">${hasCoachAccess() ? "Upload a PDF or Word document and attach it to a player profile." : "Documents shared with this child will appear here for download."}</p>
          </article>
        `}
      </section>
    `}
  `;
}

function visiblePlayerDocuments() {
  const docs = [...(state.playerDocuments || [])];
  const selectedFilter = state.documentFilter || "all";
  const currentChild = currentPlayer();
  const approvedIds = new Set(approvedPlayers().map((player) => player.id));
  const visible = hasCoachAccess()
    ? docs.filter((doc) => selectedFilter === "all" || doc.playerId === selectedFilter)
    : docs.filter((doc) => currentChild ? doc.playerId === currentChild.id : approvedIds.has(doc.playerId));

  return visible.sort((a, b) => {
    if (state.documentSort === "name") {
      return documentPlayerName(a).localeCompare(documentPlayerName(b)) || documentTitle(a).localeCompare(documentTitle(b));
    }
    if (state.documentSort === "title") {
      return documentTitle(a).localeCompare(documentTitle(b)) || documentPlayerName(a).localeCompare(documentPlayerName(b));
    }
    return createdTime(b) - createdTime(a) || documentTitle(a).localeCompare(documentTitle(b));
  });
}

function documentTitle(doc) {
  return String(doc.title || doc.originalFileName || "Document");
}

function documentPlayerName(doc) {
  return activePlayers().find((player) => player.id === doc.playerId)?.name || doc.playerName || "Player";
}

function fileTypeLabel(doc) {
  const contentType = String(doc.contentType || "").toLowerCase();
  const fileName = String(doc.originalFileName || "").toLowerCase();
  if (contentType.includes("pdf") || fileName.endsWith(".pdf")) return "PDF";
  if (contentType.includes("word") || fileName.endsWith(".doc") || fileName.endsWith(".docx")) return "Word";
  return "Document";
}

function formatFileSize(size = 0) {
  const bytes = Number(size || 0);
  if (!bytes) return "Size unknown";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

function createdTime(item = {}) {
  return item.createdAt?.seconds || Date.parse(item.createdAt || "") / 1000 || 0;
}

function playerDocumentCard(doc) {
  return `
    <article class="document-card panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">${escapeHtml(fileTypeLabel(doc))} - ${escapeHtml(formatFileSize(doc.size))}</p>
          <h3>${escapeHtml(documentTitle(doc))}</h3>
        </div>
        <span class="team-pill ${normalizeTeamId(activePlayers().find((player) => player.id === doc.playerId)?.teamId)}">${escapeHtml(documentPlayerName(doc))}</span>
      </div>
      <dl class="info-list compact-info">
        <div><dt>File</dt><dd>${escapeHtml(doc.originalFileName || "Uploaded file")}</dd></div>
        <div><dt>Shared</dt><dd>${escapeHtml(displayDate(doc.createdAt))}</dd></div>
        ${hasCoachAccess() ? `<div><dt>Uploaded by</dt><dd>${escapeHtml(doc.uploadedByName || "Coach")}</dd></div>` : ""}
      </dl>
      <div class="choice-row">
        <button class="secondary-button" type="button" data-action="download-document" data-document-id="${escapeHtml(doc.id)}">Download</button>
        ${hasCoachAccess() ? `<button class="secondary-button danger-button" type="button" data-action="delete-document" data-document-id="${escapeHtml(doc.id)}">Remove</button>` : ""}
      </div>
    </article>
  `;
}

function developmentView() {
  if (!hasCoachAccess()) return homeView();
  const players = activePlayers().slice().sort((a, b) => teamName(a.teamId).localeCompare(teamName(b.teamId)) || a.name.localeCompare(b.name));
  const levelCounts = developmentLevels.map((level) => ({
    level,
    count: players.filter((player) => developmentFor(player.id).level === level).length,
  }));
  return `
    <section class="toolbar">
      <div>
        <p class="eyebrow">Coach only</p>
        <h2 class="section-heading">Player development</h2>
      </div>
      <button class="primary-button" type="button" data-route-target="squad-builder">Open squad whiteboard</button>
    </section>
    <section class="metric-grid development-summary">
      ${levelCounts.map((item) => `<article><strong>${item.count}</strong><span>${escapeHtml(item.level)}</span></article>`).join("")}
    </section>
    ${squadPositionList()}
    <section class="development-grid">
      ${players.map(developmentCard).join("")}
    </section>
  `;
}

function squadPositionList() {
  const positionFilter = state.squadListPositionFilter || "all";
  const sortMode = state.squadListSort || "name";
  const players = activePlayers()
    .filter((player) => {
      const positions = developmentFor(player.id).positions;
      return positionFilter === "all" || positions.includes(positionFilter);
    })
    .sort((a, b) => {
      if (sortMode === "position") {
        return primaryPosition(a).localeCompare(primaryPosition(b)) || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });

  return `
    <section class="panel squad-position-panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">Squad list</p>
          <h3>Players by position</h3>
        </div>
        <span class="status-pill good">${players.length} shown</span>
      </div>
      <div class="squad-list-controls">
        <label class="field compact-field">
          <span>Filter position</span>
          <select data-action="set-squad-position-filter">
            <option value="all" ${positionFilter === "all" ? "selected" : ""}>All positions</option>
            ${playerPositions.map((position) => `<option value="${escapeHtml(position)}" ${positionFilter === position ? "selected" : ""}>${escapeHtml(position)}</option>`).join("")}
          </select>
        </label>
        <label class="field compact-field">
          <span>Sort by</span>
          <select data-action="set-squad-list-sort">
            <option value="name" ${sortMode === "name" ? "selected" : ""}>Name A-Z</option>
            <option value="position" ${sortMode === "position" ? "selected" : ""}>Position</option>
          </select>
        </label>
      </div>
      <div class="squad-position-list">
        ${players.length ? players.map(squadPositionRow).join("") : '<p class="muted">No players match that position filter yet.</p>'}
      </div>
    </section>
  `;
}

function primaryPosition(player) {
  return developmentFor(player.id).positions[0] || "No positions set";
}

function squadPositionRow(player) {
  const record = developmentFor(player.id);
  return `
    <div class="person-row squad-position-row">
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <p>${escapeHtml(teamName(player.teamId))} - ${escapeHtml(developmentLabel(record))} - ${escapeHtml(record.foot === "Not set" ? "Foot not set" : `${record.foot} foot`)}</p>
        <div class="availability-tags">
          ${record.positions.length ? record.positions.map((position) => `<span>${escapeHtml(position)}</span>`).join("") : "<span>No positions set</span>"}
        </div>
      </div>
      <button class="tiny-button" type="button" data-route-target="squad-builder">Whiteboard</button>
    </div>
  `;
}

function developmentCard(player) {
  const record = developmentFor(player.id);
  return `
    <article class="development-card">
      <form class="stacked-form" data-form="development-player">
        <input type="hidden" name="playerId" value="${escapeHtml(player.id)}">
        <div class="panel-title">
          <div>
            <p class="eyebrow">${teamName(player.teamId)}</p>
            <h3>${escapeHtml(player.name)}</h3>
          </div>
          <span class="level-pill ${developmentClass(record)}">${escapeHtml(developmentLabel(record))}</span>
        </div>
        <div class="development-fields">
          <label class="field">
            <span>Level</span>
            <select name="level">${developmentLevels.map((level) => `<option value="${level}" ${record.level === level ? "selected" : ""}>${level}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Band</span>
            <select name="band">${developmentBands.map((band) => `<option value="${band}" ${record.band === band ? "selected" : ""}>${band}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Strongest foot</span>
            <select name="foot">${footOptions.map((foot) => `<option value="${foot}" ${record.foot === foot ? "selected" : ""}>${foot}</option>`).join("")}</select>
          </label>
        </div>
        <fieldset class="position-checks">
          <legend>Positions</legend>
          ${playerPositions.map((position) => `
            <label>
              <input type="checkbox" name="positions" value="${escapeHtml(position)}" ${record.positions.includes(position) ? "checked" : ""}>
              <span>${escapeHtml(position)}</span>
            </label>
          `).join("")}
        </fieldset>
        <label class="field">
          <span>Coach note</span>
          <textarea name="notes" rows="3" placeholder="Optional private coach note">${escapeHtml(record.notes || "")}</textarea>
        </label>
        <button class="primary-button" type="submit">Save development</button>
      </form>
    </article>
  `;
}

function squadBuilderView() {
  if (!hasCoachAccess()) return homeView();
  const format = state.squadBuilder.format || "7";
  const definition = formationDefinition(format);
  const selections = builderSelections(format);
  const pool = builderPlayerPool();
  const selectedPlayer = activePlayers().find((player) => player.id === state.squadBuilder.selectedPlayerId);
  return `
    <section class="toolbar builder-toolbar">
      <div>
        <p class="eyebrow">Coach only</p>
        <h2 class="section-heading">${definition.label} squad whiteboard</h2>
      </div>
      <div class="choice-row">
        ${Object.keys(formationDefinitions).map((item) => `<button class="secondary-button ${format === item ? "active-filter" : ""}" type="button" data-action="set-builder-format" data-format="${item}">${formationDefinitions[item].label}</button>`).join("")}
        <button class="secondary-button" type="button" data-action="auto-fill-builder">Auto fill</button>
        <button class="secondary-button ${state.squadBuilder.arrowMode ? "active-filter" : ""}" type="button" data-action="toggle-whiteboard-arrows">${state.squadBuilder.arrowMode ? "Stop arrows" : "Draw arrows"}</button>
        <button class="secondary-button" type="button" data-action="undo-whiteboard-arrow">Undo arrow</button>
        <button class="secondary-button" type="button" data-action="clear-whiteboard-arrows">Clear arrows</button>
        <button class="secondary-button" type="button" data-action="reset-builder-layout">Reset positions</button>
        <button class="secondary-button danger-button" type="button" data-action="reset-builder">Reset</button>
      </div>
    </section>
    <section class="builder-filters">
      <div class="segmented light">
        <button type="button" class="${state.squadBuilder.teamFilter === "all" ? "active" : ""}" data-action="set-builder-team" data-team-id="all">All</button>
        ${filterTeamOptions().map((team) => `<button type="button" class="${state.squadBuilder.teamFilter === team.id ? "active" : ""}" data-action="set-builder-team" data-team-id="${team.id}">${team.name}</button>`).join("")}
      </div>
      <div class="segmented light">
        <button type="button" class="${state.squadBuilder.levelFilter === "all" ? "active" : ""}" data-action="set-builder-level" data-level="all">All levels</button>
        ${developmentLevels.map((level) => `<button type="button" class="${state.squadBuilder.levelFilter === level ? "active" : ""}" data-action="set-builder-level" data-level="${level}">${level}</button>`).join("")}
      </div>
    </section>
    <section class="squad-builder-layout">
      <article class="panel formation-panel shape-live">
        <div class="panel-title">
          <div>
            <p class="eyebrow">${definition.slots.length} starters and 2 subs</p>
            <h3>Formation board</h3>
          </div>
          <div class="builder-board-status">
            ${selectedPlayer ? `<span class="status-pill good">Selected: ${escapeHtml(selectedPlayer.name)}</span>` : ""}
            <span class="status-pill warn">Drag markers to change roles</span>
            ${state.squadBuilder.arrowMode ? '<span class="status-pill good">Arrow drawing on</span>' : ""}
          </div>
        </div>
        <p class="muted builder-hint">Drag any marker to reshape the team. Turn on Draw arrows to sketch player movement for a quick whiteboard plan.</p>
        <div class="formation-pitch formation-${format}" data-builder-pitch>
          ${formationArrowLayer(format)}
          ${starterSlots(format).map((slot) => formationSlot(slot, selections[slot.id], { editable: true })).join("")}
        </div>
        <div class="formation-bench" data-builder-bench>
          <div>
            <p class="eyebrow">Bench</p>
            <h4>Substitutes</h4>
          </div>
          ${substituteSlots().map((slot) => formationSlot(slot, selections[slot.id])).join("")}
        </div>
      </article>
      <article class="panel player-pool-panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Player pool</p>
            <h3>${pool.length} available</h3>
          </div>
        </div>
        <div class="builder-player-pool">
          ${pool.length ? pool.map(builderPlayerCard).join("") : '<p class="muted">No players match the selected filters.</p>'}
        </div>
      </article>
    </section>
  `;
}

function builderPlayerPool() {
  const selected = new Set(Object.values(builderSelections()).filter(Boolean));
  return activePlayers()
    .filter((player) => state.squadBuilder.teamFilter === "all" || normalizeTeamId(player.teamId) === normalizeTeamId(state.squadBuilder.teamFilter))
    .filter((player) => {
      const record = developmentFor(player.id);
      return state.squadBuilder.levelFilter === "all" || record.level === state.squadBuilder.levelFilter;
    })
    .sort((a, b) => developmentScore(developmentFor(b.id)) - developmentScore(developmentFor(a.id)) || a.name.localeCompare(b.name))
    .map((player) => ({ ...player, alreadyPicked: selected.has(player.id) }));
}

function builderPlayerCard(player) {
  const record = developmentFor(player.id);
  const selected = state.squadBuilder.selectedPlayerId === player.id;
  return `
    <button class="builder-player-card ${selected ? "selected" : ""} ${player.alreadyPicked ? "picked" : ""}" type="button" draggable="true" data-action="select-builder-player" data-player-id="${escapeHtml(player.id)}" data-player-drag="${escapeHtml(player.id)}">
      <strong>${escapeHtml(player.name)}</strong>
      <span>${teamName(player.teamId)} - ${escapeHtml(developmentLabel(record))}</span>
      <small>${escapeHtml(record.foot === "Not set" ? "Foot not set" : `${record.foot} foot`)}</small>
      <em>${record.positions.length ? escapeHtml(record.positions.join(", ")) : "No positions set"}</em>
    </button>
  `;
}

function formationSlot(slot, playerId, options = {}) {
  const player = activePlayers().find((item) => item.id === playerId);
  const record = player ? developmentFor(player.id) : null;
  const match = !player || slot.isSub || record.positions.includes(slot.position);
  const editable = Boolean(options.editable && !slot.isSub);
  const style = slot.isSub ? "" : `style="left:${slot.x}%; top:${slot.y}%;"`;
  const dragMarker = editable ? `data-formation-drag="${escapeHtml(slot.id)}"` : "";
  return `
    <div class="formation-slot ${slot.isSub ? "sub-slot" : ""} ${editable ? "editable-slot" : ""} ${player ? "filled" : ""} ${match ? "" : "position-warning"}" ${style} data-builder-slot="${escapeHtml(slot.id)}" data-position="${escapeHtml(slot.position)}" data-action="assign-builder-slot" ${dragMarker}>
      <span class="slot-label">${escapeHtml(slot.label)}</span>
      <strong>${player ? escapeHtml(player.name) : escapeHtml(slot.position)}</strong>
      ${player ? `<small>${escapeHtml(developmentLabel(record))}</small>` : editable ? '<small>Drag to move</small>' : ""}
      <div class="slot-actions">
        ${editable ? `<button class="slot-edit" type="button" data-action="edit-builder-slot" data-slot-id="${escapeHtml(slot.id)}">Edit</button>` : ""}
        ${player ? `<button class="slot-clear" type="button" data-action="clear-builder-slot" data-slot-id="${escapeHtml(slot.id)}" aria-label="Clear ${escapeHtml(slot.label)}">x</button>` : ""}
      </div>
    </div>
  `;
}

function formationArrowLayer(format) {
  const arrows = builderArrows(format);
  return `
    <svg class="formation-arrows" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <marker id="whiteboard-arrow-head" markerWidth="5" markerHeight="5" refX="4.2" refY="2.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L5,2.5 L0,5 Z"></path>
        </marker>
      </defs>
      ${arrows.map((arrow) => `
        <line
          x1="${Number(arrow.x1) || 0}"
          y1="${Number(arrow.y1) || 0}"
          x2="${Number(arrow.x2) || 0}"
          y2="${Number(arrow.y2) || 0}"
          marker-end="url(#whiteboard-arrow-head)"
        ></line>
      `).join("")}
      <line data-draft-arrow hidden marker-end="url(#whiteboard-arrow-head)"></line>
    </svg>
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
              <p class="eyebrow">Register alert - ${escapeHtml(displayDate(alert.createdAt || alert.sentAt))}</p>
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

function contactCoachesView() {
  const queries = state.coachQueries
    .filter((query) => query.parentUid === state.session.userId)
    .sort(sortByCreatedAtDesc);
  return `
    <section class="content-grid two-col">
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Parent message</p>
            <h3>Contact the coaches</h3>
          </div>
          <span class="status-pill good">Private</span>
        </div>
        <p class="muted">Use this for queries, concerns or complaints that should go to the coaches rather than the team-wide message feed.</p>
        <form class="stacked-form" data-form="coach-query">
          <label class="field">
            <span>Subject</span>
            <input name="subject" required maxlength="90" placeholder="Short subject">
          </label>
          <label class="field">
            <span>Message</span>
            <textarea name="body" rows="7" required maxlength="1800" placeholder="Write your message for the coaches"></textarea>
          </label>
          <button class="primary-button" type="submit">Send to coaches</button>
        </form>
      </article>
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">Sent messages</p>
            <h3>Your coach contact history</h3>
          </div>
        </div>
        <div class="request-list">
          ${queries.length ? queries.map(coachQueryRow).join("") : '<p class="muted">No coach messages sent yet.</p>'}
        </div>
      </article>
    </section>
  `;
}

function coachInboxView() {
  const queries = state.coachQueries.slice().sort((a, b) => {
    if ((a.status || "open") !== (b.status || "open")) return (a.status || "open") === "open" ? -1 : 1;
    return sortByCreatedAtDesc(a, b);
  });
  const openCount = queries.filter((query) => (query.status || "open") === "open").length;
  return `
    <section class="toolbar">
      <div>
        <p class="eyebrow">Parent contact inbox</p>
        <h2 class="section-heading">${openCount} open message${openCount === 1 ? "" : "s"}</h2>
      </div>
    </section>
    <section class="message-list">
      ${queries.length ? queries.map(coachQueryRow).join("") : `
        <article class="panel">
          <p class="eyebrow">Inbox clear</p>
          <h3>No parent messages yet</h3>
          <p class="muted">Messages sent from the parent Contact page will appear here.</p>
        </article>
      `}
    </section>
  `;
}

function coachQueryRow(query) {
  const status = query.status || "open";
  const created = displayDate(query.createdAt || query.updatedAt);
  const parentLine = [query.parentName || "Parent", query.email].filter(Boolean).join(" - ");
  return `
    <article class="message-card coach-query-card">
      <div class="panel-title">
        <div>
          <p class="eyebrow">${escapeHtml(created)}${parentLine ? ` - ${escapeHtml(parentLine)}` : ""}</p>
          <h3>${escapeHtml(query.subject || "Parent message")}</h3>
        </div>
        <span class="status-pill ${statusClass(status)}">${statusText(status)}</span>
      </div>
      <p>${escapeHtml(query.body || "")}</p>
      ${hasCoachAccess() ? `
        <div class="inline-actions">
          ${status !== "handled" ? `<button class="tiny-button approve" type="button" data-action="resolve-coach-query" data-query-id="${escapeHtml(query.id)}">Mark handled</button>` : ""}
          <button class="tiny-button reject" type="button" data-action="delete-coach-query" data-query-id="${escapeHtml(query.id)}">Delete</button>
        </div>
      ` : ""}
    </article>
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
          <span>Use Contact Coaches for private queries, concerns or complaints.</span>
          <span>Use call or text for urgent fixture or pickup issues.</span>
          <span>Coach numbers are visible only inside verified parent/coach access.</span>
          <span>Email fields are left blank until the club confirms official addresses.</span>
        </div>
        ${!hasCoachAccess() ? '<button class="primary-button panel-action" type="button" data-route-target="contact">Contact coaches</button>' : ""}
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
          <div><strong>5. Read messages</strong><p>The message badge clears after you open Messages. Parent alerts for register updates and collection also appear there.</p></div>
          <div><strong>6. Contact coaches</strong><p>Use Contact for private queries, concerns or complaints that should go to the coach inbox.</p></div>
          <div><strong>7. Keep details current</strong><p>Use Access to update your own name and phone number, or Privacy to request a correction or removal of data.</p></div>
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
          <span>Availability and register data stored per event in Firestore</span>
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
          <span>Coach-only player development ratings added</span>
          <span>Coach-only 7-a-side and 9-a-side squad whiteboard added</span>
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
  if (type === "document") return documentModal();
  if (type === "player") return playerModal();
  if (type === "move-player") return movePlayerModal(state.modal.playerId);
  if (type === "edit-player") return editPlayerModal(state.modal.playerId);
  if (type === "edit-coach") return editCoachModal(state.modal.coachId);
  if (type === "edit-venue") return editVenueModal(state.modal.venueId);
  if (type === "edit-builder-slot") return editBuilderSlotModal(state.modal.slotId);
  if (type === "mobile-nav") return mobileNavModal();
  return "";
}

function mobileNavModal() {
  const routes = navRoutes();
  const primaryIds = hasCoachAccess()
    ? ["home", "schedule", "availability", "attendance"]
    : ["home", "schedule", "availability", "messages"];
  const hidden = routes.filter((item) => !primaryIds.includes(item.id));
  return `
    <p class="eyebrow">Navigation</p>
    <h2 id="modal-title">More sections</h2>
    <div class="mobile-menu-grid">
      ${hidden.map((item) => `
        <button class="mobile-menu-link ${state.route === item.id ? "active" : ""}" type="button" data-route-target="${item.id}">
          <span class="nav-mark">${escapeHtml(item.mark || item.label.slice(0, 1))}</span>
          <span>${escapeHtml(item.label)}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function editBuilderSlotModal(slotId = "") {
  const slot = starterSlots().find((item) => item.id === slotId);
  if (!slot) {
    return `
      <p class="eyebrow">Formation marker</p>
      <h2 id="modal-title">Position not found</h2>
      <p class="muted">Close this and try the formation board again.</p>
    `;
  }
  return `
    <p class="eyebrow">Formation marker</p>
    <h2 id="modal-title">Edit ${escapeHtml(slot.label)}</h2>
    <form class="stacked-form" data-form="edit-builder-slot">
      <input type="hidden" name="slotId" value="${escapeHtml(slot.id)}">
      <label class="field">
        <span>Role</span>
        <select name="position">${playerPositions.map((position) => `<option value="${escapeHtml(position)}" ${position === slot.position ? "selected" : ""}>${escapeHtml(position)}</option>`).join("")}</select>
      </label>
      <label class="field">
        <span>Short label</span>
        <input name="label" maxlength="8" value="${escapeHtml(slot.label)}" placeholder="${escapeHtml(shortLabelForPosition(slot.position))}">
      </label>
      <p class="muted">The role is used by Auto fill to match suitable players. The short label is what appears on the pitch marker.</p>
      <button class="primary-button" type="submit">Save position</button>
    </form>
  `;
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
  const teamId = normalizeEventTeamId(event?.teamId || "all");
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
      <label class="field"><span>Type</span><select name="type" data-action="event-type-choice"><option ${type === "Fixture" ? "selected" : ""}>Fixture</option><option ${type === "Training" ? "selected" : ""}>Training</option><option ${type === "Free Week" ? "selected" : ""}>Free Week</option></select></label>
      <label class="field"><span>Team</span><select name="teamId"><option value="all" ${teamId === "all" ? "selected" : ""}>All teams</option>${eventTeamOptions().map((team) => `<option value="${team.id}" ${team.id === normalizeTeamId(teamId) ? "selected" : ""}>${team.name}</option>`).join("")}</select></label>
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
      <label class="check-row">
        <input name="notifyParents" type="checkbox" checked>
        <span>${editing ? "Notify parents about this schedule change" : "Notify parents about this new schedule item"}</span>
      </label>
      <button class="primary-button" type="submit">${editing ? "Save changes" : "Add fixture/training"}</button>
    </form>
  `;
}

function messageModal() {
  return `
    <p class="eyebrow">Coach action</p>
    <h2 id="modal-title">Send message</h2>
    <form class="stacked-form" data-form="message">
      <label class="field"><span>Send to</span><select name="teamId"><option value="all">All teams</option>${eventTeamOptions().map((team) => `<option value="${team.id}">${team.name}</option>`).join("")}</select></label>
      <label class="field"><span>Title</span><input name="title" required placeholder="Training update"></label>
      <label class="field"><span>Message</span><textarea name="body" rows="5" required placeholder="Message for parents"></textarea></label>
      <button class="primary-button" type="submit">Send message</button>
    </form>
  `;
}

function documentModal() {
  const players = activePlayers();
  return `
    <p class="eyebrow">Coach documents</p>
    <h2 id="modal-title">Upload player document</h2>
    <form class="stacked-form" data-form="player-document">
      <label class="field">
        <span>Player profile</span>
        <select name="playerId" required>
          <option value="">Choose player</option>
          ${players.map((player) => `<option value="${player.id}">${escapeHtml(player.name)} - ${teamName(player.teamId)}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span>Document title</span>
        <input name="title" required placeholder="Right Back Handbook">
      </label>
      <label class="field">
        <span>PDF or Word file</span>
        <input name="documentFile" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required>
      </label>
      <p class="muted">Parents can only see documents linked to a child profile they have been approved for.</p>
      <button class="primary-button" type="submit">Upload and share</button>
    </form>
  `;
}

function playerModal() {
  return `
    <p class="eyebrow">Coach action</p>
    <h2 id="modal-title">Add player</h2>
    <form class="stacked-form" data-form="player">
      <label class="field"><span>Name</span><input name="name" required placeholder="Player name"></label>
      <label class="field"><span>Team</span><select name="teamId">${playerTeamOptions().map((team) => `<option value="${team.id}" ${team.id === "unassigned" ? "selected" : ""}>${team.name}</option>`).join("")}</select></label>
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
      <label class="field"><span>Team</span><select name="teamId">${playerTeamOptions().map((team) => `<option value="${team.id}" ${team.id === normalizeTeamId(player?.teamId) ? "selected" : ""}>${team.name}</option>`).join("")}</select></label>
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
      <label class="field"><span>Team</span><select name="teamId">${playerTeamOptions().map((team) => `<option value="${team.id}" ${team.id === normalizeTeamId(player?.teamId) ? "selected" : ""}>${team.name}</option>`).join("")}</select></label>
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
      <label class="field"><span>Team</span><select name="teamId"><option value="all" ${coach.teamId === "all" ? "selected" : ""}>All teams</option>${eventTeamOptions().map((team) => `<option value="${team.id}" ${team.id === normalizeTeamId(coach.teamId) ? "selected" : ""}>${team.name}</option>`).join("")}</select></label>
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
    delete state.modal;
    if (state.route === "messages") await markMessagesRead();
    saveState();
    render();
    return;
  }

  if (target.dataset.routeTarget) {
    state.route = target.dataset.routeTarget;
    delete state.modal;
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

  if (action === "set-schedule-type") {
    state.scheduleType = target.dataset.type || "matches";
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

  if (action === "download-document") {
    await downloadPlayerDocument(target.dataset.documentId);
    return;
  }

  if (action === "delete-document") {
    await deletePlayerDocument(target.dataset.documentId);
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

  if (action === "resolve-coach-query") {
    await resolveCoachQuery(target.dataset.queryId);
    return;
  }

  if (action === "delete-coach-query") {
    await deleteCoachQuery(target.dataset.queryId);
    return;
  }

  if (action === "set-builder-format") {
    state.squadBuilder.format = target.dataset.format || "7";
    state.squadBuilder.selectedPlayerId = "";
    saveState();
    render();
    return;
  }

  if (action === "set-builder-team") {
    state.squadBuilder.teamFilter = target.dataset.teamId || "all";
    saveState();
    render();
    return;
  }

  if (action === "set-builder-level") {
    state.squadBuilder.levelFilter = target.dataset.level || "all";
    saveState();
    render();
    return;
  }

  if (action === "select-builder-player") {
    state.squadBuilder.selectedPlayerId = target.dataset.playerId || "";
    saveState();
    render();
    return;
  }

  if (action === "assign-builder-slot") {
    if (Date.now() < suppressBuilderClickUntil) return;
    assignBuilderSlot(target.dataset.builderSlot, state.squadBuilder.selectedPlayerId);
    return;
  }

  if (action === "edit-builder-slot") {
    state.modal = {
      type: "edit-builder-slot",
      slotId: target.dataset.slotId,
    };
    render();
    return;
  }

  if (action === "reset-builder-layout") {
    resetBuilderLayout();
    return;
  }

  if (action === "clear-builder-slot") {
    clearBuilderSlot(target.dataset.slotId);
    return;
  }

  if (action === "reset-builder") {
    resetBuilder();
    return;
  }

  if (action === "auto-fill-builder") {
    autoFillBuilder();
    return;
  }

  if (action === "toggle-whiteboard-arrows") {
    state.squadBuilder.arrowMode = !state.squadBuilder.arrowMode;
    state.squadBuilder.selectedPlayerId = "";
    saveState();
    render();
    return;
  }

  if (action === "undo-whiteboard-arrow") {
    undoBuilderArrow();
    return;
  }

  if (action === "clear-whiteboard-arrows") {
    clearBuilderArrows();
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

document.addEventListener("dragstart", (event) => {
  const target = event.target.closest("[data-player-drag]");
  if (!target || !hasCoachAccess()) return;
  const playerId = target.dataset.playerDrag;
  state.squadBuilder.selectedPlayerId = playerId;
  event.dataTransfer?.setData("text/plain", playerId);
  event.dataTransfer?.setData("playerId", playerId);
});

document.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-builder-slot]")) {
    event.preventDefault();
  }
});

document.addEventListener("drop", (event) => {
  const slot = event.target.closest("[data-builder-slot]");
  if (!slot || !hasCoachAccess()) return;
  event.preventDefault();
  const playerId = event.dataTransfer?.getData("playerId") || event.dataTransfer?.getData("text/plain") || state.squadBuilder.selectedPlayerId;
  assignBuilderSlot(slot.dataset.builderSlot, playerId);
});

document.addEventListener("pointerdown", (event) => {
  const pitchForArrow = event.target.closest("[data-builder-pitch]");
  if (pitchForArrow && state.squadBuilder.arrowMode && hasCoachAccess() && !event.target.closest("button")) {
    startBuilderArrow(event, pitchForArrow);
    return;
  }

  const marker = event.target.closest("[data-formation-drag]");
  if (!marker || !hasCoachAccess() || event.target.closest("button")) return;
  const pitch = marker.closest("[data-builder-pitch]");
  if (!pitch) return;
  builderPointerDrag = {
    marker,
    pitch,
    pointerId: event.pointerId,
    slotId: marker.dataset.formationDrag,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
  };
  marker.setPointerCapture?.(event.pointerId);
});

document.addEventListener("pointermove", (event) => {
  if (builderArrowDraft) {
    updateBuilderArrowDraft(event);
    event.preventDefault();
    return;
  }

  if (!builderPointerDrag) return;
  const distance = Math.hypot(event.clientX - builderPointerDrag.startX, event.clientY - builderPointerDrag.startY);
  if (!builderPointerDrag.moved && distance < 6) return;
  builderPointerDrag.moved = true;
  builderPointerDrag.marker.classList.add("dragging");
  const point = pitchPointFromEvent(event, builderPointerDrag.pitch);
  builderPointerDrag.marker.style.left = `${point.x}%`;
  builderPointerDrag.marker.style.top = `${point.y}%`;
  event.preventDefault();
});

document.addEventListener("pointerup", (event) => {
  if (builderArrowDraft) {
    finishBuilderArrow(event);
    return;
  }

  if (!builderPointerDrag) return;
  builderPointerDrag.marker.releasePointerCapture?.(builderPointerDrag.pointerId);
  if (builderPointerDrag.moved) {
    const point = pitchPointFromEvent(event, builderPointerDrag.pitch);
    suppressBuilderClickUntil = Date.now() + 500;
    moveBuilderSlot(builderPointerDrag.slotId, point.x, point.y);
  }
  builderPointerDrag = null;
});

document.addEventListener("pointercancel", () => {
  builderArrowDraft = null;
  builderPointerDrag = null;
  render();
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
  if (target.dataset.action === "set-document-filter") {
    state.documentFilter = target.value || "all";
    saveState();
    render();
    return;
  }
  if (target.dataset.action === "set-document-sort") {
    state.documentSort = target.value || "newest";
    saveState();
    render();
    return;
  }
  if (target.dataset.action === "set-squad-position-filter") {
    state.squadListPositionFilter = target.value || "all";
    saveState();
    render();
    return;
  }
  if (target.dataset.action === "set-squad-list-sort") {
    state.squadListSort = target.value || "name";
    saveState();
    render();
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
    if (form.dataset.form === "coach-query") await submitCoachQuery(data);
    if (form.dataset.form === "change-password") await changePassword(data);
    if (form.dataset.form === "event") await addEvent(data);
    if (form.dataset.form === "edit-event") await editEvent(data);
    if (form.dataset.form === "message") await addMessage(data);
    if (form.dataset.form === "player-document") await uploadPlayerDocument(data);
    if (form.dataset.form === "player") await addPlayer(data);
    if (form.dataset.form === "move-player") await movePlayer(data);
    if (form.dataset.form === "edit-player") await editPlayer(data);
    if (form.dataset.form === "edit-coach") await editCoach(data);
    if (form.dataset.form === "edit-venue") await editVenue(data);
    if (form.dataset.form === "development-player") await savePlayerDevelopment(data);
    if (form.dataset.form === "edit-builder-slot") saveBuilderSlotEdit(data);
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

async function submitCoachQuery(data) {
  if (!state.session.loggedIn || hasCoachAccess()) return;
  const runtime = await ensureFirebase();
  const subject = String(data.get("subject") || "").trim();
  const body = String(data.get("body") || "").trim();

  if (!subject || !body) {
    toast("Add a subject and message before sending");
    return;
  }

  const queryId = `${runtime.user.uid}_query_${Date.now()}`;
  await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "coachQueries", queryId), {
    parentUid: runtime.user.uid,
    parentName: state.session.parentName || "",
    email: state.session.email || runtime.user.email || "",
    subject,
    body,
    status: "open",
    createdAt: runtime.modules.serverTimestamp(),
    updatedAt: runtime.modules.serverTimestamp(),
  }, { merge: true });
  await loadLiveStateFromFirebase();
  toast("Message sent to coaches");
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

async function resolveCoachQuery(queryId) {
  if (!requireCoach() || !queryId) return;
  const runtime = await ensureFirebase();
  await runtime.modules.setDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "coachQueries", queryId), {
    status: "handled",
    handledBy: state.session.userId,
    handledByName: state.session.coachName || "Coach",
    handledAt: runtime.modules.serverTimestamp(),
    updatedAt: runtime.modules.serverTimestamp(),
  }, { merge: true });
  state.coachQueries = state.coachQueries.map((query) => query.id === queryId ? { ...query, status: "handled" } : query);
  render();
  toast("Coach message marked handled");
}

async function deleteCoachQuery(queryId) {
  if (!requireCoach() || !queryId) return;
  const confirmed = window.confirm("Delete this parent message from the coach inbox?");
  if (!confirmed) return;
  await deleteLiveDocument("coachQueries", queryId);
  state.coachQueries = state.coachQueries.filter((query) => query.id !== queryId);
  render();
  toast("Coach message deleted");
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
      playerTeamId: normalizeTeamId(player.teamId),
      relation: request.relation,
      status: "approved",
      consent: true,
      createdAt: runtime.modules.serverTimestamp(),
      updatedAt: runtime.modules.serverTimestamp(),
    }, { merge: true });
    batch.set(runtime.modules.doc(runtime.db, "clubs", clubId, "accessRequests", requestId), {
      status: "approved",
      playerId: player.id,
      playerTeamId: normalizeTeamId(player.teamId),
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
  const teamId = normalizeEventTeamId(data.get("teamId"));
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

function shouldNotifyParents(data) {
  return data.get("notifyParents") === "on";
}

function plainScheduleLine(event) {
  const venue = eventVenue(event);
  if (event.type === "Free Week") return `${formatDateOnly(event.datetime)} - no match scheduled.`;
  return `${formatDate(event.datetime)}${event.finishTime ? ` to ${event.finishTime}` : ""} at ${venue.name}.`;
}

function scheduleNotificationTitle(event, action) {
  if (action === "created") return `New ${event.type.toLowerCase()}: ${event.title}`;
  if (action === "deleted") return `${event.type} removed: ${event.title}`;
  return `${event.type} updated: ${event.title}`;
}

function scheduleNotificationBody(event, action) {
  const team = teamName(normalizeEventTeamId(event.teamId));
  const line = plainScheduleLine(event);
  if (action === "deleted") return `${team}: ${line} This item has been removed from the schedule.`;
  if (action === "created") return `${team}: ${line} Please check the Schedule tab for details.`;
  return `${team}: ${line} Please check the Schedule tab for the latest details.`;
}

async function queueScheduleNotification(event, action) {
  const request = {
    id: uid("notify"),
    audience: "schedule",
    action,
    eventId: event.id,
    teamId: normalizeEventTeamId(event.teamId),
    title: scheduleNotificationTitle(event, action),
    body: scheduleNotificationBody(event, action),
    createdBy: state.session.userId,
    createdByName: state.session.coachName || "Coach",
  };
  await saveLiveDocument("notificationRequests", request.id, request);
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
  if (shouldNotifyParents(data)) await queueScheduleNotification(event, "created");
  state.events.push(event);
  syncEventRoster(event);
  state.selectedEventId = event.id;
  delete state.modal;
  toast(shouldNotifyParents(data) ? "Event added and parent push queued" : "Event added");
}

async function editEvent(data) {
  if (!requireCoach()) return;
  const eventId = data.get("eventId");
  const index = state.events.findIndex((event) => event.id === eventId);
  if (index === -1) return;
  const nextEvent = eventDataFromForm(data, eventId);
  await saveLiveDocument("events", eventId, nextEvent);
  if (shouldNotifyParents(data)) await queueScheduleNotification(nextEvent, "updated");
  state.events[index] = nextEvent;
  syncEventRoster(nextEvent);
  state.selectedEventId = eventId;
  delete state.modal;
  toast(shouldNotifyParents(data) ? "Event updated and parent push queued" : "Event updated");
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
  toast(["present", "collected"].includes(status) ? "Register updated and parent push queued" : "Register updated");
}

async function deleteEvent(eventId) {
  if (!requireCoach()) return;
  const event = state.events.find((item) => item.id === eventId);
  if (!event) return;

  const confirmed = window.confirm(`Remove "${event.title}"? This will also remove its availability and attendance marks.`);
  if (!confirmed) return;

  await queueScheduleNotification(event, "deleted");
  await deleteEventLive(eventId);
  state.events = state.events.filter((item) => item.id !== eventId);
  delete state.availability[eventId];
  delete state.attendance[eventId];

  if (state.selectedEventId === eventId) {
    state.selectedEventId = state.events[0]?.id || "";
  }

  saveState();
  render();
  toast("Event removed and parent push queued");
}

async function addMessage(data) {
  if (!requireCoach()) return;
  const message = {
    id: uid("msg"),
    title: data.get("title"),
    body: data.get("body"),
    teamId: normalizeEventTeamId(data.get("teamId")),
    createdBy: state.session.userId,
  };
  await saveLiveDocument("announcements", message.id, message);
  state.messages.unshift(message);
  delete state.modal;
  toast("Message sent");
}

function isAllowedDocumentFile(file) {
  if (!file?.name) return false;
  const lowerName = file.name.toLowerCase();
  return allowedDocumentTypes.has(file.type) || allowedDocumentExtensions.some((extension) => lowerName.endsWith(extension));
}

function safeStorageFileName(name = "document") {
  const parts = String(name).split(".");
  const extension = parts.length > 1 ? `.${parts.pop().toLowerCase().replace(/[^a-z0-9]/g, "")}` : "";
  const base = parts.join(".").replace(/[^a-zA-Z0-9-]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 70) || "document";
  return `${base}${extension}`;
}

async function uploadPlayerDocument(data) {
  if (!requireCoach()) return;
  const runtime = await ensureFirebase();
  const playerId = String(data.get("playerId") || "").trim();
  const player = activePlayers().find((item) => item.id === playerId);
  const title = String(data.get("title") || "").trim();
  const file = data.get("documentFile");

  if (!player || !title || !(file instanceof File) || !file.name) {
    toast("Choose a player, title and document before uploading");
    return;
  }
  if (!isAllowedDocumentFile(file)) {
    toast("Only PDF, DOC and DOCX files can be uploaded");
    return;
  }
  if (file.size > maxDocumentBytes) {
    toast("Document is too large. Keep uploads under 15 MB.");
    return;
  }

  const documentId = uid("doc");
  const fileName = safeStorageFileName(file.name);
  const storagePath = `clubs/${clubId}/playerDocuments/${player.id}/${documentId}/${fileName}`;
  const storageRef = runtime.modules.ref(runtime.storage, storagePath);

  toast("Uploading document...");
  await runtime.modules.uploadBytes(storageRef, file, {
    contentType: file.type || "application/octet-stream",
    customMetadata: {
      clubId,
      playerId: player.id,
      uploadedBy: state.session.userId || "",
    },
  });

  const record = {
    id: documentId,
    playerId: player.id,
    playerName: player.name,
    playerTeamId: normalizeTeamId(player.teamId),
    title,
    originalFileName: file.name,
    storagePath,
    contentType: file.type || "",
    size: file.size,
    uploadedBy: state.session.userId,
    uploadedByName: state.session.coachName || "Coach",
    status: "active",
  };

  await saveLiveDocument("playerDocuments", documentId, record);
  state.playerDocuments = sortPlayerDocuments([record, ...state.playerDocuments.filter((item) => item.id !== documentId)]);
  delete state.modal;
  toast("Document uploaded and shared");
}

async function downloadPlayerDocument(documentId) {
  const doc = state.playerDocuments.find((item) => item.id === documentId);
  if (!doc?.storagePath) {
    toast("Document could not be found");
    return;
  }
  if (!hasCoachAccess() && !approvedPlayers().some((player) => player.id === doc.playerId)) {
    toast("This document is not linked to your child");
    return;
  }

  try {
    const runtime = await ensureFirebase();
    const url = await runtime.modules.getDownloadURL(runtime.modules.ref(runtime.storage, doc.storagePath));
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.download = doc.originalFileName || documentTitle(doc);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error(error);
    toast("Document download failed. Check Storage rules are deployed.");
  }
}

async function deletePlayerDocument(documentId) {
  if (!requireCoach() || !documentId) return;
  const doc = state.playerDocuments.find((item) => item.id === documentId);
  if (!doc) return;
  const confirmed = window.confirm(`Remove "${documentTitle(doc)}" from ${documentPlayerName(doc)}?`);
  if (!confirmed) return;

  const runtime = await ensureFirebase();
  if (doc.storagePath) {
    try {
      await runtime.modules.deleteObject(runtime.modules.ref(runtime.storage, doc.storagePath));
    } catch (error) {
      console.warn("Stored file could not be deleted; removing Firestore record anyway", error);
    }
  }
  await deleteLiveDocument("playerDocuments", documentId);
  state.playerDocuments = state.playerDocuments.filter((item) => item.id !== documentId);
  render();
  toast("Document removed");
}

async function addPlayer(data) {
  if (!requireCoach()) return;
  const player = {
    id: uid("player"),
    name: data.get("name"),
    teamId: normalizeTeamId(data.get("teamId")),
    role: data.get("role"),
    parentName: data.get("parentName"),
    parentPhone: data.get("parentPhone"),
    status: "active",
  };
  await saveLiveDocument("players", player.id, player);
  state.players.push(player);
  state.events.forEach((event) => {
    if (event.teamId === "all" || normalizeTeamId(event.teamId) === normalizeTeamId(player.teamId)) {
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
  const updated = { ...player, teamId: normalizeTeamId(data.get("teamId")) };
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
    teamId: normalizeTeamId(data.get("teamId")),
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
    teamId: normalizeEventTeamId(String(data.get("teamId") || "all")),
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

async function savePlayerDevelopment(data) {
  if (!requireCoach()) return;
  const playerId = String(data.get("playerId") || "").trim();
  const player = activePlayers().find((item) => item.id === playerId);
  if (!player) return;
  const record = defaultDevelopmentRecord(playerId, {
    level: String(data.get("level") || "Not assessed"),
    band: String(data.get("band") || "Not set"),
    foot: String(data.get("foot") || "Not set"),
    positions: data.getAll("positions").map(String),
    notes: String(data.get("notes") || "").trim(),
  });
  const payload = {
    ...record,
    playerName: player.name,
    teamId: player.teamId,
    reviewedBy: state.session.userId,
    reviewedByName: state.session.coachName || "Coach",
  };
  await saveLiveDocument("playerDevelopment", playerId, payload);
  state.playerDevelopment[playerId] = payload;
  toast("Development record saved");
}

function pitchPointFromEvent(event, pitch) {
  const rect = pitch.getBoundingClientRect();
  const rawX = ((event.clientX - rect.left) / rect.width) * 100;
  const rawY = ((event.clientY - rect.top) / rect.height) * 100;
  return {
    x: Math.round(Math.min(92, Math.max(8, rawX)) * 10) / 10,
    y: Math.round(Math.min(92, Math.max(8, rawY)) * 10) / 10,
  };
}

function draftArrowLine() {
  return builderArrowDraft?.pitch?.querySelector("[data-draft-arrow]");
}

function setDraftArrowLine(start, end) {
  const line = draftArrowLine();
  if (!line) return;
  line.hidden = false;
  line.setAttribute("x1", start.x);
  line.setAttribute("y1", start.y);
  line.setAttribute("x2", end.x);
  line.setAttribute("y2", end.y);
}

function startBuilderArrow(event, pitch) {
  const start = pitchPointFromEvent(event, pitch);
  builderArrowDraft = {
    pitch,
    pointerId: event.pointerId,
    start,
  };
  pitch.setPointerCapture?.(event.pointerId);
  setDraftArrowLine(start, start);
  event.preventDefault();
}

function updateBuilderArrowDraft(event) {
  if (!builderArrowDraft) return;
  const end = pitchPointFromEvent(event, builderArrowDraft.pitch);
  setDraftArrowLine(builderArrowDraft.start, end);
}

function finishBuilderArrow(event) {
  if (!builderArrowDraft) return;
  const end = pitchPointFromEvent(event, builderArrowDraft.pitch);
  const distance = Math.hypot(end.x - builderArrowDraft.start.x, end.y - builderArrowDraft.start.y);
  builderArrowDraft.pitch.releasePointerCapture?.(builderArrowDraft.pointerId);
  if (distance >= 4) {
    builderArrows().push({
      id: uid("arrow"),
      x1: builderArrowDraft.start.x,
      y1: builderArrowDraft.start.y,
      x2: end.x,
      y2: end.y,
    });
    saveState();
  }
  builderArrowDraft = null;
  render();
}

function moveBuilderSlot(slotId, x, y) {
  if (!hasCoachAccess() || !slotId) return;
  const baseSlot = formationDefinition().slots.find((slot) => slot.id === slotId);
  if (!baseSlot) return;
  const overrides = formationSlotOverrides();
  const previous = overrides[slotId] || {};
  const previousPosition = playerPositions.includes(previous.position) ? previous.position : baseSlot.position;
  const nextPosition = pitchPositionFromPoint(x, y);
  overrides[slotId] = {
    ...previous,
    x,
    y,
    position: nextPosition,
    label: nextPosition === previousPosition && previous.label ? previous.label : shortLabelForPosition(nextPosition),
  };
  saveState();
  render();
}

function saveBuilderSlotEdit(data) {
  if (!requireCoach()) return;
  const slotId = String(data.get("slotId") || "");
  const position = String(data.get("position") || "");
  const baseSlot = formationDefinition().slots.find((slot) => slot.id === slotId);
  if (!baseSlot || !playerPositions.includes(position)) return;
  const label = String(data.get("label") || shortLabelForPosition(position)).trim().toUpperCase().slice(0, 8);
  const overrides = formationSlotOverrides();
  overrides[slotId] = {
    ...(overrides[slotId] || {}),
    position,
    label: label || shortLabelForPosition(position),
  };
  delete state.modal;
  saveState();
  render();
  toast("Formation position updated");
}

function assignBuilderSlot(slotId, playerId) {
  if (!requireCoach() || !slotId || !playerId) return;
  const player = activePlayers().find((item) => item.id === playerId);
  if (!player) return;
  const selections = builderSelections();
  Object.keys(selections).forEach((key) => {
    if (selections[key] === playerId) delete selections[key];
  });
  selections[slotId] = playerId;
  state.squadBuilder.selectedPlayerId = "";
  saveState();
  render();
}

function clearBuilderSlot(slotId) {
  if (!requireCoach() || !slotId) return;
  delete builderSelections()[slotId];
  saveState();
  render();
}

function resetBuilder() {
  if (!requireCoach()) return;
  const confirmed = window.confirm("Clear this formation board?");
  if (!confirmed) return;
  state.squadBuilder.selections[state.squadBuilder.format] = {};
  state.squadBuilder.selectedPlayerId = "";
  saveState();
  render();
}

function resetBuilderLayout() {
  if (!requireCoach()) return;
  const confirmed = window.confirm("Reset the marker positions and role labels for this formation?");
  if (!confirmed) return;
  state.squadBuilder.customSlots[state.squadBuilder.format] = {};
  saveState();
  render();
  toast("Formation shape reset");
}

function undoBuilderArrow() {
  if (!requireCoach()) return;
  const arrows = builderArrows();
  if (!arrows.length) return;
  arrows.pop();
  saveState();
  render();
  toast("Arrow removed");
}

function clearBuilderArrows() {
  if (!requireCoach()) return;
  const arrows = builderArrows();
  if (!arrows.length) return;
  const confirmed = window.confirm("Clear all arrows from this formation?");
  if (!confirmed) return;
  state.squadBuilder.arrows[state.squadBuilder.format] = [];
  saveState();
  render();
  toast("Arrows cleared");
}

function autoFillBuilder() {
  if (!requireCoach()) return;
  const selections = {};
  const used = new Set();
  const players = activePlayers()
    .filter((player) => state.squadBuilder.teamFilter === "all" || normalizeTeamId(player.teamId) === normalizeTeamId(state.squadBuilder.teamFilter))
    .filter((player) => {
      const record = developmentFor(player.id);
      return state.squadBuilder.levelFilter === "all" || record.level === state.squadBuilder.levelFilter;
    });

  allBuilderSlots().forEach((slot) => {
    const candidate = players
      .filter((player) => !used.has(player.id))
      .map((player) => {
        const record = developmentFor(player.id);
        const positionMatch = slot.isSub || record.positions.includes(slot.position);
        return {
          player,
          score: developmentScore(record) + (positionMatch ? 100 : 0) + (record.positions.length ? 5 : 0),
        };
      })
      .sort((a, b) => b.score - a.score || a.player.name.localeCompare(b.player.name))[0]?.player;
    if (candidate) {
      selections[slot.id] = candidate.id;
      used.add(candidate.id);
    }
  });

  state.squadBuilder.selections[state.squadBuilder.format] = selections;
  state.squadBuilder.selectedPlayerId = "";
  saveState();
  render();
  toast("Formation filled");
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
    storageModule,
  ] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js"),
  ]);

  firebaseRuntime.modules = {
    ...appModule,
    ...authModule,
    ...firestoreModule,
    ...messagingModule,
    ...storageModule,
  };
  firebaseRuntime.app = appModule.initializeApp(backendConfig.firebaseConfig);
  firebaseRuntime.auth = authModule.getAuth(firebaseRuntime.app);
  firebaseRuntime.db = firestoreModule.getFirestore(firebaseRuntime.app);
  firebaseRuntime.storage = storageModule.getStorage(firebaseRuntime.app);
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

async function loadOptionalDocs(collectionName) {
  try {
    return await loadDocs(collectionName);
  } catch (error) {
    console.warn(`${collectionName} could not be loaded yet`, error);
    return [];
  }
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
    state.teams = normalizeLiveTeams(squadSource.length ? squadSource.sort((a, b) => (a.order || 0) - (b.order || 0)) : teams);
    liveTeams = state.teams;
    state.events = events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    state.messages = announcements.sort(sortByCreatedAtDesc);
    state.venues = venueDocs;
    state.coachContacts = coachContactDocs;

    if (hasCoachAccess(role)) {
      const [players, parentLinks, accessRequests, notifications, users, dataRequests, coachQueries, playerDevelopment, playerDocuments] = await Promise.all([
        loadDocs("players"),
        loadDocs("parentLinks"),
        loadDocs("accessRequests"),
        loadDocs("notifications"),
        loadDocs("users"),
        loadDocs("dataRequests"),
        loadOptionalDocs("coachQueries"),
        loadDocs("playerDevelopment"),
        loadOptionalDocs("playerDocuments"),
      ]);
      state.players = players.map(normalizePlayerRecord).sort((a, b) => a.name.localeCompare(b.name));
      state.parentLinks = parentLinks;
      state.accessRequests = accessRequests.sort(sortByCreatedAtDesc);
      state.notifications = notifications.sort(sortByCreatedAtDesc);
      state.users = users;
      state.dataRequests = dataRequests.sort(sortByCreatedAtDesc);
      state.coachQueries = coachQueries.sort(sortByCreatedAtDesc);
      state.playerDevelopment = Object.fromEntries(playerDevelopment.map((record) => [record.playerId || record.id, defaultDevelopmentRecord(record.playerId || record.id, record)]));
      state.playerDocuments = sortPlayerDocuments(playerDocuments);
    } else {
      const uid = runtime.user.uid;
      const [parentLinks, accessRequests, notifications, dataRequests, coachQueries] = await Promise.all([
        loadDocsWhere("parentLinks", "parentUid", "==", uid),
        loadDocsWhere("accessRequests", "parentUid", "==", uid),
        loadDocsWhere("notifications", "userId", "==", uid),
        loadDocsWhere("dataRequests", "parentUid", "==", uid),
        loadOptionalDocsWhere("coachQueries", "parentUid", "==", uid),
      ]);
      state.parentLinks = parentLinks;
      state.accessRequests = accessRequests.sort(sortByCreatedAtDesc);
      state.notifications = notifications.sort(sortByCreatedAtDesc);
      state.dataRequests = dataRequests.sort(sortByCreatedAtDesc);
      state.coachQueries = coachQueries.sort(sortByCreatedAtDesc);
      state.players = await loadApprovedPlayerDocs(parentLinks);
      state.playerDocuments = await loadPlayerDocumentsForParent(parentLinks);
      state.playerDevelopment = {};
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

async function loadOptionalDocsWhere(collectionName, field, operator, value) {
  try {
    return await loadDocsWhere(collectionName, field, operator, value);
  } catch (error) {
    console.warn(`${collectionName} could not be loaded yet`, error);
    return [];
  }
}

async function loadApprovedPlayerDocs(parentLinks) {
  const runtime = await ensureFirebase();
  const approved = parentLinks.filter((link) => link.status === "approved");
  const docs = await Promise.all(approved.map((link) => runtime.modules.getDoc(runtime.modules.doc(runtime.db, "clubs", clubId, "players", link.playerId))));
  return docs.filter((snap) => snap.exists()).map((snap) => normalizePlayerRecord({ id: snap.id, ...snap.data() })).sort((a, b) => a.name.localeCompare(b.name));
}

function sortPlayerDocuments(items = []) {
  return items
    .filter((item) => item.status !== "deleted")
    .sort((a, b) => createdTime(b) - createdTime(a) || documentTitle(a).localeCompare(documentTitle(b)));
}

async function loadPlayerDocumentsForParent(parentLinks) {
  try {
    const runtime = await ensureFirebase();
    const approvedIds = parentLinks.filter((link) => link.status === "approved").map((link) => link.playerId).filter(Boolean);
    if (!approvedIds.length) return [];
    const chunks = chunkArray([...new Set(approvedIds)], 10);
    const collectionRef = await liveCollection("playerDocuments");
    const snapshots = await Promise.all(chunks.map((chunk) => runtime.modules.getDocs(
      runtime.modules.query(collectionRef, runtime.modules.where("playerId", "in", chunk)),
    )));
    return sortPlayerDocuments(snapshots.flatMap((snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))));
  } catch (error) {
    console.warn("playerDocuments could not be loaded yet", error);
    return [];
  }
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
    state.teams = normalizeLiveTeams(items.sort((a, b) => (a.order || 0) - (b.order || 0)));
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
      state.players = items.map(normalizePlayerRecord).sort((a, b) => a.name.localeCompare(b.name));
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
    watchCollection("coachQueries", (items) => {
      state.coachQueries = items.sort(sortByCreatedAtDesc);
    });
    watchCollection("playerDevelopment", (items) => {
      state.playerDevelopment = Object.fromEntries(items.map((record) => [record.playerId || record.id, defaultDevelopmentRecord(record.playerId || record.id, record)]));
    });
    watchCollection("playerDocuments", (items) => {
      state.playerDocuments = sortPlayerDocuments(items);
    });
  } else {
    const uid = state.session.userId;
    const approvedIds = approvedPlayers().map((player) => player.id).filter(Boolean);
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
      runtime.modules.collection(runtime.db, "clubs", clubId, "coachQueries"),
      runtime.modules.where("parentUid", "==", uid),
    ), (items) => {
      state.coachQueries = items.sort(sortByCreatedAtDesc);
    });
    watchQuery(runtime.modules.query(
      runtime.modules.collection(runtime.db, "clubs", clubId, "parentLinks"),
      runtime.modules.where("parentUid", "==", uid),
    ), async (items) => {
      state.parentLinks = items;
      state.players = await loadApprovedPlayerDocs(items);
      state.playerDocuments = await loadPlayerDocumentsForParent(items);
      if (!state.session.selectedPlayerId) state.session.selectedPlayerId = approvedPlayers()[0]?.id || "";
    });
    if (approvedIds.length) {
      watchQuery(runtime.modules.query(
        runtime.modules.collection(runtime.db, "clubs", clubId, "playerDocuments"),
        runtime.modules.where("playerId", "in", approvedIds.slice(0, 10)),
      ), (items) => {
        state.playerDocuments = sortPlayerDocuments(items);
      });
    }
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
