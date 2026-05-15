const _params = new URLSearchParams(location.search);
let SCENARIO_BASE = _params.get('scenario') || null;
const EVENT_ID = _params.get('game_id') || _params.get('event') || null;
const _gmParam = _params.get('gameMode');
if (_gmParam) localStorage.setItem('gameMode', _gmParam);

// Resolve scenario from game_id if not in URL (requires backend scenario_id support)
if (!SCENARIO_BASE && EVENT_ID) {
  try {
    const _xhr = new XMLHttpRequest();
    _xhr.open('GET', `https://9ean11i2e8.execute-api.ap-southeast-5.amazonaws.com/prod/games/${EVENT_ID}`, false);
    _xhr.send();
    if (_xhr.status === 200) {
      const _gd = JSON.parse(_xhr.responseText);
      const _cat = _gd.scenario_id;
      const _ep = _gd.games_config && _gd.games_config.episodes && _gd.games_config.episodes[0];
      if (_cat && _ep) SCENARIO_BASE = '../scenarios/' + _cat + '/' + _ep;
      else if (_cat) SCENARIO_BASE = '../scenarios/' + _cat;
    }
  } catch {}
}
if (!SCENARIO_BASE) SCENARIO_BASE = '../scenarios/aws/ep0-boot-sequence';

const ASSET_BASE = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  ? SCENARIO_BASE
  : 'https://beta.re-solve.cloud/' + SCENARIO_BASE.replace(/^\.\.\//, '');
const engine = new GameEngine(ASSET_BASE);
window.engine = engine;
const leaderboard = new LeaderboardClient();
const GUEST_MODE = new URLSearchParams(location.search).get('mode') === 'guest';
engine.onLeaderboardEvent = (event, payload) => {
  if (GUEST_MODE) return;
  leaderboard.push(event, payload);
  if (event === 'game_complete') leaderboard.flush().then(res => { if (res && res.timer) engine.syncTimer(res.timer); });
  // History log
  _historyLog(event, payload);
};

// Flush events on page close/hide to prevent data loss
window.addEventListener('beforeunload', () => { if (!GUEST_MODE) leaderboard.flush(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && !GUEST_MODE) leaderboard.flush(); });

// --- History Panel ---
const _history = [];
function _historyLog(event, payload) {
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  let msg = event;
  if (event === 'puzzle_solved') msg = `✅ Puzzle solved: ${payload.puzzleId}`;
  else if (event === 'room_unlocked') { const rm = engine.rooms && engine.rooms.find(r => r.card_id === payload.roomId); msg = `🚪 Room unlocked: ${rm ? rm.name : payload.roomId}`; }
  else if (event === 'card_discovered') msg = `${payload.type === 'item' ? '🔴' : payload.type === 'location' ? '🟢' : '🔵'} ${payload.title}`;
  else if (event === 'penalty') msg = `⚠️ Penalty: -${payload.seconds}s`;
  else if (event === 'hint_used') msg = `💡 Hint used`;
  else if (event === 'game_complete') msg = `🏆 Game complete!`;
  _history.push({ time, msg });
  _renderHistory();
}
function _renderHistory() {
  const el = document.getElementById('history-panel');
  if (!el || el.style.display === 'none') return;
  el.innerHTML = _history.slice().reverse().map(h => `<div style="padding:4px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);margin-right:8px">${h.time}</span>${h.msg}</div>`).join('');
}
function toggleHistory() {
  const el = document.getElementById('history-panel');
  if (el.style.display === 'none') { el.style.display = ''; _renderHistory(); }
  else { el.style.display = 'none'; }
}

let combineMode = false;
let selectedCards = [];

// ── SFX System (Web Audio API) ──
const sfxCtx = { ac: null };
function _ac() { if (!sfxCtx.ac) sfxCtx.ac = new (window.AudioContext || window.webkitAudioContext)(); return sfxCtx.ac; }
function _tone(freq, dur, type, vol) {
  const ac = _ac(); const o = ac.createOscillator(); const g = ac.createGain();
  o.type = type || 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(vol || 0.15, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
}
const SFX = {
  discover()  { _tone(600, 0.1, 'sine'); setTimeout(() => _tone(800, 0.15, 'sine'), 80); },
  solve()     { _tone(523, 0.1, 'sine'); setTimeout(() => _tone(659, 0.1, 'sine'), 100); setTimeout(() => _tone(784, 0.2, 'sine'), 200); },
  wrong()     { _tone(200, 0.15, 'square', 0.1); setTimeout(() => _tone(150, 0.25, 'square', 0.1), 120); },
  lore()      { _tone(440, 0.15, 'sine'); setTimeout(() => _tone(554, 0.12, 'sine'), 100); setTimeout(() => _tone(659, 0.12, 'sine'), 200); setTimeout(() => _tone(880, 0.3, 'sine'), 300); },
  unlock()    { _tone(400, 0.08, 'triangle'); setTimeout(() => _tone(500, 0.08, 'triangle'), 70); setTimeout(() => _tone(700, 0.15, 'triangle'), 140); },
  warning()   { _tone(800, 0.1, 'square', 0.12); setTimeout(() => _tone(600, 0.1, 'square', 0.12), 150); setTimeout(() => _tone(800, 0.1, 'square', 0.12), 300); },
  complete()  { [523,659,784,1047].forEach((f,i) => setTimeout(() => _tone(f, 0.3, 'sine', 0.12), i*150)); },
  pour()      { _tone(300, 0.4, 'sine', 0.06); },
  fall()      { _tone(400, 0.08, 'sawtooth', 0.1); setTimeout(() => _tone(200, 0.3, 'sawtooth', 0.08), 80); },
  bump()      { _tone(150, 0.15, 'square', 0.08); },
};
let timerInterval = null;
let currentPuzzleId = null;
let activePuzzlePopupId = null;
let lastEvent = null;
let lastPenalty = null;
let visitedRooms = new Set();
let lastKnownRoomCount = 0;
let lastPopupCard = null;

let currentAudio = null;
let currentNarrativeKey = null; // 'intro' or 'ending_success'

function playVoice(file) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  currentAudio = new Audio(`${ASSET_BASE}/assets/voice/${file}`);
  currentAudio.play().catch(() => {});
  document.getElementById('nar-play-btn').classList.add('playing');
  currentAudio.onended = () => {
    document.getElementById('nar-play-btn').classList.remove('playing');
  };
}
function stopVoice() {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  document.getElementById('nar-play-btn').classList.remove('playing');
}

function setNarrative(key) {
  currentNarrativeKey = key;
  document.getElementById('narrative-bar').classList.add('active');
  document.getElementById('narrative-panel').classList.remove('open');
  renderNarrativeText();
}

function replayNarrative() {
  if (!currentNarrativeKey) return;
  const fileMap = { intro: 'intro.wav', ending_success: 'ending_success.wav' };
  const file = fileMap[currentNarrativeKey];
  if (file) playVoice(file);
}

function toggleNarrativeText() {
  const panel = document.getElementById('narrative-panel');
  panel.classList.toggle('open');
}

function renderNarrativeText() {
  const panel = document.getElementById('narrative-panel');
  const n = engine.narrative;
  let segments = [];
  const voices = n.voices || {};

  if (currentNarrativeKey === 'intro' && n.intro) {
    segments = n.intro.segments || [{ text: (n.intro.text || []).join(' ') }];
  } else if (currentNarrativeKey === 'ending_success' && n.ending?.success) {
    segments = n.ending.success.segments || [{ text: (n.ending.success.text || []).join(' ') }];
  }

  panel.innerHTML = segments.map(s => {
    const voice = voices[s.voice];
    const label = voice ? `<span class="nar-voice">${s.voice}</span> ` : '';
    return `<p>${label}${s.text || (s.ssml || '').replace(/<[^>]+>/g, '')}</p>`;
  }).join('');
}

const ADMIN = new URLSearchParams(location.search).get('admin') === 'true';

(async () => {
  await engine.load();
  engine.onUpdate = () => { renderGame(); renderAdmin(); };
  window._cafeOrderBadgeUpdate = () => {
    const pending = typeof CafeOrderLock !== 'undefined' ? CafeOrderLock.getPending() : 0;
    setBadge('badge-cafe', pending);
  };
  if (GUEST_MODE) {
    document.getElementById('player-name-input').style.display = 'none';
    document.getElementById('guest-badge').style.display = '';
  }
  initAdmin();
  if (engine.restoreState() && engine.startTime && !engine.finished) {
    if (!GUEST_MODE && engine.uuid) { leaderboard.gameId = EVENT_ID; leaderboard.uuid = engine.uuid; leaderboard.startPeriodicFlush(10000); }
    showScreen('game-screen');
    document.getElementById('timer').style.visibility = 'visible';
    lastKnownRoomCount = engine.unlockedRooms.length;
    timerInterval = setInterval(updateTimer, 1000);
    setNarrative('intro');
    renderGame();
    showToast('Game restored', false);
  } else if (engine.restoreState() && engine.finished) {
    showScreen('game-screen');
    showEndScreen();
  } else {
    renderIntro();
    showScreen('intro-screen');
    playVoice('intro.wav');
  }

  // Prevent Back button from leaving the game
  history.pushState(null, '', location.href);
  window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
  });
})();

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('bottom-bar').style.display = id === 'game-screen' ? 'flex' : 'none';
  document.getElementById('main').style.display = id === 'game-screen' || id === 'intro-screen' || id === 'end-screen' ? '' : 'none';
}

function renderIntro() {
  const intro = engine.narrative.intro;
  const el = document.getElementById('intro-text');
  const segments = intro.segments || [{ text: (intro.text || []).join(' ') }];
  el.innerHTML = segments.map(s => `<p>${s.text || (s.ssml || '').replace(/<[^>]+>/g, '')}</p>`).join('');
  document.querySelector('#intro-screen h2').textContent = `Episode ${engine.meta.episode}: ${engine.meta.title}`;
  document.getElementById('intro-cover').src = `${ASSET_BASE}/assets/cover.png`;
  document.getElementById('intro-cover').alt = engine.meta.title;
  document.getElementById('start-btn').textContent = engine.meta.start_button || 'Start';
}

async function startGame() {
  const nameInput = document.getElementById('player-name-input');
  const playerName = (nameInput.value || '').trim();
  if (!GUEST_MODE && !playerName) { showToast('Please enter your name.', true); return; }
  engine.playerName = playerName || 'Anonymous';

  if (!GUEST_MODE) {
    document.getElementById('start-btn').disabled = true;
    const reg = await leaderboard.register(playerName, engine.meta.id, EVENT_ID);
    if (reg && reg._rejected && reg.gameState === 'FULL') {
      document.getElementById('start-btn').disabled = false;
      document.getElementById('guest-badge').style.display = '';
      showToast('Event is full. Starting as guest — your score won\'t appear on the leaderboard.', true);
      // Fall through as guest — skip all leaderboard interaction
    } else if (!reg || !reg.uuid) {
      document.getElementById('start-btn').disabled = false;
      if (EVENT_ID) {
        showToast('Could not connect to server. Try again.', true);
        return;
      }
      // No event — just start as guest silently
    } else {
      engine.uuid = reg.uuid;
      leaderboard.uuid = reg.uuid;

      // Check if event is ready to start (only for event-based play)
      if (!reg.ready && EVENT_ID) {
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('player-name-input').style.display = 'none';
        document.getElementById('waiting-state').style.display = 'block';
        await pollUntilReady();
      }
      if (reg.timer) engine.syncTimer(reg.timer);
      leaderboard.startPeriodicFlush(10000);
    }
  }

  engine.clearSave();
  showScreen('game-screen');
  engine.start();
  document.getElementById('timer').style.visibility = 'visible';
  lastKnownRoomCount = engine.unlockedRooms.length;
  setNarrative('intro');
  timerInterval = setInterval(updateTimer, 1000);
  renderGame();
}

async function pollUntilReady() {
  while (true) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await leaderboard.status();
    if (res && res.ready) {
      if (res.timer) engine.syncTimer(res.timer);
      return;
    }
  }
}

function updateTimer() {
  let remaining;
  if (engine.serverTimer && engine.serverTimerAt) {
    // Parse server timer "MM:SS" and subtract local elapsed since last sync
    const parts = engine.serverTimer.split(':');
    const serverSecs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    const localElapsed = Math.floor((Date.now() - engine.serverTimerAt) / 1000);
    remaining = serverSecs - localElapsed;
  } else {
    remaining = engine.getRemainingSeconds();
  }
  const abs = Math.abs(remaining);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  const el = document.getElementById('timer');
  const neg = remaining < 0 ? '-' : '';
  el.textContent = `${neg}${m}:${String(s).padStart(2, '0')}`;
  el.className = remaining <= 0 ? 'critical' : remaining <= 60 ? 'critical' : remaining <= 180 ? 'warning' : '';
  if (remaining <= 0 && !engine._timerExpired) {
    engine._timerExpired = true;
    showToast('⏱️ Time expired! You can keep playing but your score will reflect the overtime.', true);
  }
  if (engine.finished) clearInterval(timerInterval);
}

// --- Browse panels ---
function togglePanel() {}
function closeAllPanels() {}

// --- Render game ---
function renderGame() {
  if (engine.finished) { showEndScreen(); return; }
  const room = engine.getActiveRoom();
  const items = engine.getInventoryItems();
  const objects = engine.getCurrentRoomObjects();

  // Center room
  if (room) {
    let img = room.image ? `<img class="room-img" src="${ASSET_BASE}/${room.image}" alt="${room.title}" onerror="this.style.display='none'">` : '';
    let extra = '';
    if (room.hidden_elements && !engine.solvedPuzzles.has(room.puzzle_ref)) {
      const hp = engine.puzzles[room.puzzle_ref] || {};
      const hPlaceholder = hp.placeholder || 'Enter number';
      const hButton = hp.button_label || 'Submit';
      extra += `<div class="hidden-input"><input type="number" id="hidden-input-${room.id}" placeholder="${hPlaceholder}" inputmode="numeric"><button class="btn btn-sm btn-primary" onclick="tryHidden(${room.id})">${hButton}</button></div>`;
    }
    if (room.puzzle_ref && engine.puzzles[room.puzzle_ref] && engine.puzzles[room.puzzle_ref].type === 'code_entry' && !engine.solvedPuzzles.has(room.puzzle_ref)) {
      const p = engine.puzzles[room.puzzle_ref];
      if (p.puzzle_ui === 'word_lock') {
        extra += `<div id="word-lock-mount" data-puzzle="${room.puzzle_ref}"></div>`;
      } else {
        extra += `<div class="code-entry"><input type="text" id="code-input-${room.puzzle_ref}" placeholder="Enter code..." autocomplete="off"><button class="btn btn-sm btn-primary" onclick="tryCode('${room.puzzle_ref}')">Submit</button></div>`;
      }
      if (p.tools_available && p.tools_available.includes('base64_decoder')) {}
    }
    const container = document.getElementById('room-container');
    const roomChanged = container.dataset.roomId !== String(room.id);

    // Banners (always update)
    let banners = '';
    if (lastEvent) banners += `<div class="event-banner"><div class="ev-title">${lastEvent.title}</div><div class="ev-desc">${lastEvent.description}</div></div>`;
    if (lastPenalty) banners += `<div class="penalty-banner"><div class="pen-title">${lastPenalty.title}</div><div class="pen-desc">${lastPenalty.description}</div></div>`;
    const existingBanners = container.querySelectorAll('.event-banner,.penalty-banner');
    existingBanners.forEach(b => b.remove());
    if (banners) container.insertAdjacentHTML('afterbegin', banners);

    if (roomChanged) {
      container.dataset.roomId = String(room.id);
      if (visitedRooms.has(room.id)) {
        showRoomBanner(room.title);
      } else {
        visitedRooms.add(room.id);
        showRoomBanner(room.title);
      }
      let roomHtml = banners;
      if (room.image) {
        img = `<img class="room-img" src="${ASSET_BASE}/${room.image}" alt="${room.title}" onload="this.parentElement.style.opacity=1" onerror="this.style.display='none';this.parentElement.style.opacity=1">`;
        roomHtml += `<div class="room-card" style="opacity:0;transition:opacity 1.5s ease">${img}<div class="room-title">${room.title}</div><div class="room-desc">${room.description}</div>${extra}</div>`;
      } else {
        roomHtml += `<div class="room-card room-fadein">${img}<div class="room-title">${room.title}</div><div class="room-desc">${room.description}</div>${extra}</div>`;
      }

      roomHtml += buildDiscoveryHtml();

      container.innerHTML = roomHtml;
      mountWordLock();
    } else {
      // Same room — only update discovery buttons
      const existingDisc = container.querySelector('.discoveries');
      if (existingDisc) existingDisc.remove();
      const discHtml = buildDiscoveryHtml();
      if (discHtml) container.insertAdjacentHTML('beforeend', discHtml);
    }

    currentPuzzleId = room.puzzle_ref || null;
  }

  // Interact badge (items + objects count)
  setBadge('badge-interact', items.length + objects.length);

  // Notify when new rooms unlock
  const roomCount = engine.unlockedRooms.length;
  if (roomCount > lastKnownRoomCount && lastKnownRoomCount > 0) {
    const newRooms = engine.unlockedRooms.slice(lastKnownRoomCount);
    newRooms.forEach(cardId => {
      const roomDef = engine.rooms.find(r => r.card_id === cardId);
      const card = engine.cards[cardId];
      showRoomUnlock(roomDef?.name || card?.title || 'Unknown Area');
    });
  }
  lastKnownRoomCount = roomCount;

  // If combine screen is open, update it too
  if (combineMode) renderCombineCards();

  // Show toasts for auto-revealed items/lore
  if (engine.revealQueue && engine.revealQueue.length) {
    const queue = engine.revealQueue.splice(0);
    queue.forEach((card, i) => {
      setTimeout(() => {
        const icon = card.type === 'item' ? '🔴' : '🟣';
        const loreLabel = engine.meta.lore_label || 'Memory Fragment';
        const label = card.type === 'item' ? 'Item acquired' : loreLabel;
        showToast(`${icon} ${label}: ${card.title}`, false);
        if (card.type === 'lore') SFX.lore(); else SFX.discover();
      }, i * 800);
    });
  }
}

function renderCard(card, selectable) {
  const selected = selectedCards.includes(card.id);
  // Dim unselected cards of same type when one is already picked
  let dimmed = false;
  if (selectable && !selected) {
    const sameTypePicked = selectedCards.some(sid => engine.cards[sid]?.type === card.type);
    if (sameTypePicked) dimmed = true;
  }
  const cls = `card ${card.color} ${selectable ? 'selectable' : ''} ${selected ? 'selected' : ''} ${dimmed ? 'dimmed' : ''}`;
  const onclick = selectable ? `onclick="toggleSelect(${card.id})"` : '';
  const flavor = card.flavor_text ? `<div class="card-flavor">${card.flavor_text}</div>` : '';
  const img = card.image ? `<img style="width:100%;max-height:60px;object-fit:contain;border-radius:6px;margin-bottom:8px" src="${ASSET_BASE}/${card.image}" onerror="this.style.display='none'">` : '';
  return `<div class="${cls}" ${onclick}>${img}<div class="card-header"><span class="card-title">${card.title}</span><span class="card-id">#${card.id}</span></div><div class="card-desc">${card.description}</div>${flavor}</div>`;
}

function setBadge(id, n) {
  const el = document.getElementById(id);
  if (n > 0) { el.style.display = 'flex'; el.textContent = n; } else el.style.display = 'none';
}

function buildDiscoveryHtml() {
  const all = engine.getAllDiscoveriesInRoom();
  const active = all.filter(d => !d.done && d.available);
  const done = all.filter(d => d.done);
  if (!active.length && !done.length) return '';
  let html = '<div class="discoveries">';
  active.forEach(d => {
    const puzzle = d.puzzle ? engine.puzzles[d.puzzle] : null;
    const isTool = puzzle && puzzle.type === 'tool';
    const isNpc = isTool && puzzle.ui === 'npc-dialog';
    const icon = isNpc ? (puzzle.config?.portrait || '🧑') : isTool ? '🔧' : d.puzzle ? '🔒' : '👁';
    const cls = isTool ? 'discover-btn tool-btn' : 'discover-btn';
    let subtitle = '';
    if (d.requires_item) {
      const reqs = Array.isArray(d.requires_item) ? d.requires_item : [d.requires_item];
      const names = reqs.map(id => engine.cards[id]?.title || '').filter(Boolean);
      if (names.length) subtitle = `<div style="font-size:10px;color:var(--green);margin-top:2px;opacity:.7">🔓 ${names.join(' + ')}</div>`;
    }
    html += `<button class="${cls}" onclick="discover(${d.card_id},'${d.puzzle||''}')"><span class="discover-icon">${icon}</span><div>${d.label}${subtitle}</div></button>`;
  });
  done.forEach(d => {
    const card = engine.cards[d.card_id];
    const name = card ? ` — ${card.title}` : '';
    html += `<button class="discover-btn done"><span class="discover-icon">✓</span>${d.label}${name}</button>`;
  });
  const locked = all.filter(d => !d.done && !d.available);
  locked.forEach(d => {
    let missing = '';
    const uid = 'lock-' + d.card_id;
    if (d.requires_item) {
      const reqs = Array.isArray(d.requires_item) ? d.requires_item : [d.requires_item];
      const missingItems = reqs.filter(r => !engine.inventory.includes(r) && !engine.visibleCards.has(r) && !engine.discoveredCards.has(r) && !(engine.revealedCards && engine.revealedCards.has(r)));
      if (missingItems.length) {
        const names = missingItems.map(id => engine.cards[id]?.title || `#${id}`).join(', ');
        const revealed = engine['_lockRevealed_' + d.card_id];
        missing = `<div id="${uid}" style="${revealed ? '' : 'display:none;'}font-size:11px;color:var(--red);margin-top:4px">Missing: ${names}</div>`;
      }
    }
    const revealed = engine['_lockRevealed_' + d.card_id];
    const onclick = revealed ? '' : `onclick="if(!engine['_lockRevealed_${d.card_id}']){engine['_lockRevealed_${d.card_id}']=true;engine.penaltySeconds+=15;showToast('⏱️ -15 seconds',true);var el=document.getElementById('${uid}');if(el)el.style.display='block'}"`;
    html += `<button class="discover-btn" style="opacity:.5;cursor:pointer" ${onclick}><span class="discover-icon">🔒</span><div>${d.label}${missing}</div></button>`;
  });
  html += '</div>';
  return html;
}

// --- Combine mode ---
function enterCombineMode() {
  combineMode = true;
  selectedCards = [];
  document.getElementById('main').style.display = 'none';
  document.getElementById('bottom-bar').style.display = 'none';
  document.getElementById('combine-screen').classList.add('active');
  renderCombineCards();
  updateCombineLabel();
}

function cancelCombine() {
  combineMode = false;
  selectedCards = [];
  document.getElementById('combine-screen').classList.remove('active');
  document.getElementById('main').style.display = '';
  document.getElementById('bottom-bar').style.display = 'flex';
}

function renderCombineCards() {
  const items = engine.getInventoryItems();
  const objects = engine.getCurrentRoomObjects();
  const consumed = engine.getConsumedCards();
  const consumedItems = consumed.filter(c => c.type === 'item');
  const consumedObjects = consumed.filter(c => c.type === 'object');

  let itemsHtml = items.length ? items.map(c => renderCard(c, true)).join('') : '<p style="color:var(--muted);font-size:13px;text-align:center">No items</p>';
  if (consumedItems.length) itemsHtml += '<div style="border-top:1px solid var(--border);margin-top:12px;padding-top:8px"><div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Used</div>' + consumedItems.map(c => renderConsumedCard(c)).join('') + '</div>';

  let objectsHtml = objects.length ? objects.map(c => renderCard(c, true)).join('') : '<p style="color:var(--muted);font-size:13px;text-align:center">No objects</p>';
  if (consumedObjects.length) objectsHtml += '<div style="border-top:1px solid var(--border);margin-top:12px;padding-top:8px"><div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Used</div>' + consumedObjects.map(c => renderConsumedCard(c)).join('') + '</div>';

  document.getElementById('combine-items').innerHTML = itemsHtml;
  document.getElementById('combine-objects').innerHTML = objectsHtml;
}

function renderConsumedCard(card) {
  return `<div class="card ${card.color}" style="opacity:.35;pointer-events:none"><div class="card-header"><span class="card-title">${card.title}</span><span class="card-id">#${card.id}</span></div><div class="card-desc">${card.description}</div></div>`;
}

function toggleSelect(id) {
  const card = engine.cards[id];
  if (!card) return;
  const idx = selectedCards.indexOf(id);
  if (idx >= 0) { selectedCards.splice(idx, 1); }
  else {
    // Only one red + one blue allowed
    const isRed = card.type === 'item';
    selectedCards = selectedCards.filter(sid => engine.cards[sid]?.type === (isRed ? 'object' : 'item'));
    selectedCards.push(id);
  }
  updateCombineLabel();
  renderCombineCards();
}

function updateCombineLabel() {
  const label = document.getElementById('combine-label');
  const btn = document.getElementById('combine-btn');
  if (selectedCards.length === 0) { label.innerHTML = 'Select one Item + one Object to interact'; btn.disabled = true; }
  else if (selectedCards.length === 1) { label.innerHTML = `<span>${engine.cards[selectedCards[0]].title}</span> + ?`; btn.disabled = true; }
  else { label.innerHTML = `<span>${engine.cards[selectedCards[0]].title}</span> + <span>${engine.cards[selectedCards[1]].title}</span>`; btn.disabled = false; }
}

function doCombine() {
  if (selectedCards.length !== 2) return;
  lastEvent = null; lastPenalty = null;
  const result = engine.tryCombination(selectedCards[0], selectedCards[1]);
  const consumed = engine.lastConsumed;
  cancelCombine();
  if (result) {
    if (result.type === 'penalty') {
      SFX.wrong();
      lastPenalty = result;
      showToast(result.description, true);
      document.getElementById('main').classList.add('penalty-flash');
      setTimeout(() => document.getElementById('main').classList.remove('penalty-flash'), 400);
      setTimeout(() => { lastPenalty = null; renderGame(); }, 3000);
    } else if (result.type === 'nothing') {
      showToast(result.description, false);
    } else if (result.type === 'event') {
      SFX.solve();
      showEventPopup(result, consumed);
    } else if (result.type === 'item') {
      showDiscoverPopup(result);
    }
  }
  renderGame();
}

function showEventPopup(card, consumed) {
  const popup = document.getElementById('discover-popup');
  const img = document.getElementById('popup-img');
  img.style.display = 'none';
  document.getElementById('popup-type').textContent = 'Success';
  document.getElementById('popup-type').className = 'popup-type';
  document.getElementById('popup-type').style.color = 'var(--yellow)';
  document.getElementById('popup-title').textContent = card.title;
  document.getElementById('popup-desc').textContent = card.description;
  const flavor = document.getElementById('popup-flavor');
  if (consumed.length) {
    flavor.style.display = '';
    flavor.innerHTML = '<div class="consumed-list">Used: ' + consumed.map(c => `<span>${c.title}</span>`).join('') + '</div>';
  } else {
    flavor.style.display = 'none';
  }
  document.querySelector('.popup-card').classList.add('event-result');
  popup.classList.add('open');
}

// --- Discovery ---
function discover(cardId, puzzleId) {
  if (puzzleId) {
    const puzzle = engine.puzzles[puzzleId];
    if (puzzle && puzzle.type === 'tool') {
      // Reveal the tool card on first use (triggers reveals without consuming)
      if (cardId > 0) engine.revealCard(cardId);
      // Time-cost tools deduct time on first use
      const costKey = `_used_${puzzleId}`;
      const cost = puzzle.config?.time_cost_seconds;
      if (cost && !engine[costKey]) {
        engine[costKey] = true;
        if (!engine.timeInvested) engine.timeInvested = 0;
        engine.timeInvested += cost;
        showToast(`⏱️ ${puzzle.description} activated (−${Math.floor(cost/60)} min)`, false);
      }
      showPuzzlePopup(puzzleId, cardId);
      return;
    }
    showPuzzlePopup(puzzleId, cardId);
    return;
  }
  const prevInv = [...engine.inventory];
  const card = engine.discoverCard(cardId);
  if (!card) { renderGame(); return; }
  const consumed = prevInv.filter(id => !engine.inventory.includes(id));
  if (consumed.length) {
    const names = consumed.map(id => engine.cards[id]?.title || '').filter(Boolean).join(', ');
    if (names) setTimeout(() => showToast(`Used: ${names}`, false), 300);
  }
  if (card.type === 'location') {
    SFX.unlock();
    renderGame();
    return;
  }
  SFX.discover();
  showDiscoverPopup(card);
}

function showPuzzlePopup(puzzleId, awardCardId) {
  const puzzle = engine.puzzles[puzzleId];
  if (!puzzle) return;
  activePuzzlePopupId = puzzleId;
  const popup = document.getElementById('puzzle-popup');
  const mount = document.getElementById('puzzle-mount');
  document.getElementById('puzzle-popup-title').textContent = puzzle.description;
  document.getElementById('puzzle-hint-box').style.display = 'none';
  document.getElementById('puzzle-hint-btn').style.display = puzzle.type === 'tool' ? 'none' : '';
  mount.innerHTML = '';

  const onSolve = () => {
    popup.classList.remove('open');
    engine.solvedPuzzles.add(puzzleId);
    if (engine.onLeaderboardEvent) engine.onLeaderboardEvent('puzzle_solved', { puzzleId });
    SFX.solve();
    const successCard = puzzle.success_card || awardCardId;
    if (successCard !== awardCardId) engine.discoverCard(awardCardId);
    const prevInv = [...engine.inventory];
    const card = engine.discoverCard(successCard);
    const consumed = prevInv.filter(id => !engine.inventory.includes(id));
    if (consumed.length) {
      const names = consumed.map(id => engine.cards[id]?.title || '').filter(Boolean).join(', ');
      if (names) setTimeout(() => showToast(`Used: ${names}`, false), 300);
    }
    if (!card && engine.cards[successCard]?.is_ending) {
      engine.finished = true; engine.completed = true; engine.endTime = Date.now();
    }
    if (card && !card.is_ending) showDiscoverPopup(card);
    renderGame();
  };
  const onFail = (msg) => {
    SFX.wrong();
    showToast(msg || 'Wrong. Try again.', true);
    engine.penalties++;
    if (engine.onLeaderboardEvent) engine.onLeaderboardEvent('penalty', { seconds: 0, reason: msg || 'wrong_answer', puzzleId });
  };
  const cfg = engine.getPuzzleConfig(puzzleId);

  if (puzzle.ui === 'sequence-lock') {
    new SequenceLock(mount, {
      sequence: cfg.sequence, mode: cfg.mode || 'flash',
      flashMs: cfg.flashMs || 400, gapMs: cfg.gapMs || 200,
      onSubmit(correct) { correct ? onSolve() : onFail('Wrong sequence. Try again.'); }
    });
  } else if (puzzle.ui === 'jigsaw-lock') {
    new JigsawLock(mount, {
      cols: cfg.cols || 3, rows: cfg.rows || 3, tiles: cfg.tiles,
      revealCorrect: cfg.revealCorrect !== false,
      onSubmit() { onSolve(); }
    });
  } else if (puzzle.ui === 'wire-lock') {
    new WireLock(mount, {
      wires: cfg.wires, sockets: cfg.sockets, solution: cfg.solution,
      submitLabel: cfg.submitLabel,
      falseOutputs: cfg.falseOutputs || [],
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'morse-lock') {
    new MorseLock(mount, {
      answer: cfg.answer, showReference: cfg.showReference !== false,
      onSubmit() { onSolve(); }
    });
  } else if (puzzle.ui === 'base64-decoder') {
    new Base64Decoder(mount);
    // Tool popup — no solve, just close manually
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-primary';
    closeBtn.style.cssText = 'width:100%;margin-top:12px';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => popup.classList.remove('open');
    mount.appendChild(closeBtn);
  } else if (puzzle.ui === 'log-lock') {
    const rawLines = cfg.lines || [];
    const lines = rawLines[0]?.text !== undefined
      ? rawLines
      : rawLines.map((text, i) => ({ text, correct: (cfg.correct_lines || []).includes(i) }));
    new LogLock(mount, {
      lines,
      prompt: cfg.prompt || 'Select the lines containing critical data',
      onSubmit() { onSolve(); }
    });
  } else if (puzzle.ui === 'terminal-lock') {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'font-family:monospace;padding:16px 0;max-width:400px;margin:0 auto';
    const prompt = document.createElement('div');
    prompt.style.cssText = 'color:var(--green);font-size:14px;margin-bottom:12px;white-space:pre-wrap';
    prompt.textContent = cfg.prompt || '>';
    wrap.appendChild(prompt);
    const input = document.createElement('input');
    input.type = 'text';
    input.autocomplete = 'off';
    input.style.cssText = 'width:100%;padding:10px;background:#0c0c0c;border:1px solid var(--border);border-radius:6px;color:var(--green);font-family:monospace;font-size:14px;margin-bottom:12px';
    input.placeholder = 'Type your answer...';
    wrap.appendChild(input);
    const status = document.createElement('div');
    status.style.cssText = 'font-size:13px;color:var(--muted);text-align:center;min-height:18px;margin-bottom:12px';
    wrap.appendChild(status);
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.style.cssText = 'width:100%';
    btn.textContent = 'Submit';
    const doSubmit = () => {
      const val = input.value.trim().toLowerCase();
      const answer = (cfg.answer || '').toLowerCase();
      const variations = (cfg.accept_variations || []).map(v => v.toLowerCase());
      if (val === answer || variations.includes(val)) {
        if (cfg.follow_up && !wrap.dataset.step2) {
          wrap.dataset.step2 = 'true';
          prompt.textContent = cfg.follow_up.prompt;
          input.value = '';
          input.placeholder = 'Type your answer...';
          status.textContent = '✅ Accepted.';
          status.style.color = 'var(--green)';
          cfg.answer = cfg.follow_up.answer;
          cfg.accept_variations = cfg.follow_up.accept_variations || [];
          delete cfg.follow_up;
          setTimeout(() => { status.textContent = ''; status.style.color = ''; input.focus(); }, 800);
        } else {
          onSolve();
        }
      } else {
        const fo = cfg.falseOutputs;
        if (fo && fo.no_prerequisite && cfg.prerequisite) {
          const req = cfg.prerequisite.requires_card;
          if (req && !engine.visibleCards.has(req)) {
            status.textContent = fo.no_prerequisite;
            return;
          }
        }
        status.textContent = (fo && fo.wrong_answer) || 'Incorrect. Try again.';
        onFail((fo && fo.wrong_answer) || 'Incorrect.');
      }
    };
    btn.addEventListener('click', doSubmit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doSubmit(); });
    wrap.appendChild(btn);
    mount.appendChild(wrap);
    setTimeout(() => input.focus(), 100);
  } else if (puzzle.ui === 'slider-lock') {
    new SliderLock(mount, {
      sliders: cfg.sliders,
      revealCorrect: cfg.revealCorrect !== false,
      falseOutputs: cfg.falseOutputs || [],
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'keypad-lock') {
    if (cfg.fields) {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'padding:16px 0;max-width:400px;margin:0 auto';
      const inputs = [];
      cfg.fields.forEach(f => {
        const label = document.createElement('div');
        label.style.cssText = 'font-size:12px;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:1px';
        label.textContent = f.label;
        wrap.appendChild(label);
        const input = document.createElement('input');
        input.type = 'text';
        input.autocomplete = 'off';
        input.style.cssText = 'width:100%;padding:10px;background:#0c0c0c;border:1px solid var(--border);border-radius:6px;color:var(--green);font-family:monospace;font-size:14px;margin-bottom:12px';
        input.placeholder = f.label;
        wrap.appendChild(input);
        inputs.push({ input, answer: f.answer });
      });
      const status = document.createElement('div');
      status.style.cssText = 'font-size:13px;color:var(--muted);text-align:center;min-height:18px;margin-bottom:12px';
      wrap.appendChild(status);
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.style.cssText = 'width:100%';
      btn.textContent = 'Activate';
      btn.addEventListener('click', () => {
        const allCorrect = inputs.every(({ input, answer }) => {
          const val = cfg.case_sensitive ? input.value.trim() : input.value.trim().toLowerCase();
          const ans = cfg.case_sensitive ? answer : answer.toLowerCase();
          return val === ans;
        });
        if (allCorrect) { onSolve(); } else { status.textContent = 'Incorrect values. Check your cards.'; onFail('Incorrect values.'); }
      });
      wrap.appendChild(btn);
      mount.appendChild(wrap);
      setTimeout(() => inputs[0]?.input.focus(), 100);
    } else {
      new KeypadLock(mount, {
        answer: cfg.answer || cfg.solution,
        caseSensitive: cfg.case_sensitive,
        onSubmit(correct) { correct ? onSolve() : onFail('Wrong code. Try again.'); }
      });
    }
  } else if (puzzle.ui === 'hex-decoder') {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'padding:16px 0;max-width:400px;margin:0 auto';
    const label = document.createElement('div');
    label.style.cssText = 'font-size:13px;color:var(--muted);margin-bottom:8px';
    label.textContent = 'Enter hex string:';
    wrap.appendChild(label);
    const input = document.createElement('input');
    input.type = 'text';
    input.autocomplete = 'off';
    input.style.cssText = 'width:100%;padding:10px;background:#0c0c0c;border:1px solid var(--border);border-radius:6px;color:var(--green);font-family:monospace;font-size:14px;margin-bottom:12px';
    input.placeholder = 'e.g. 6e6574776f726b';
    wrap.appendChild(input);
    const result = document.createElement('div');
    result.style.cssText = 'font-size:18px;font-family:monospace;color:var(--accent);text-align:center;min-height:24px;margin-bottom:12px';
    wrap.appendChild(result);
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.style.cssText = 'width:100%';
    btn.textContent = 'Decode';
    btn.addEventListener('click', () => {
      const hex = input.value.trim().replace(/\s+/g, '');
      try {
        let ascii = '';
        for (let i = 0; i < hex.length; i += 2) ascii += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        result.textContent = `→ ${ascii}`;
      } catch { result.textContent = 'Invalid hex'; }
    });
    wrap.appendChild(btn);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn';
    closeBtn.style.cssText = 'width:100%;margin-top:8px;background:var(--surface);border:1px solid var(--border);color:var(--muted)';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => popup.classList.remove('open');
    wrap.appendChild(closeBtn);
    mount.appendChild(wrap);
    setTimeout(() => input.focus(), 100);
  } else if (puzzle.ui === 'sg-lock') {
    new SgLock(mount, {
      rules: cfg.rules,
      headers: cfg.headers || null,
      onSubmit(correct) { correct ? onSolve() : onFail('Rules rejected. Check the reference sheet.'); }
    });
  } else if (puzzle.ui === 'policy-lock') {
    new PolicyLock(mount, {
      template: cfg.template,
      blanks: cfg.blanks,
      onSubmit(correct) { correct ? onSolve() : onFail('Policy invalid. Review the required permissions.'); }
    });
  } else if (puzzle.ui === 'sort-lock') {
    new SortLock(mount, {
      items: cfg.items, answer: cfg.answer,
      onSubmit(correct) { correct ? onSolve() : onFail('Wrong order. Try again.'); }
    });
  } else if (puzzle.ui === 'match-lock') {
    new MatchLock(mount, {
      pairs: cfg.pairs, cols: cfg.cols || 4,
      onSubmit() { onSolve(); }
    });
  } else if (puzzle.ui === 'word-lock') {
    new WordLock(mount, {
      answer: cfg.answer || cfg.solution,
      alphabet: cfg.alphabet || null,
      onSubmit(word, correct) { correct ? onSolve() : onFail('Wrong word. Try again.'); }
    });
  } else if (puzzle.ui === 'timeline-lock') {
    new TimelineLock(mount, {
      events: cfg.events, answer: cfg.answer,
      onSubmit(correct) { correct ? onSolve() : onFail('Wrong timeline. Check the sequence.'); }
    });
  } else if (puzzle.ui === 'path-lock') {
    new PathLock(mount, {
      nodes: cfg.nodes, edges: cfg.edges, answer: cfg.answer,
      onSubmit(correct) { correct ? onSolve() : onFail('Wrong route. Try again.'); }
    });
  } else if (puzzle.ui === 'maze-lock') {
    new MazeLock(mount, {
      cols: cfg.cols, rows: cfg.rows, walls: cfg.walls,
      start: cfg.start, goal: cfg.goal,
      maxSteps: cfg.maxSteps || 0,
      showWalls: cfg.showWalls !== undefined ? cfg.showWalls : true,
      showGoal: cfg.showGoal !== undefined ? cfg.showGoal : true,
      fallOnBump: cfg.fallOnBump || false,
      playerIcon: cfg.playerIcon || null,
      showSteps: cfg.showSteps !== undefined ? cfg.showSteps : true,
      checkpoints: cfg.checkpoints || [],
      onCheckpoint: cfg.checkpoints ? () => { SFX.discover(); } : null,
      onSubmit() { onSolve(); },
      onBump() { SFX.fall(); if (cfg.bumpPenalty) engine.addPenalty(cfg.bumpPenalty); onFail(cfg.bumpMessage || 'You stumbled in the dark!'); }
    });
  } else if (puzzle.ui === 'jar-fill-lock') {
    new JarFillLock(mount, {
      mode: cfg.mode || 'timing',
      jars: cfg.jars,
      pourSpeed: cfg.pourSpeed || 2,
      tolerance: cfg.tolerance || 0.15,
      onSubmit() { onSolve(); },
      onSpill() { SFX.bump(); if (cfg.spillPenalty) engine.addPenalty(cfg.spillPenalty); onFail(cfg.spillMessage || 'Water spilled!'); }
    });
  } else if (puzzle.ui === 'crowd-counter-lock') {
    new CrowdCounterLock(mount, {
      rows: cfg.rows, cols: cfg.cols, clusters: cfg.clusters,
      target: cfg.target, tolerance: cfg.tolerance || 0,
      showTally: cfg.showTally !== undefined ? cfg.showTally : true,
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'crowd-seating-lock') {
    new CrowdSeatingLock(mount, {
      rows: cfg.rows, cols: cfg.cols, target: cfg.target,
      groupSize: cfg.groupSize || 50, blocked: cfg.blocked || [],
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'offering-table-lock') {
    new OfferingTableLock(mount, {
      items: cfg.items,
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'bread-break-lock') {
    new BreadBreakLock(mount, {
      items: cfg.items,
      holdMin: cfg.holdMin || 0.4, holdMax: cfg.holdMax || 1.2,
      multiplier: cfg.multiplier,
      onSubmit() { onSolve(); },
      onCrumble() { onFail('Crumbled! Be more gentle.'); }
    });
  } else if (puzzle.ui === 'chain-lock') {
    new ChainLock(mount, {
      items: cfg.items, answer: cfg.answer,
      onSubmit(correct) { correct ? onSolve() : onFail('Wrong chain. Check the dependencies.'); }
    });
  } else if (puzzle.ui === 'key-lock') {
    new KeyLock(mount, {
      fragments: cfg.fragments, encrypted: cfg.encrypted, decrypted: cfg.decrypted,
      onSubmit(correct) { correct ? onSolve() : onFail('Decryption failed.'); }
    });
  } else if (puzzle.ui === 'rotation-lock') {
    new RotationLock(mount, {
      dials: cfg.dials,
      revealCorrect: cfg.revealCorrect !== false,
      falseOutputs: cfg.falseOutputs || [],
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'pillar-lock') {
    new PillarLock(mount, {
      pillars: cfg.pillars,
      statements: cfg.statements,
      onSubmit(correct) { correct ? onSolve() : onFail('Wrong pillar. Think about what each statement achieves.'); }
    });
  } else if (puzzle.ui === 'npc-dialog') {
    new NpcDialog(mount, {
      name: cfg.name,
      portrait: cfg.portrait,
      greeting: cfg.greeting,
      lines: cfg.lines || [],
      state_lines: cfg.state_lines || [],
      hasCard(id) { return engine.visibleCards.has(id) || engine.discoveredCards.has(id); }
    });
    // NPC dialogs don't solve — just close
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-primary';
    closeBtn.style.cssText = 'width:100%;margin-top:12px';
    closeBtn.textContent = 'End Conversation';
    closeBtn.onclick = () => popup.classList.remove('open');
    mount.appendChild(closeBtn);
  } else if (puzzle.ui === 'audio-player') {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'padding:16px 0;max-width:400px;margin:0 auto;text-align:center';
    const msg = document.createElement('div');
    msg.style.cssText = 'font-family:monospace;font-size:13px;color:var(--muted);line-height:1.8;font-style:italic;padding:16px;background:#0c0c0c;border:1px solid var(--border);border-radius:8px;margin-bottom:16px';
    msg.textContent = cfg.message || '';
    wrap.appendChild(msg);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-primary';
    closeBtn.style.cssText = 'width:100%';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => popup.classList.remove('open');
    wrap.appendChild(closeBtn);
    mount.appendChild(wrap);
  } else if (puzzle.ui === 'bazaar-lock') {
    new BazaarLock(mount, {
      budget: cfg.budget || 100,
      stalls: (cfg.stalls || []).map(s => ({ id: s.id, label: s.name || s.label, icon: s.icon, specialty: s.specialty, cost: s.cost })),
      quests: (cfg.quests || []).map(q => ({
        id: q.label || q.id,
        label: q.label,
        accepts: Object.entries(q.results || {}).filter(([,v]) => v.tier !== 'fail').map(([stall, v]) => ({
          stall, tier: v.tier, reward: v.reward || v.message, msg: v.message
        })),
        failMsg: Object.entries(q.results || {}).filter(([,v]) => v.tier === 'fail').map(([,v]) => v.message)[0] || 'This merchant cannot handle this task.'
      })),
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'scroll-lock') {
    new ScrollLock(mount, {
      title: cfg.title || 'Royal Decree',
      clauses: (cfg.clauses || []).map(c => ({
        text: c.text,
        blank: { options: c.options, answer: c.answer }
      })),
      constraints: cfg.constraints || [],
      falseOutputs: cfg.falseOutputs || ['The decree is flawed.'],
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'rank-lock') {
    new RankLock(mount, {
      slots: cfg.slots || [],
      badges: cfg.badges || [],
      extraBadges: cfg.extraBadges || [],
      ranks: cfg.ranks || ['Soldier', 'Champion'],
      falseOutputs: cfg.falseOutputs || [],
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'deck-battle-lock') {
    new DeckBattleLock(mount, {
      merchant: cfg.merchant,
      startingDeck: cfg.startingDeck || [],
      gold: cfg.gold || 80,
      onSubmit() { onSolve(); },
      onWalkAway() { popup.classList.remove('open'); }
    });
  } else if (puzzle.ui === 'equipment-rack-lock') {
    const upgradedQuests = (cfg.slots || []).filter(s => engine.solvedPuzzles.has(s.quest)).map(s => s.quest);
    new EquipmentRackLock(mount, {
      slots: cfg.slots || [],
      upgradedQuests: upgradedQuests,
      observability: cfg.observability || false,
      cooldown: cfg.cooldown || 30,
      tiers: cfg.tiers,
      target: cfg.target || 'strides',
      onSubmit() { onSolve(); },
      onDeploy() {}
    });
  } else if (puzzle.ui === 'arch-lock') {
    new ArchLock(mount, {
      zones: cfg.zones || [],
      services: cfg.services || [],
      solution: cfg.solution || {},
      onSubmit(correct) { correct ? onSolve() : onFail('Wrong assignment. Try again.'); }
    });
  } else if (puzzle.ui === 'prompt-lock') {
    new PromptLock(mount, {
      npc: cfg.npc,
      fragments: cfg.fragments || [],
      answers: cfg.answers || [],
      onSubmit() { onSolve(); }
    });
  } else if (puzzle.ui === 'booking-run-lock') {
    new BookingRunLock(mount, {
      npc: cfg.npc,
      calls: cfg.calls || [],
      onSubmit() { onSolve(); }
    });
  } else if (puzzle.ui === 'image-prompt-lock') {
    new ImagePromptLock(mount, {
      commissions: cfg.commissions || [],
      options: cfg.options || {},
      maxAttempts: cfg.maxAttempts || 5,
      onSubmit() { onSolve(); }
    });
  } else if (puzzle.ui === 'witness-lock') {
    new WitnessLock(mount, {
      testimonies: cfg.testimonies || [],
      moments: cfg.moments || [],
      onSubmit() { onSolve(); }
    });
  } else if (puzzle.ui === 'evidence-board-lock') {
    new EvidenceBoardLock(mount, {
      connections: cfg.connections || [],
      onSubmit() { onSolve(); }
    });
  } else if (puzzle.ui === 'grinder-lock') {
    new GrinderLock(mount, {
      config: cfg,
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'stock-memory-lock') {
    new StockMemoryLock(mount, {
      config: cfg,
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'spelling-lock') {
    new SpellingLock(mount, {
      config: cfg,
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'evidence-lock') {
    new EvidenceLock(mount, {
      config: cfg,
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'milk-jug-lock') {
    new MilkJugLock(mount, {
      config: cfg,
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'cascade-lock') {
    new CascadeLock(mount, {
      config: cfg,
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'dial-lock') {
    new DialLock(mount, {
      config: cfg,
      onSubmit() {
        popup.classList.remove('open');
        engine.solvedPuzzles.add(puzzleId);
        if (engine.onLeaderboardEvent) engine.onLeaderboardEvent('puzzle_solved', { puzzleId });
        const savedUpdate = engine.onUpdate;
        engine.onUpdate = null;
        const successCard = puzzle.success_card || awardCardId;
        if (successCard !== awardCardId) engine.discoverCard(awardCardId);
        engine.discoverCard(successCard);
        if (engine.cards[successCard]?.is_ending) {
          engine.finished = true; engine.completed = true; engine.endTime = Date.now();
        }
        engine.onUpdate = savedUpdate;
        renderGame();
      },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'cafe-order-lock') {
    new CafeOrderLock(mount, {
      config: cfg,
      onServed(total) {
        if (total >= 4 && !engine.visibleCards.has(45)) {
          engine.revealCard(45);
          renderGame();
        }
      }
    });
  } else if (puzzle.ui === 'spec-lock') {
    new SpecLock(mount, {
      rounds: cfg.rounds || [],
      falseOutputs: cfg.falseOutputs || ['The golem is still confused.'],
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'context-lock') {
    new ContextLock(mount, {
      capacity: cfg.capacity || 2000,
      documents: cfg.documents || [],
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'blueprint-lock') {
    new BlueprintLock(mount, {
      layers: cfg.layers || [],
      components: cfg.components || [],
      falseOutputs: cfg.falseOutputs || {},
      onSubmit() { onSolve(); },
      onWrong(msg) { onFail(msg); }
    });
  } else if (puzzle.ui === 'pipe-lock') {
    new PipeLock(mount, {
      cols: cfg.cols || (cfg.grid && cfg.grid.cols) || 4,
      rows: cfg.rows || (cfg.grid && cfg.grid.rows) || 3,
      pipes: cfg.pipes || [],
      source: cfg.source,
      sink: cfg.sink,
      onSubmit() { onSolve(); }
    });
  } else if (puzzle.ui === 'defuse-lock') {
    new DefuseLock(mount, {
      timeSeconds: cfg.timeSeconds || 30,
      tasks: cfg.tasks || [],
      onSubmit() { onSolve(); },
      onTimeout() { onFail('Time ran out! The deployment failed.'); }
    });
  }

  popup.classList.add('open');
}

function showDiscoverPopup(card) {
  _historyLog('card_discovered', { cardId: card.id, title: card.title, type: card.type });
  lastPopupCard = card;
  const popup = document.getElementById('discover-popup');
  const img = document.getElementById('popup-img');
  if (card.image) { img.src = `${ASSET_BASE}/${card.image}`; img.style.display = ''; }
  else { img.style.display = 'none'; }
  document.getElementById('popup-type').textContent = card.type === 'item' ? 'Item Found' : card.type === 'object' ? 'Object Found' : card.type === 'lore' ? (engine.meta.lore_label || 'Memory Fragment') : card.type === 'event' ? 'Event' : 'Discovered';
  document.getElementById('popup-type').className = `popup-type ${card.color}`;
  document.getElementById('popup-title').textContent = card.title;
  document.getElementById('popup-desc').textContent = card.short_description || card.description;
  const flavor = document.getElementById('popup-flavor');
  if (card.flavor_text) { flavor.textContent = card.flavor_text; flavor.style.display = ''; }
  else { flavor.style.display = 'none'; }
  popup.classList.add('open');
}

function closePopup() {
  const popup = document.getElementById('discover-popup');
  const card = lastPopupCard;
  popup.classList.remove('open');
  document.querySelector('.popup-card').classList.remove('event-result');
  document.getElementById('popup-type').style.color = '';

  // Collect animation for items/objects
  if (card && (card.type === 'item' || card.type === 'object')) {
    const icon = card.type === 'item' ? '🔴' : '🔵';
    const el = document.createElement('div');
    el.className = 'collect-anim';
    el.textContent = icon;
    el.style.left = '50%';
    el.style.top = '50%';
    document.body.appendChild(el);
    const btn = document.getElementById('btn-combine-mode').getBoundingClientRect();
    requestAnimationFrame(() => {
      el.style.left = btn.left + btn.width / 2 + 'px';
      el.style.top = btn.top + btn.height / 2 + 'px';
      el.classList.add('fly');
    });
    setTimeout(() => {
      el.remove();
      document.getElementById('btn-combine-mode').classList.add('glow');
      setTimeout(() => document.getElementById('btn-combine-mode').classList.remove('glow'), 1500);
    }, 650);
  }
  lastPopupCard = null;
}

function closePuzzlePopup() {
  document.getElementById('puzzle-popup').classList.remove('open');
}

// --- Tools screen ---
function openTools() {
  document.getElementById('main').style.display = 'none';
  document.getElementById('bottom-bar').style.display = 'none';
  document.getElementById('tools-screen').classList.add('active');
  renderTools();
}

function closeTools() {
  document.getElementById('tools-screen').classList.remove('active');
  document.getElementById('main').style.display = '';
  document.getElementById('bottom-bar').style.display = 'flex';
}

function showRoomBanner(title) {
  const existing = document.querySelector('.room-banner');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'room-banner';
  el.innerHTML = `<div class="banner-title">${title}</div><div class="banner-sub">Entering room</div>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

let newRoomCount = 0;
function showRoomUnlock(roomName) {
  // Badge on map button
  newRoomCount++;
  const btn = document.getElementById('btn-map');
  let badge = btn.querySelector('.badge-map');
  if (!badge) { badge = document.createElement('span'); badge.className = 'badge-map'; btn.appendChild(badge); }
  badge.textContent = newRoomCount;
  btn.classList.add('glow');

  // Slide-down bar
  const existing = document.querySelector('.room-unlock-bar');
  if (existing) existing.remove();
  const bar = document.createElement('div');
  bar.className = 'room-unlock-bar';
  bar.innerHTML = `<span class="unlock-icon">🔓</span><div><div class="unlock-text">${roomName}</div><div class="unlock-sub">New area unlocked — tap to view map</div></div>`;
  bar.addEventListener('click', () => { bar.classList.add('dismiss'); setTimeout(() => bar.remove(), 300); openMap(); });
  document.body.appendChild(bar);
  setTimeout(() => { if (bar.parentNode) { bar.classList.add('dismiss'); setTimeout(() => bar.remove(), 300); } }, 4000);
}

function renderTools() {
  const el = document.getElementById('tools-list');
  const tools = Object.values(engine.puzzles).filter(p => p.type === 'tool');
  if (!tools.length) { el.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">No tools discovered yet.</p>'; return; }

  // Group by room
  const roomMap = {};
  tools.forEach(t => {
    const card = engine.cards[t.card_ref];
    const cardRoom = card?.room;
    const roomCard = Object.values(engine.cards).find(c => c.type === 'location' && c.room === cardRoom);
    const roomDef = roomCard ? engine.rooms.find(r => r.card_id === roomCard.id) : null;
    const roomName = roomDef?.name || roomCard?.title || 'Unknown';
    const roomUnlocked = roomCard ? engine.unlockedRooms.includes(roomCard.id) : false;
    if (!roomMap[roomName]) roomMap[roomName] = { unlocked: roomUnlocked, tools: [] };
    roomMap[roomName].tools.push(t);
  });

  let html = '';
  Object.entries(roomMap).forEach(([room, data]) => {
    data.tools.forEach(t => {
      const cls = data.unlocked ? 'tool-card' : 'tool-card locked';
      const onclick = data.unlocked ? `onclick="closeTools();showPuzzlePopup('${t.id}', -1)"` : '';
      const isNpc = t.ui === 'npc-dialog';
      const icon = isNpc ? (t.config?.portrait || '🧑') : '🔧';
      const costLabel = t.config?.time_cost_seconds ? ` (−${Math.floor(t.config.time_cost_seconds/60)} min)` : '';
      html += `<div class="${cls}" ${onclick}><div class="tool-room">${room}</div><div class="tool-name">${icon} ${t.description}${costLabel}</div><div class="tool-desc">${data.unlocked ? 'Tap to use' : 'Room not yet discovered'}</div></div>`;
    });
  });
  el.innerHTML = html;
}

// --- Map ---
function openMap() {
  document.getElementById('btn-map').classList.remove('glow');
  const mapBadge = document.querySelector('#btn-map .badge-map');
  if (mapBadge) mapBadge.remove();
  newRoomCount = 0;
  document.getElementById('main').style.display = 'none';
  document.getElementById('bottom-bar').style.display = 'none';
  document.getElementById('map-screen').classList.add('active');
  renderMap();
  // Auto-scroll to current room
  requestAnimationFrame(() => {
    const cur = document.querySelector('#map-list .map-room.current');
    if (cur) cur.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function closeMap() {
  document.getElementById('map-screen').classList.remove('active');
  document.getElementById('main').style.display = '';
  document.getElementById('bottom-bar').style.display = 'flex';
}

function renderMap() {
  const el = document.getElementById('map-list');
  const roomDefs = engine.rooms;
  const unlocked = new Set(engine.unlockedRooms);
  if (!roomDefs.length) { el.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">No rooms discovered yet.</p>'; return; }

  // Check if rooms have map_pos (isometric) or fallback to list
  const hasPositions = roomDefs.some(r => r.map_pos);
  if (!hasPositions) { renderMapList(el, roomDefs, unlocked); return; }

  // Voxel map style — flat layout with pre-rendered isometric images
  if (engine.meta.map_style === 'voxel') { renderMapVoxel(el, roomDefs, unlocked); return; }

  let selectedMapRoom = null;
  let html = '<div class="iso-container"><div class="iso-floor" id="iso-floor"></div><div class="iso-info" id="iso-info"><div style="color:#666;font-size:13px">Tap a room to see details</div></div></div>';
  el.innerHTML = html;

  const floor = document.getElementById('iso-floor');
  const S = 1.4; // scale factor for spacing

  // Draw connectors
  roomDefs.forEach(r => {
    if (!r.map_pos) return;
    (r.connects_to || []).forEach(cid => {
      const target = roomDefs.find(t => t.card_id === cid);
      if (!target || !target.map_pos) return;
      const x1 = r.map_pos[0] * S + 60, y1 = r.map_pos[1] * S + 60;
      const x2 = target.map_pos[0] * S + 60, y2 = target.map_pos[1] * S + 60;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const div = document.createElement('div');
      div.className = 'iso-connector';
      if (unlocked.has(r.card_id) && unlocked.has(cid)) div.classList.add('active');
      if (r.card_id === engine.currentRoom || cid === engine.currentRoom) div.classList.add('current-line');
      div.style.cssText = `left:${x1}px;top:${y1}px;width:${len}px;transform:rotate(${angle}deg)`;
      floor.appendChild(div);
    });
  });

  // Draw tiles
  roomDefs.forEach(r => {
    if (!r.map_pos) return;
    const id = r.card_id;
    const card = engine.cards[id];
    const isUnlocked = unlocked.has(id);
    const isCurrent = id === engine.currentRoom;
    const discoveries = card?.discoveries || [];
    const undone = discoveries.filter(d => {
      if (d.puzzle) { const p = engine.puzzles[d.puzzle]; if (p && (p.type === 'tool' || p.ui === 'npc-dialog')) return false; }
      return !engine.discoveredCards.has(d.card_id) && !engine.consumedCards.has(d.card_id);
    });
    const remaining = undone.length;
    const state = !isUnlocked ? 'locked' : isCurrent ? 'current' : 'explored';

    const tile = document.createElement('div');
    tile.className = `iso-tile ${state}`;
    tile.style.left = r.map_pos[0] * S + 'px';
    tile.style.top = r.map_pos[1] * S + 'px';
    tile.dataset.id = id;

    const imgSrc = card?.image ? `${ASSET_BASE}/${card.image}` : '';
    tile.innerHTML = `${imgSrc ? `<img src="${imgSrc}" onerror="this.style.display='none'">` : ''}${isCurrent ? '<div class="iso-pin"><div class="iso-pin-head"></div><div class="iso-pin-stick"></div></div>' : ''}${remaining > 0 && isUnlocked ? `<div class="iso-badge">${remaining}</div>` : ''}<div class="iso-label">${r.name}</div>`;

    tile.addEventListener('click', () => {
      if (!isUnlocked) return;
      if (selectedMapRoom === id) { goToRoom(id); return; }
      selectedMapRoom = id;
      floor.querySelectorAll('.iso-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      const status = isCurrent ? '📍 You are here' : remaining > 0 ? `⚠️ ${remaining} action${remaining > 1 ? 's' : ''} remaining` : '✅ Explored';
      const info = document.getElementById('iso-info');
      info.innerHTML = `<div class="iso-info-name">${r.name}</div><div class="iso-info-status">${status}</div>${r.unlock_text ? `<div class="iso-info-unlock">${r.unlock_text}</div>` : ''}${!isCurrent ? `<button class="iso-info-btn" onclick="goToRoom(${id})">Go Here</button>` : ''}`;
    });

    floor.appendChild(tile);
  });
}

// Voxel map — flat layout with pre-rendered isometric voxel images
function renderMapVoxel(el, roomDefs, unlocked) {
  let selectedMapRoom = null;
  const mapDir = ASSET_BASE + '/25maps';
  el.innerHTML = '<div class="iso-container"><div class="vox-floor" id="iso-floor"></div></div><div class="iso-info" id="iso-info" style="position:fixed;bottom:16px;left:50%;transform:translateX(-50%);width:90%;max-width:360px;z-index:10"><div style="color:#666;font-size:13px">Tap a room to see details</div></div>';
  const floor = document.getElementById('iso-floor');

  // Connectors
  roomDefs.forEach(r => {
    if (!r.map_pos) return;
    (r.connects_to || []).forEach(cid => {
      const target = roomDefs.find(t => t.card_id === cid);
      if (!target || !target.map_pos) return;
      const x1 = r.map_pos[0] + 100, y1 = r.map_pos[1] + 100;
      const x2 = target.map_pos[0] + 100, y2 = target.map_pos[1] + 100;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const div = document.createElement('div');
      div.className = 'vox-connector';
      if (unlocked.has(r.card_id) && unlocked.has(cid)) div.classList.add('active');
      if (r.card_id === engine.currentRoom || cid === engine.currentRoom) div.classList.add('current-line');
      div.style.cssText = `left:${x1}px;top:${y1}px;width:${len}px;transform:rotate(${angle}deg)`;
      floor.appendChild(div);
    });
  });

  // Tiles
  roomDefs.forEach(r => {
    if (!r.map_pos) return;
    const id = r.card_id;
    const card = engine.cards[id];
    const isUnlocked = unlocked.has(id);
    const isCurrent = id === engine.currentRoom;
    const discoveries = card?.discoveries || [];
    const undone = discoveries.filter(d => {
      if (d.puzzle) { const p = engine.puzzles[d.puzzle]; if (p && (p.type === 'tool' || p.ui === 'npc-dialog')) return false; }
      return !engine.discoveredCards.has(d.card_id) && !engine.consumedCards.has(d.card_id);
    });
    const remaining = undone.length;
    const state = !isUnlocked ? 'locked' : isCurrent ? 'current' : 'explored';

    const tile = document.createElement('div');
    tile.className = `vox-tile ${state}`;
    tile.style.left = r.map_pos[0] + 'px';
    tile.style.top = r.map_pos[1] + 'px';
    tile.dataset.id = id;

    // Use 25maps/<name>.png based on room name
    const slug = r.name.toLowerCase().replace(/\s+/g, '-');
    const imgSrc = `${mapDir}/${slug}.png`;
    tile.innerHTML = `<img src="${imgSrc}" onerror="this.style.display='none'">${isCurrent ? '<div class="iso-pin">📍</div>' : ''}${remaining > 0 && isUnlocked ? `<div class="iso-badge">${remaining}</div>` : ''}<div class="iso-label">${r.name}</div>`;

    tile.addEventListener('click', () => {
      if (!isUnlocked) return;
      if (selectedMapRoom === id) { goToRoom(id); return; }
      selectedMapRoom = id;
      floor.querySelectorAll('.vox-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      const status = isCurrent ? '📍 You are here' : remaining > 0 ? `⚠️ ${remaining} action${remaining > 1 ? 's' : ''} remaining` : '✅ Explored';
      const info = document.getElementById('iso-info');
      info.innerHTML = `<div class="iso-info-name">${r.name}</div><div class="iso-info-status">${status}</div>${r.unlock_text ? `<div class="iso-info-unlock">${r.unlock_text}</div>` : ''}${!isCurrent ? `<button class="iso-info-btn" onclick="goToRoom(${id})">Go Here</button>` : ''}`;
    });

    floor.appendChild(tile);
  });
}

// Fallback list-based map for episodes without map_pos
function renderMapList(el, roomDefs, unlocked) {
  const rendered = new Set();
  function renderNode(roomDef) {
    if (!roomDef) return '';
    const id = roomDef.card_id;
    if (rendered.has(id)) return '';
    rendered.add(id);
    const card = engine.cards[id];
    const isUnlocked = unlocked.has(id);
    if (!isUnlocked) return '';
    const isCurrent = id === engine.currentRoom;
    const discoveries = (card?.discoveries || []);
    const undone = discoveries.filter(d => {
      if (d.puzzle) { const p = engine.puzzles[d.puzzle]; if (p && (p.type === 'tool' || p.ui === 'npc-dialog')) return false; }
      return !engine.discoveredCards.has(d.card_id) && !engine.consumedCards.has(d.card_id);
    });
    const remaining = undone.length;
    const hasRemaining = remaining > 0;
    const cls = `map-room ${isCurrent ? 'current' : ''} ${hasRemaining ? 'unsolved' : ''}`;
    const status = isCurrent ? 'You are here' : hasRemaining ? `${remaining} action${remaining > 1 ? 's' : ''} remaining` : 'Explored';
    const badge = hasRemaining ? `<span class="map-badge">${remaining}</span>` : '';
    const unlock = roomDef.unlock_text ? `<div class="room-unlock">Unlocked: ${roomDef.unlock_text}</div>` : '';
    let html = `<div class="map-node"><div class="${cls}" onclick="goToRoom(${id})"><div class="room-dot"></div><div class="room-info"><div class="room-name">${roomDef.name}${badge}</div><div class="room-status">${status}</div>${unlock}</div></div>`;
    const children = (roomDef.connects_to || []).map(cid => roomDefs.find(r => r.card_id === cid)).filter(Boolean);
    if (children.length === 1) { html += `<div class="map-connector"><span class="line">→</span></div>${renderNode(children[0])}`; }
    else if (children.length > 1) { html += `<div class="map-connector"><span class="line">→</span></div><div class="map-branch">${children.map(c => `<div class="map-branch-col">${renderNode(c)}</div>`).join('')}</div>`; }
    html += `</div>`;
    return html;
  }
  const root = roomDefs.find(r => r.unlocked_by === null);
  el.innerHTML = root ? renderNode(root) : '<p style="color:var(--muted);text-align:center">No map data.</p>';
}

function goToRoom(id) {
  engine.navigateToRoom(id);
  closeMap();
  renderGame();
}

function resetGame() {
  if (!confirm('Reset the game? All progress will be lost.')) return;
  engine.clearSave();
  try { localStorage.removeItem('cafe_order_state'); } catch {}
  if (CafeOrderLock) CafeOrderLock._state = null;
  clearInterval(timerInterval);
  stopVoice();
  location.reload();
}

// --- Puzzles ---
function tryHidden(cardId) {
  const input = document.getElementById(`hidden-input-${cardId}`);
  const num = parseInt(input.value);
  if (isNaN(num)) return;
  const result = engine.tryHiddenNumber(cardId, num);
  if (result) showDiscoverPopup(result);
  else showToast('No card with that number here.', false);
}

function tryCode(puzzleId) {
  const input = document.getElementById(`code-input-${puzzleId}`);
  const result = engine.tryCodeEntry(puzzleId, input.value.trim());
  if (result.correct) showToast('Correct!', false);
  else showToast(result.message, false);
}

function mountWordLock() {
  const mount = document.getElementById('word-lock-mount');
  if (!mount) return;
  const puzzleId = mount.dataset.puzzle;
  const puzzle = engine.puzzles[puzzleId];
  if (!puzzle) return;
  new WordLock(mount, {
    answer: puzzle.solution.value.toUpperCase(),
    onSubmit(word, correct) {
      if (correct) {
        engine.solvedPuzzles.add(puzzleId);
        if (engine.onLeaderboardEvent) engine.onLeaderboardEvent('puzzle_solved', { puzzleId });
        if (puzzle.success_card) engine.revealCard(puzzle.success_card);
        showToast('Unlocked!', false);
      } else {
        showToast(puzzle.wrong_answer_message || 'Wrong combination. Try again.', false);
      }
    }
  });
}



function usePuzzleHint() {
  if (!activePuzzlePopupId) return;
  const result = engine.getHint(activePuzzlePopupId);
  if (!result) return;
  const box = document.getElementById('puzzle-hint-box');
  box.textContent = result.hint;
  box.style.display = 'block';
}

function useHint() {
  const room = engine.getActiveRoom();
  if (!room || !room.discoveries) { showToast('No puzzles in this room.', false); return; }

  // Find first unsolved puzzle in current room
  const unsolved = room.discoveries.find(d => {
    if (!d.puzzle) return false;
    const p = engine.puzzles[d.puzzle];
    if (!p || p.type === 'tool') return false;
    return !engine.solvedPuzzles.has(d.puzzle) && !engine.discoveredCards.has(d.card_id) && !engine.consumedCards.has(d.card_id);
  });

  if (!unsolved) { showToast('No unsolved puzzles here.', false); return; }

  const result = engine.getHint(unsolved.puzzle);
  if (!result) return;
  if (result.tooltip) showToast(result.tooltip, false);
  const existing = document.querySelector('.hint-box');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'hint-box';
  div.innerHTML = `<div style="font-size:11px;color:var(--accent);margin-bottom:4px">${engine.puzzles[unsolved.puzzle]?.description || unsolved.label}</div>${result.hint}`;
  document.getElementById('room-container').appendChild(div);
}

// --- Admin ---
function initAdmin() {
  if (!ADMIN) return;
  document.getElementById('admin-toggle').style.display = 'block';
  renderAdmin();
}

function renderAdmin() {
  if (!ADMIN) return;
  const el = document.getElementById('admin-content');
  let html = '';

  // Quick actions
  html += '<div class="admin-section"><div class="admin-label">Quick Actions</div>';
  html += '<button onclick="adminSkipToEnd()">Skip to End</button>';
  html += '<button onclick="adminAddTime()">+5 Minutes</button>';
  html += '<button onclick="engine.clearSave();showToast(\'Save cleared\',false)">Clear Save</button>';
  html += '</div>';

  // Rooms
  html += '<div class="admin-section"><div class="admin-label">Jump to Room</div>';
  engine.rooms.forEach(r => {
    const unlocked = engine.unlockedRooms.includes(r.card_id);
    const current = engine.currentRoom === r.card_id;
    const label = `${r.name} (#${r.card_id})${current ? ' ★' : ''}${unlocked ? '' : ' 🔒'}`;
    html += `<button onclick="adminGoRoom(${r.card_id})">${label}</button>`;
  });
  html += '</div>';

  // Cards
  html += '<div class="admin-section"><div class="admin-label">Reveal Card</div>';
  Object.values(engine.cards).forEach(c => {
    const visible = engine.visibleCards.has(c.id) || engine.discoveredCards.has(c.id);
    const consumed = engine.consumedCards.has(c.id);
    const status = consumed ? ' ✗' : visible ? ' ✓' : '';
    html += `<button onclick="adminReveal(${c.id})">${c.type[0].toUpperCase()} #${c.id} ${c.title}${status}</button>`;
  });
  html += '</div>';

  // Puzzles
  html += '<div class="admin-section"><div class="admin-label">Solve Puzzle</div>';
  Object.values(engine.puzzles).forEach(p => {
    const solved = engine.solvedPuzzles.has(p.id);
    html += `<button onclick="adminSolve('${p.id}')">${p.id}${solved ? ' ✓' : ''}</button>`;
  });
  html += '</div>';

  el.innerHTML = html;
}

function adminGoRoom(id) {
  if (!engine.unlockedRooms.includes(id)) {
    engine.unlockedRooms.push(id);
    engine.visibleCards.add(id);
  }
  engine.currentRoom = id;
  engine._notify();
}

function adminReveal(id) {
  engine.discoveredCards.add(id);
  engine.revealCard(id);
}

function adminSolve(puzzleId) {
  engine.solvedPuzzles.add(puzzleId);
  const p = engine.puzzles[puzzleId];
  if (p && p.success_card) engine.revealCard(p.success_card);
  engine._notify();
  showToast(`Solved: ${puzzleId}`, false);
}

function adminSkipToEnd() {
  engine.finished = true;
  engine.completed = true;
  engine.endTime = Date.now();
  showEndScreen();
}

function adminAddTime() {
  engine.penaltySeconds = Math.max(0, engine.penaltySeconds - 300);
  engine._notify();
  showToast('+5 minutes added', false);
}

function showToast(msg, isPenalty) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = isPenalty ? 'show penalty' : 'show';
  setTimeout(() => el.className = '', 3000);
}

function showEndScreen() {
  showScreen('end-screen');
  closeAllPanels();
  if (combineMode) cancelCombine();
  stopVoice();
  // Hide content initially, show artwork first
  const endContent = document.getElementById('end-content');
  endContent.style.opacity = '0';
  endContent.style.transition = 'opacity 1.5s ease-in';
  setTimeout(() => { endContent.style.opacity = '1'; }, 3000);
  document.getElementById('end-lore').innerHTML = '';
  document.getElementById('end-map').innerHTML = '';
  const endImg = document.getElementById('end-bg');
  const timedOut = engine._timerExpired || engine.getRemainingSeconds() < 0;
  const succeeded = engine.completed && !timedOut;
  const imgUrl = `${ASSET_BASE}/assets/${succeeded ? 'ending-success' : 'ending-failure'}.png`;
  document.getElementById('end-screen').style.backgroundImage = `url('${imgUrl}')`;
  document.getElementById('end-screen').style.backgroundSize = 'cover';
  document.getElementById('end-screen').style.backgroundPosition = 'top center';
  // Fade in gradient overlay with content
  const endOverlay = document.getElementById('end-overlay');
  if (endOverlay) {
    endOverlay.style.opacity = '0';
    endOverlay.style.transition = 'opacity 1.5s ease-in';
    setTimeout(() => { endOverlay.style.opacity = '1'; }, 2500);
  }

  if (succeeded) {
    SFX.complete();
    document.getElementById('end-title').textContent = engine.meta.end_title || 'Mission Complete';
    setNarrative('ending_success');
    playVoice('ending_success.wav');
    const ending = engine.narrative.ending?.success;
    if (ending) {
      const segments = ending.segments || [{ text: (ending.text || []).join(' ') }];
      document.getElementById('end-message').innerHTML = segments.map(s => s.text || (s.ssml || '').replace(/<[^>]+>/g, '')).join('<br><br>');
    }
  } else {
    document.getElementById('end-title').textContent = timedOut ? 'Overtime' : "Time's Up";
    const failEnding = engine.narrative.ending?.failure;
    if (failEnding) {
      setNarrative('ending_failure');
      playVoice('ending_failure.wav');
      const segments = failEnding.segments || [{ text: (failEnding.text || []).join(' ') }];
      document.getElementById('end-message').innerHTML = segments.map(s => s.text || (s.ssml || '').replace(/<[^>]+>/g, '')).join('<br><br>');
    } else {
      document.getElementById('end-message').textContent = timedOut ? 'You finished, but time had already run out.' : 'Try again.';
    }
  }

  const score = engine.getScore();

  document.getElementById('end-stars').textContent = '\u2605'.repeat(score.stars) + '\u2606'.repeat(5 - score.stars);
  document.getElementById('score-table').innerHTML = `
    <div class="score-row"><span class="label">Score</span><span>${score.score}</span></div>
    <div class="score-row"><span class="label">Time left</span><span>${score.minutesLeft} min</span></div>
    <div class="score-row"><span class="label">Hints used</span><span>${score.hintsUsed}</span></div>
    <div class="score-row"><span class="label">Penalties</span><span>${score.penalties}</span></div>`;

  // View Artwork button
  const artBtn = document.createElement('button');
  artBtn.className = 'btn btn-secondary';
  artBtn.style.cssText = 'width:100%;margin:16px 0;padding:12px;font-size:14px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--text,#e0e6f0);border-radius:8px;cursor:pointer';
  artBtn.textContent = '🖼️ View Artwork';
  artBtn.onclick = () => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;cursor:pointer';
    const img = document.createElement('img');
    img.src = imgUrl;
    img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain';
    overlay.appendChild(img);
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  };
  document.getElementById('score-table').after(artBtn);

  // Memory Fragments collected
  const allLore = Object.values(engine.cards).filter(c => c.type === 'lore');
  const found = allLore.filter(c => engine.visibleCards.has(c.id) || engine.discoveredCards.has(c.id) || (engine.revealedCards && engine.revealedCards.has(c.id)));
  const loreName = engine.meta.lore_label || 'Memory Fragments';
  let loreHtml = `<h3 style="font-size:14px;color:var(--purple);margin-bottom:12px">${loreName} (${found.length}/${allLore.length})</h3>`;
  allLore.sort((a, b) => a.id - b.id).forEach(c => {
    const collected = engine.visibleCards.has(c.id) || engine.discoveredCards.has(c.id) || (engine.revealedCards && engine.revealedCards.has(c.id));
    if (collected) {
      loreHtml += `<div style="background:var(--surface);border:1px solid var(--purple);border-radius:8px;padding:12px;margin-bottom:8px"><div style="font-size:12px;color:var(--purple);font-weight:700;margin-bottom:4px">${c.title}</div><div style="font-size:13px;color:var(--muted);line-height:1.5">${c.description}</div></div>`;
    } else {
      loreHtml += `<div style="background:var(--surface);border:1px dashed var(--border);border-radius:8px;padding:12px;margin-bottom:8px;opacity:.4"><div style="font-size:12px;color:var(--muted);font-weight:700">${c.title} — Not found</div></div>`;
    }
  });
  document.getElementById('end-lore').innerHTML = loreHtml;

  // Read-only map
  const mapEl = document.getElementById('end-map');
  const roomDefs = engine.rooms;
  const unlocked = new Set(engine.unlockedRooms);
  const renderedEnd = new Set();
  function renderEndNode(roomDef) {
    if (!roomDef) return '';
    const id = roomDef.card_id;
    if (renderedEnd.has(id)) return '';
    renderedEnd.add(id);
    const isUnlocked = unlocked.has(id);
    const cls = `map-room ${isUnlocked ? '' : 'locked'}`;
    const status = isUnlocked ? 'Explored' : 'Not reached';
    let html = `<div class="map-node"><div class="${cls}" style="cursor:default"><div class="room-dot" ${isUnlocked ? '' : 'style="background:var(--border)"'}></div><div class="room-info"><div class="room-name">${roomDef.name}</div><div class="room-status">${status}</div></div></div>`;
    const children = (roomDef.connects_to || []).map(cid => roomDefs.find(r => r.card_id === cid)).filter(Boolean);
    if (children.length === 1) {
      html += `<div class="map-connector"><span class="line">│</span></div>`;
      html += renderEndNode(children[0]);
    } else if (children.length > 1) {
      html += `<div class="map-connector"><span class="line">┣━━━━━━━━━┓</span></div><div class="map-branch">`;
      children.forEach(child => { html += `<div class="map-branch-col">${renderEndNode(child)}</div>`; });
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  }
  const root = roomDefs.find(r => r.unlocked_by === null);
  mapEl.innerHTML = `<h3 style="font-size:14px;color:var(--green);margin-bottom:12px">Map</h3>` + (root ? renderEndNode(root) : '');
}