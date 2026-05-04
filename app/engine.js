/* Unlock the Cloud — Game Engine */

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
      if (!this.unlockedRooms.includes(id)) this.unlockedRooms.push(id);
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
        .map(cid => this.cards[cid]?.title || `Room #${cid}`);
      return {
        id,
        title: roomDef?.name || card.title,
        description: roomDef?.description || '',
        room: card.room,
        isCurrent,
        hasUnsolved: !!hasPuzzle,
        unlockText: roomDef?.unlock_text || '',
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
      if (puzzle.success_card) {
        this.revealCard(puzzle.success_card);
      }
      return { correct: true, message: 'Correct!' };
    }

    if (puzzle.penalty_on_wrong !== false) {
      this.penalties++;
      this.penaltySeconds += 60;
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
    this._notify();
    return { hint: puzzle.hints[used], tooltip };
  }

  getElapsedSeconds() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return Math.floor((end - this.startTime) / 1000) + this.penaltySeconds + (this.timeInvested || 0);
  }

  getRemainingSeconds() {
    return this.meta.duration_minutes * 60 - this.getElapsedSeconds();
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
      this.revealQueue = [];
      return true;
    } catch { return false; }
  }

  clearSave() {
    const key = `utc_${this.meta.id || 'game'}`;
    try { localStorage.removeItem(key); } catch {}
  }
}
