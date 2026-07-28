/* re:Solve — Game Engine */

class GameEngine {
  constructor(scenarioPath) {
    this.scenarioPath = scenarioPath;
    this.cards = {};
    this.combinations = [];
    this.puzzles = {};
    this.rooms = [];
    this.events = {};
    this.scoring = {};
    this.meta = {};
    this.narrative = {};

    // State
    this.visibleCards = new Set();
    this.inventory = [];       // red item card IDs the player holds
    this.consumedCards = new Set();
    this.solvedPuzzles = new Set();
    this.currentRoom = null;   // current room card ID
    this.unlockedRooms = [];   // all room card IDs discovered so far
    this.hintsUsed = 0;
    this.penalties = 0;
    this.penaltySeconds = 0;
    this.startTime = null;
    this.endTime = null;
    this.finished = false;
    this.completed = false;  // true only on successful ending
    this.hintTooltipShown = false;

    this.discoveredCards = new Set(); // cards discovered by player action
    this.lastConsumed = [];            // cards consumed in the last action
    this.revealedCards = new Set();    // all cards ever revealed (persists even after event dismissal)
    this.revealQueue = [];             // cards auto-revealed (for UI toasts)

    // Leaderboard state
    this.uuid = null;
    this.playerName = null;
    this.serverTimer = null;  // "MM:SS" from server, authoritative
    this.serverTimerAt = null; // Date.now() when serverTimer was received
    this.onLeaderboardEvent = null; // callback(event, payload) for leaderboard submissions

    this.onUpdate = null; // callback for UI refresh
  }

  async load() {
    const base = this.scenarioPath;
    const bust = `?v=${Date.now()}`;
    const [meta, narrative, cards, combos, puzzles, events, scoring, rooms] = await Promise.all([
      fetch(`${base}/meta.json${bust}`).then(r => r.json()),
      fetch(`${base}/narrative.json${bust}`).then(r => r.json()),
      fetch(`${base}/cards.json${bust}`).then(r => r.json()),
      fetch(`${base}/combinations.json${bust}`).then(r => r.json()),
      fetch(`${base}/puzzles.json${bust}`).then(r => r.json()),
      fetch(`${base}/events.json${bust}`).then(r => r.json()),
      fetch(`${base}/scoring.json${bust}`).then(r => r.json()),
      fetch(`${base}/rooms.json${bust}`).then(r => r.json()).catch(() => ({ rooms: [] })),
    ]);
    this.meta = meta;
    this.narrative = narrative;
    this.scoring = scoring;
    this.events = events;
    this.combinations = combos.combinations;
    this.rooms = rooms.rooms || [];
    cards.cards.forEach(c => this.cards[c.id] = c);
    puzzles.puzzles.forEach(p => this.puzzles[p.id] = p);
    this.gameMode = (typeof localStorage !== 'undefined' && localStorage.getItem('gameMode')) || 'normal';
    if (this.gameMode === 'challenge') {
      Object.values(this.puzzles).forEach(p => {
        if (!p.challenge) return;
        const { config: cfgOverride, ...topLevel } = p.challenge;
        if (cfgOverride) p.config = { ...p.config, ...cfgOverride };
        Object.assign(p, topLevel);
        delete p.challenge;
      });
      Object.values(this.cards).forEach(c => {
        if (!c.challenge) return;
        Object.assign(c, c.challenge);
        delete c.challenge;
      });
    }

    // --- Locale support (opt-in per episode) ---
    // Look for scenarios/<episode>/locales/index.json. If present, expose
    // the available locales so the intro screen can render a toggle.
    // English is always the base — no locale = no translation overlay.
    this.localesAvailable = [];
    this.activeLocale = null;
    this.localeData = null;
    try {
      const localeIndex = await fetch(`${base}/locales/index.json${bust}`).then(r => r.ok ? r.json() : null);
      if (localeIndex && Array.isArray(localeIndex.locales)) {
        this.localesAvailable = localeIndex.locales;
      }
    } catch (e) { /* no locales — that's fine */ }
  }

  /**
   * Load a locale overlay by language code (e.g. 'id'). Pass null or 'en' to
   * clear the overlay and revert to the base English JSONs.
   * Safe to call multiple times — later calls replace the active locale.
   */
  async applyLocale(langCode) {
    if (!langCode || langCode === 'en') {
      this.activeLocale = null;
      this.localeData = null;
      return;
    }
    const base = this.scenarioPath;
    try {
      const data = await fetch(`${base}/locales/${langCode}.json?v=${Date.now()}`).then(r => r.json());
      this.activeLocale = langCode;
      this.localeData = data;
    } catch (e) {
      console.warn(`Failed to load locale ${langCode}`, e);
      this.activeLocale = null;
      this.localeData = null;
    }
  }

  /**
   * Translated text lookup. Returns null when no translation is available
   * (caller should fall back to the base English field).
   *
   *   type   'cards' | 'rooms' | 'puzzles' | 'meta' | 'narrative'
   *   id     card_id / room_card_id / puzzle_id (ignored for meta and narrative)
   *   field  'title' | 'description' | 'unlock_text' | 'start_button' | ...
   *
   * For 'narrative' the whole narrative overlay object is returned so the
   * caller can pick out intro / ending / mid_event segments.
   */
  t(type, id, field) {
    if (!this.localeData) return null;
    const section = this.localeData[type];
    if (!section) return null;
    if (type === 'meta' || type === 'ui') return section[field] || null;
    if (type === 'narrative') return section;
    const entry = section[String(id)];
    if (!entry) return null;
    return field ? (entry[field] || null) : entry;
  }

  getPuzzleConfig(puzzleId) {
    const p = this.puzzles[puzzleId];
    if (!p) return {};
    const base = p.config || {};
    // Merge locale overrides — only for display text (question, options, description).
    // Answers/solutions are NEVER touched.
    const overlay = this.t('puzzles', puzzleId);
    if (!overlay || !overlay.config_overrides) return base;
    const ov = overlay.config_overrides;
    return this._mergePuzzleConfig(base, ov);
  }

  // Deep-merge puzzle config overrides. Arrays are index-aligned so a locale
  // can supply `options: [...]` matching the same length as the base config.
  // Reserved answer/solution keys are stripped from the overlay to prevent
  // accidental translation of puzzle answers.
  _mergePuzzleConfig(base, ov) {
    const RESERVED = new Set(['answer', 'answers', 'accept', 'solution']);
    if (Array.isArray(base) && Array.isArray(ov)) {
      return base.map((b, i) => (ov[i] !== undefined ? this._mergePuzzleConfig(b, ov[i]) : b));
    }
    if (base && typeof base === 'object' && ov && typeof ov === 'object' && !Array.isArray(base)) {
      const out = { ...base };
      for (const [k, v] of Object.entries(ov)) {
        if (RESERVED.has(k)) continue;
        out[k] = this._mergePuzzleConfig(base[k], v);
      }
      return out;
    }
    return ov !== undefined ? ov : base;
  }

  start() {
    this.startTime = Date.now();
    const startRoom = this.rooms.find(r => r.unlocked_by === null);
    this.revealCard(startRoom ? startRoom.card_id : 1);
  }

  revealCard(id) {
    const card = this.cards[id];
    if (!card || this.consumedCards.has(id)) return null;
    this.visibleCards.add(id);
    this.revealedCards.add(id);

    // Track unlocked rooms
    if (card.type === 'location') {
      if (!this.unlockedRooms.includes(id)) {
        this.unlockedRooms.push(id);
        if (this.onLeaderboardEvent) this.onLeaderboardEvent('room_unlocked', { roomId: id });
      }
      this.currentRoom = id;
    }

    // Auto-reveal linked cards
    if (card.reveals) {
      card.reveals.forEach(rid => this.revealCard(rid));
    }

    // Items go to inventory
    if (card.type === 'item' && !this.inventory.includes(id)) {
      this.inventory.push(id);
      this.revealQueue.push(card);
    }

    // Lore auto-revealed
    if (card.type === 'lore') {
      this.revealQueue.push(card);
    }

    // Event cards consume other cards and award new items
    if (card.consumes) {
      card.consumes.forEach(cid => {
        const consumed = this.cards[cid];
        if (consumed) this.lastConsumed.push(consumed);
        this.consumedCards.add(cid);
        this.visibleCards.delete(cid);
        this.inventory = this.inventory.filter(i => i !== cid);
      });
    }
    if (card.awards) {
      card.awards.forEach(aid => this.revealCard(aid));
    }

    // Penalty cards — auto-dismiss from visible (shown via toast)
    if (card.type === 'penalty') {
      this.penalties++;
      this.penaltySeconds += card.penalty_seconds || 0;
      if (this.onLeaderboardEvent) this.onLeaderboardEvent('penalty', { seconds: card.penalty_seconds || 0, reason: card.title });
      if (card.returns_items) {
        card.returns_items.forEach(rid => {
          if (!this.inventory.includes(rid)) this.inventory.push(rid);
        });
      }
      this.visibleCards.delete(id);
    }

    // Event cards — auto-dismiss from visible after processing
    if (card.type === 'event') {
      this.visibleCards.delete(id);
    }

    // Ending
    if (card.is_ending) {
      this.finished = true;
      this.completed = true;
      this.endTime = Date.now();
      if (this.onLeaderboardEvent) this.onLeaderboardEvent('game_complete', { score: this.getScore() });
    }

    this._notify();
    return card;
  }

  navigateToRoom(roomCardId) {
    if (!this.unlockedRooms.includes(roomCardId)) return;
    this.currentRoom = roomCardId;
    this._notify();
  }

  getUnlockedRooms() {
    return this.unlockedRooms.map(id => {
      const card = this.cards[id];
      const roomDef = this.rooms.find(r => r.card_id === id);
      const hasPuzzle = card.puzzle_ref && !this.solvedPuzzles.has(card.puzzle_ref);
      const isCurrent = id === this.currentRoom;
      const connectsTo = (roomDef?.connects_to || [])
        .filter(cid => this.unlockedRooms.includes(cid))
        .map(cid => this.t('cards', cid, 'title') || this.cards[cid]?.title || `Room #${cid}`);
      return {
        id,
        title: this.t('cards', id, 'title') || roomDef?.name || card.title,
        description: this.t('cards', id, 'description') || roomDef?.description || '',
        room: card.room,
        isCurrent,
        hasUnsolved: !!hasPuzzle,
        unlockText: this.t('rooms', id, 'unlock_text') || roomDef?.unlock_text || '',
        connectsTo,
      };
    });
  }

  tryCombination(idA, idB) {
    this.lastConsumed = [];
    const lo = Math.min(idA, idB);
    const hi = Math.max(idA, idB);
    const combo = this.combinations.find(c =>
      (Math.min(c.card_a, c.card_b) === lo && Math.max(c.card_a, c.card_b) === hi)
    );
    if (combo) {
      return this.revealCard(combo.result_card);
    }
    // No matching combo — no penalty, just feedback
    this._notify();
    return { type: 'nothing', title: 'Nothing happens.', description: 'These items don\'t seem to work together.' };
  }

  tryHiddenNumber(cardId, number) {
    const card = this.cards[cardId];
    if (!card || !card.hidden_elements) return false;
    const match = card.hidden_elements.find(h => h.value === number);
    if (match) {
      this.solvedPuzzles.add(card.puzzle_ref);
      if (this.onLeaderboardEvent) this.onLeaderboardEvent('puzzle_solved', { puzzleId: card.puzzle_ref });
      return this.discoverCard(number);
    }
    return false;
  }

  tryCodeEntry(puzzleId, answer) {
    const puzzle = this.puzzles[puzzleId];
    if (!puzzle) return { correct: false, message: 'Unknown puzzle.' };

    const solution = puzzle.solution;
    let correct = false;
    if (solution.type === 'text') {
      const a = solution.case_sensitive ? answer : answer.toLowerCase();
      const s = solution.case_sensitive ? solution.value : solution.value.toLowerCase();
      correct = a === s;
    } else if (solution.type === 'card_number') {
      correct = parseInt(answer) === solution.value;
    }

    if (correct) {
      this.solvedPuzzles.add(puzzleId);
      if (this.onLeaderboardEvent) this.onLeaderboardEvent('puzzle_solved', { puzzleId });
      if (puzzle.success_card) {
        this.revealCard(puzzle.success_card);
      }
      return { correct: true, message: 'Correct!' };
    }

    if (puzzle.penalty_on_wrong !== false) {
      this.penalties++;
      this.penaltySeconds += 60;
      if (this.onLeaderboardEvent) this.onLeaderboardEvent('penalty', { seconds: 60, reason: 'wrong_answer' });
    }
    this._notify();
    return { correct: false, message: puzzle.wrong_answer_message || 'Incorrect. Try again.' };
  }

  getHint(puzzleId) {
    const puzzle = this.puzzles[puzzleId];
    if (!puzzle || !puzzle.hints) return null;

    // Show tooltip on first hint
    let tooltip = null;
    if (!this.hintTooltipShown) {
      this.hintTooltipShown = true;
      const te = (this.events.triggered_events || []).find(e => e.trigger === 'first_hint_request');
      if (te) tooltip = te.message;
    }

    const used = puzzle._hintsUsed || 0;
    if (used >= puzzle.hints.length) return { hint: puzzle.hints[puzzle.hints.length - 1], tooltip };
    puzzle._hintsUsed = used + 1;
    this.hintsUsed++;
    if (this.onLeaderboardEvent) this.onLeaderboardEvent('hint_used', { puzzleId });
    this._notify();
    return { hint: puzzle.hints[used], tooltip };
  }

  getElapsedSeconds() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return Math.floor((end - this.startTime) / 1000) + this.penaltySeconds + (this.timeInvested || 0);
  }

  getRemainingSeconds() {
    return Math.max(0, this.meta.duration_minutes * 60 - this.getElapsedSeconds());
  }

  getScore() {
    const s = this.scoring;
    const minutesLeft = Math.floor(this.getRemainingSeconds() / 60);
    const base = this.completed ? s.base_score : 0;
    let score = base + (minutesLeft * s.time_bonus_per_minute) + (this.hintsUsed * s.hint_penalty) + (this.penalties * s.wrong_combination_penalty);
    score = Math.max(0, score);
    const star = s.stars.find(st => score >= st.min) || { stars: 1 };
    return { score, stars: star.stars, hintsUsed: this.hintsUsed, penalties: this.penalties, minutesLeft, completed: this.completed };
  }

  getVisibleCardsByType() {
    const result = { locations: [], objects: [], items: [], events: [], penalties: [], lore: [] };
    for (const id of this.visibleCards) {
      const card = this.cards[id];
      if (!card) continue;
      const bucket = result[card.type + 's'] || result[card.type];
      if (bucket) bucket.push(card);
    }
    return result;
  }

  getActiveRoom() {
    return this.currentRoom ? this.cards[this.currentRoom] : null;
  }

  getCurrentRoomObjects() {
    return [...this.visibleCards]
      .map(id => this.cards[id])
      .filter(c => c && c.type === 'object' && !this.consumedCards.has(c.id));
  }

  getInventoryItems() {
    return this.inventory.map(id => this.cards[id]).filter(Boolean);
  }

  getConsumedCards() {
    return [...this.consumedCards].map(id => this.cards[id]).filter(c => c && (c.type === 'item' || c.type === 'object'));
  }

  discoverCard(cardId) {
    if (this.discoveredCards.has(cardId) || this.consumedCards.has(cardId)) return null;
    this.discoveredCards.add(cardId);

    // Check if this discovery consumes items (before revealCard changes currentRoom)
    const room = this.getActiveRoom();
    if (room && room.discoveries) {
      const disc = room.discoveries.find(d => d.card_id === cardId);
      if (disc && disc.consumes_item) {
        const items = Array.isArray(disc.consumes_item) ? disc.consumes_item : [disc.consumes_item];
        items.forEach(id => {
          this.consumedCards.add(id);
          this.visibleCards.delete(id);
          this.inventory = this.inventory.filter(i => i !== id);
        });
      }
    }

    return this.revealCard(cardId);
  }

  getUndiscoveredInRoom() {
    return this.getAllDiscoveriesInRoom().filter(d => !d.done && d.available);
  }

  getAllDiscoveriesInRoom() {
    const room = this.getActiveRoom();
    if (!room || !room.discoveries) return [];
    return room.discoveries.map(d => {
      const done = this.discoveredCards.has(d.card_id) || this.consumedCards.has(d.card_id);
      let available = true;
      if (!done && d.requires_item) {
        const reqs = Array.isArray(d.requires_item) ? d.requires_item : [d.requires_item];
        if (!reqs.every(r => this.inventory.includes(r) || this.visibleCards.has(r) || this.discoveredCards.has(r) || this.revealedCards.has(r))) available = false;
      }
      return { ...d, done, available: done || available };
    });
  }

  _notify() {
    this.saveState();
    if (this.onUpdate) this.onUpdate();
  }

  syncTimer(timer) {
    if (!timer) return;
    this.serverTimer = timer;
    this.serverTimerAt = Date.now();
    this.saveState();
  }

  saveState() {
    const key = `utc_${this.meta.id || 'game'}`;
    const state = {
      visibleCards: [...this.visibleCards],
      inventory: this.inventory,
      consumedCards: [...this.consumedCards],
      solvedPuzzles: [...this.solvedPuzzles],
      currentRoom: this.currentRoom,
      unlockedRooms: this.unlockedRooms,
      discoveredCards: [...this.discoveredCards],
      revealedCards: [...this.revealedCards],
      hintsUsed: this.hintsUsed,
      penalties: this.penalties,
      penaltySeconds: this.penaltySeconds,
      startTime: this.startTime,
      endTime: this.endTime,
      finished: this.finished,
      completed: this.completed,
      hintTooltipShown: this.hintTooltipShown,
      hintsPerPuzzle: {},
      uuid: this.uuid,
      playerName: this.playerName,
      serverTimer: this.serverTimer,
      serverTimerAt: this.serverTimerAt,
    };
    // Save per-puzzle hint counts
    for (const [id, p] of Object.entries(this.puzzles)) {
      if (p._hintsUsed) state.hintsPerPuzzle[id] = p._hintsUsed;
    }
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }

  restoreState() {
    const key = `utc_${this.meta.id || 'game'}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const s = JSON.parse(raw);
      // Reject stale saves where currentRoom doesn't exist in loaded cards
      if (s.currentRoom && !this.cards[s.currentRoom]) {
        localStorage.removeItem(key);
        return false;
      }
      this.visibleCards = new Set(s.visibleCards);
      this.inventory = s.inventory;
      this.consumedCards = new Set(s.consumedCards);
      this.solvedPuzzles = new Set(s.solvedPuzzles);
      this.currentRoom = s.currentRoom;
      this.unlockedRooms = s.unlockedRooms;
      this.discoveredCards = new Set(s.discoveredCards);
      this.revealedCards = new Set(s.revealedCards || []);
      this.hintsUsed = s.hintsUsed;
      this.penalties = s.penalties;
      this.penaltySeconds = s.penaltySeconds;
      this.startTime = s.startTime;
      this.endTime = s.endTime;
      this.finished = s.finished;
      this.completed = s.completed;
      this.hintTooltipShown = s.hintTooltipShown;
      if (s.hintsPerPuzzle) {
        for (const [id, count] of Object.entries(s.hintsPerPuzzle)) {
          if (this.puzzles[id]) this.puzzles[id]._hintsUsed = count;
        }
      }
      this.uuid = s.uuid || null;
      this.playerName = s.playerName || null;
      this.serverTimer = s.serverTimer || null;
      this.serverTimerAt = s.serverTimerAt || null;
      this.revealQueue = [];
      return true;
    } catch { return false; }
  }

  clearSave() {
    const key = `utc_${this.meta.id || 'game'}`;
    try { localStorage.removeItem(key); } catch {}
  }
}


/* Leaderboard Client — queue-based event submission with retry */
class LeaderboardClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || 'https://9ean11i2e8.execute-api.ap-southeast-5.amazonaws.com/prod';
    this.gameId = null;
    this.playerId = null;
    this.queue = [];
    this._flushing = false;
    this._flushInterval = null;
    this._storageKey = 'utc_lb_queue';
    this._loadQueue();
    // Server-driven end detection
    this._lastGameStatus = null;       // last status seen from GET /games/{id}
    this.onGameEnded = null;           // callback(game) — fired once when server flips status to 'ended'
  }

  // Legacy compat
  get uuid() { return this.playerId; }
  set uuid(v) { this.playerId = v; }

  _loadQueue() {
    try { this.queue = JSON.parse(localStorage.getItem(this._storageKey)) || []; } catch { this.queue = []; }
  }

  _saveQueue() {
    try { localStorage.setItem(this._storageKey, JSON.stringify(this.queue)); } catch {}
  }

  startPeriodicFlush(intervalMs) {
    this._flushInterval = setInterval(() => {
      this.flush();
      // Always poll game status, even when the event queue is empty,
      // so we can detect server-driven game ends (timeout / host force-close).
      this._pollGameStatus();
    }, intervalMs || 10000);
  }

  stopPeriodicFlush() {
    if (this._flushInterval) { clearInterval(this._flushInterval); this._flushInterval = null; }
  }

  async _pollGameStatus() {
    const game = await this.getGame();
    this._handleGameState(game);
  }

  _handleGameState(game) {
    if (!game || !game.status) return;
    const prev = this._lastGameStatus;
    this._lastGameStatus = game.status;
    // Fire the ended callback exactly once on the transition into 'ended'.
    if (prev !== 'ended' && game.status === 'ended' && typeof this.onGameEnded === 'function') {
      try { this.onGameEnded(game); } catch (e) { /* swallow — UI handler errors must not break polling */ }
    }
  }

  push(event, payload) {
    this.queue.push({ event, ...payload, ts: Date.now() });
    this._saveQueue();
  }

  async register(playerName, scenarioId, gameId) {
    if (!gameId) return null;
    this.gameId = gameId;
    try {
      const r = await fetch(`${this.baseUrl}/games/${gameId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName })
      });
      if (r.status === 400) {
        const d = await r.json();
        if (d.error && d.error.includes('full')) return { _rejected: true, gameState: 'FULL' };
        return null;
      }
      if (!r.ok) return null;
      const res = await r.json();
      if (res && res.player_id) {
        this.playerId = res.player_id;
        // Check game status to determine if ready
        const game = await this.getGame();
        const ready = game && game.status === 'in_progress';
        return { uuid: res.player_id, ready, timer: game && game.started_at ? this._calcTimer(game) : null };
      }
      return null;
    } catch { return null; }
  }

  async getGame() {
    if (!this.gameId) return null;
    try {
      const r = await fetch(`${this.baseUrl}/games/${this.gameId}`);
      if (!r.ok) return null;
      return r.json();
    } catch { return null; }
  }

  async status() {
    const game = await this.getGame();
    if (!game) return null;
    const ready = game.status === 'in_progress';
    return { ready, timer: game.started_at ? this._calcTimer(game) : null };
  }

  _calcTimer(game) {
    if (!game.started_at || !game.target_duration_seconds) return null;
    const started = new Date(game.started_at).getTime();
    const elapsed = Math.floor((Date.now() - started) / 1000);
    const remaining = Math.max(0, game.target_duration_seconds - elapsed);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  _mapEvent(ev) {
    // Map our engine events to backend action format
    switch (ev.event) {
      case 'puzzle_solved':
        return { action: 'complete_puzzle', puzzle_id: ev.puzzleId };
      case 'hint_used':
        return { action: 'used_hint', seconds: 60 };
      case 'penalty':
        return { action: 'wrong_move', seconds: ev.seconds || 30 };
      case 'room_unlocked':
        return { action: 'room_unlocked', room_id: ev.roomId };
      case 'game_complete':
        return null; // Backend handles this implicitly on last puzzle
      default:
        return null;
    }
  }

  async flush() {
    if (this._flushing || !this.playerId || !this.gameId || !this.queue.length) return null;
    this._flushing = true;
    const batch = this.queue.splice(0);
    this._saveQueue();
    try {
      const url = `${this.baseUrl}/games/${this.gameId}/players/${this.playerId}/action`;
      for (const ev of batch) {
        const body = this._mapEvent(ev);
        if (!body) continue;
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }
      this._flushing = false;
      // Return timer from game state
      const game = await this.getGame();
      this._handleGameState(game);
      return game ? { timer: this._calcTimer(game) } : null;
    } catch {
      this.queue.unshift(...batch);
      this._saveQueue();
      this._flushing = false;
      return null;
    }
  }
}
