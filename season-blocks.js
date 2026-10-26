/* Shared, side-effect-free season reporting and migration planning (browser + Node). */
(() => {
  const seasonId = '2026-27';
  const seasonStart = '2026-08-01';
  const seasonEnd = '2027-07-31';
  const blockBStart = '2026-10-24';
  const blockBEnd = '2026-11-28';
  const dateKey = (event) => String(event?.datetime || '').slice(0, 10);
  const isMatch = (event) => event.type === 'Fixture';
  const uniqueEvents = (events) => [...new Map(events.map((event) => [event.id, event])).values()];
  const dateValid = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T12:00:00Z`));
  function blockForEvent(event) {
    const date = dateKey(event);
    if (!dateValid(date) || date < seasonStart || date > seasonEnd || (event.seasonId && event.seasonId !== seasonId)) return '';
    if (event.blockId) return ['A', 'B'].includes(event.blockId) ? event.blockId : '';
    if (date < blockBStart) return 'A';
    return date <= blockBEnd ? 'B' : '';
  }
  function inScope(event, scope = 'season') {
    const date = dateKey(event);
    if (!dateValid(date) || date < seasonStart || date > seasonEnd || (event.seasonId && event.seasonId !== seasonId)) return false;
    return scope === 'season' || blockForEvent(event) === scope;
  }
  const dates = ['2026-10-24', '2026-10-31', '2026-11-07', '2026-11-14', '2026-11-21', '2026-11-28'];
  const lists = [
    { teamId: 'team1', name: 'Largs Colts Orange', competition: 'League 1', opponents: ['Glenburn Yellow', 'Tass Thistle Gold', 'Lochryan Blue', 'Cumnock Juniors Black', '', 'Cambusdoon Villa'], home: [false, true, false, true, false, false] },
    { teamId: 'team2', name: 'Largs Colts Blue', competition: 'League 2', opponents: ['Troon FC Black', 'Crosshouse Reds', 'Shortlees United 1', 'Dean Black', 'Shortlees Youth', 'Cumnock Juniors White'], home: [false, true, false, true, false, true] },
  ];
  function blockBFixtures() {
    return lists.flatMap((team) => dates.map((date, index) => {
      const opponent = team.opponents[index];
      const free = !opponent;
      const homeAway = free ? 'free-week' : team.home[index] ? 'home' : 'away';
      return {
        id: `block-b-${team.teamId}-${date.replaceAll('-', '')}`, type: free ? 'Free Week' : 'Fixture', teamId: team.teamId,
        title: free ? `${team.name} free week` : homeAway === 'home' ? `${team.name} vs ${opponent}` : `${team.name} away to ${opponent}`,
        opponent, datetime: `${date}T12:00:00`, timeTbc: true, meetTime: '', finishTime: '',
        venue: free ? 'No fixture' : 'Venue TBC', venueId: 'away-custom', address: free ? 'No match scheduled' : 'Address to be confirmed', parkingAddress: '', venueTbc: !free,
        kit: free ? '' : 'TBC', selectedPlayerIds: [], homeScore: '', awayScore: '', resultNotes: '',
        notes: free ? 'Free week. Excluded from match statistics.' : 'Kick-off, arrival, venue and kit to be confirmed by coaches.',
        seasonId, blockId: 'B', blockStatus: 'active', competition: team.competition, homeAway,
        matchStatus: free ? 'free-week' : 'scheduled', selectionStatus: 'unconfirmed', source: '2026/27 Block B fixture list',
      };
    })).sort((a, b) => a.datetime.localeCompare(b.datetime) || a.teamId.localeCompare(b.teamId));
  }
  const normalise = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  function planMigration(events) {
    const creates = [], updates = [], reused = [], issues = [], unassigned = [];
    const addMetadata = (event, fields) => {
      const conflicts = Object.entries(fields).filter(([key, value]) => event[key] != null && event[key] !== '' && event[key] !== value);
      if (conflicts.length) { issues.push({ id: event.id, reason: 'Existing metadata conflicts; review required', fields: conflicts.map(([key]) => key) }); return; }
      const patch = Object.fromEntries(Object.entries(fields).filter(([key]) => event[key] == null || event[key] === ''));
      if (Object.keys(patch).length) updates.push({ id: event.id, fields: patch, updateTime: event._updateTime });
    };
    for (const event of events) {
      if (!['Fixture', 'Free Week'].includes(event.type)) continue;
      if (blockForEvent(event) === 'A' && ['team1', 'team2'].includes(event.teamId)) {
        addMetadata(event, { seasonId, blockId: 'A', blockStatus: 'archived' });
      } else if (!inScope(event) || !['team1', 'team2'].includes(event.teamId)) {
        unassigned.push({ id: event.id, date: dateKey(event), reason: 'Outside confirmed 2026/27 block/team boundaries; left unchanged' });
      }
    }
    for (const expected of blockBFixtures()) {
      const candidates = events.filter((event) => dateKey(event) === dateKey(expected) && ['Fixture', 'Free Week'].includes(event.type) && (event.teamId === expected.teamId || !['team1', 'team2'].includes(event.teamId)));
      if (!candidates.length) {
        if (events.some((event) => event.id === expected.id)) issues.push({ id: expected.id, reason: 'Deterministic fixture ID already exists with different details' });
        else creates.push(expected);
        continue;
      }
      const existing = candidates[0];
      const opponentMatches = normalise(existing.opponent) === normalise(expected.opponent) || (!existing.opponent && normalise(existing.title).includes(normalise(expected.opponent)) && Boolean(expected.opponent));
      const identityMatches = existing.teamId === expected.teamId && existing.type === expected.type && (expected.type === 'Free Week' || opponentMatches);
      const directionConflict = existing.homeAway && existing.homeAway !== expected.homeAway;
      if (candidates.length !== 1 || !identityMatches || directionConflict) {
        issues.push({ id: expected.id, candidates: candidates.map((item) => item.id), reason: 'Existing same-date event needs manual matching; no new duplicate or overwrite planned' });
        continue;
      }
      reused.push(existing.id);
      // Weekly details, results, roster, IDs and existing match status are deliberately untouched.
      addMetadata(existing, { seasonId, blockId: 'B', blockStatus: 'active', competition: expected.competition });
    }
    return { creates, updates, reused, issues, unassigned };
  }
  const attendanceStatus = (value) => typeof value === 'string' ? value : value?.status || 'unknown';
  function availabilityOnDate(state, playerId, day, fixtures) {
    const entries = [state.availability?.[day]?.[playerId], ...fixtures.map((fixture) => state.availability?.[fixture.id]?.[playerId])].filter(Boolean);
    const statuses = [...new Set(entries.map((entry) => typeof entry === 'string' ? entry : entry.status).filter((status) => ['available', 'unavailable'].includes(status)))];
    return statuses.length > 1 ? 'conflict' : statuses[0] || 'unknown';
  }
  function seasonReport(state, scope = 'season', today = new Date().toISOString().slice(0, 10)) {
    const events = uniqueEvents(state.events || []).filter((event) => inScope(event, scope));
    const fixtures = events.filter(isMatch);
    const training = events.filter((event) => event.type === 'Training');
    const matchdays = [...new Set(fixtures.map(dateKey))].sort();
    const issues = [];
    const rows = (state.players || []).map((player) => {
      const row = { playerId: player.id, name: player.name, status: player.status || '', appearances: 0, selected: 0, available: 0, unavailable: 0, omitted: 0, trainingAttended: 0, trainingMissed: 0, noReply: 0, appearancesUnknown: 0, trainingUnrecorded: 0, selectionUnrecorded: 0 };
      for (const fixture of fixtures) {
        const selected = (fixture.selectedPlayerIds || []).includes(player.id);
        const mark = attendanceStatus(state.attendance?.[fixture.id]?.[player.id]);
        if (selected) row.selected++;
        if (['present', 'collected'].includes(mark)) row.appearances++;
        else if (selected && dateKey(fixture) < today && mark !== 'absent') {
          row.appearancesUnknown++;
          issues.push({ playerId: player.id, eventId: fixture.id, reason: 'Selected but actual participation is unrecorded' });
        }
      }
      for (const day of matchdays) {
        const dailyFixtures = fixtures.filter((fixture) => dateKey(fixture) === day);
        const selected = dailyFixtures.some((fixture) => (fixture.selectedPlayerIds || []).includes(player.id));
        // Only real fixtures produce matchdays. Do not infer historical team membership
        // from today's player.teamId: this club selects weekly from a shared player pool.
        const status = availabilityOnDate(state, player.id, day, dailyFixtures);
        const selectionRecorded = dailyFixtures.every((fixture) => fixture.selectionStatus === 'confirmed' || fixture.selectedPlayerIds?.length);
        if (status === 'available') row.available++;
        else if (status === 'unavailable') row.unavailable++;
        else {
          row.noReply++;
          if (status === 'conflict') issues.push({ playerId: player.id, date: day, reason: 'Conflicting date/event availability; excluded from available/unavailable totals' });
        }
        if (day < today && !selectionRecorded) row.selectionUnrecorded++;
        if (day < today && selectionRecorded && status === 'available' && !selected) row.omitted++;
      }
      for (const event of training) {
        const mark = attendanceStatus(state.attendance?.[event.id]?.[player.id]);
        if (['present', 'collected'].includes(mark)) row.trainingAttended++;
        else if (mark === 'absent') row.trainingMissed++;
        else if (dateKey(event) < today) row.trainingUnrecorded++;
      }
      return row;
    }).sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return { seasonId, scope, rows, issues, fixtureCount: fixtures.length, trainingCount: training.length, matchdayCount: matchdays.length };
  }
  globalThis.LargsSeasonBlocks = Object.freeze({ seasonId, seasonStart, seasonEnd, blockBStart, blockBEnd, dateKey, blockForEvent, inScope, blockBFixtures, planMigration, seasonReport });
})();
