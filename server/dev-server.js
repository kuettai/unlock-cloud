const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── In-memory state ──
const events = {};   // eventId → { scenarioId, started, startedAt, duration }
const players = {};  // uuid → { playerName, eventId, scenarioId, registeredAt, events: [] }

// ── API Handlers ──
function handleRegister(body) {
  const { playerName, scenarioId, eventId } = body;
  if (!playerName || !eventId) return [400, { error: 'playerName and eventId required' }];
  const ev = events[eventId];
  if (!ev) return [404, { error: 'Event not found' }];
  if (ev.locked) return [403, { error: 'Event is full', gameState: 'FULL' }];

  const uuid = crypto.randomUUID();
  const startedAt = ev.started ? Date.now() : null;
  players[uuid] = { playerName, eventId, scenarioId, registeredAt: Date.now(), startedAt, events: [] };
  const timer = startedAt ? playerTimer(players[uuid], ev) : null;
  return [200, { uuid, ready: ev.started, timer }];
}

function handleStatus(body) {
  const { uuid } = body;
  const player = players[uuid];
  if (!player) return [404, { error: 'Unknown player' }];
  const ev = events[player.eventId];
  if (!ev) return [404, { error: 'Event not found' }];
  if (ev.started && !player.startedAt) player.startedAt = Date.now();
  const timer = player.startedAt ? playerTimer(player, ev) : null;
  return [200, { ready: ev.started, timer }];
}

function handleEvents(body) {
  const { uuid, events: batch } = body;
  const player = players[uuid];
  if (!player) return [404, { error: 'Unknown player' }];
  if (batch && batch.length) player.events.push(...batch);
  const ev = events[player.eventId];
  const timer = player.startedAt ? playerTimer(player, ev) : '00:00';
  return [200, { timer }];
}

// ── Admin API ──
function handleAdminCreateEvent(body) {
  const { scenarioId, durationMinutes } = body;
  const eventId = 'EVT-' + Date.now().toString(36).toUpperCase();
  events[eventId] = { scenarioId, started: false, startedAt: null, duration: durationMinutes || 10, locked: false };
  return [200, { eventId }];
}

function handleAdminStartEvent(body) {
  const { eventId } = body;
  const ev = events[eventId];
  if (!ev) return [404, { error: 'Event not found' }];
  ev.started = true;
  ev.startedAt = Date.now();
  return [200, { ok: true }];
}

function handleAdminLockEvent(body) {
  const { eventId } = body;
  const ev = events[eventId];
  if (!ev) return [404, { error: 'Event not found' }];
  ev.locked = true;
  return [200, { ok: true }];
}

function handleAdminState() {
  return [200, { events, players }];
}

function handleAdminReset() {
  Object.keys(events).forEach(k => delete events[k]);
  Object.keys(players).forEach(k => delete players[k]);
  return [200, { ok: true }];
}

// ── Helpers ──
function playerTimer(player, ev) {
  const elapsed = Math.floor((Date.now() - player.startedAt) / 1000);
  const remaining = ev.duration * 60 - elapsed;
  const abs = Math.abs(remaining);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  const neg = remaining < 0 ? '-' : '';
  return `${neg}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── MIME types ──
const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml',
};

// ── Server ──
const ROOT = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // API routes
  if (req.method === 'POST' && req.url.startsWith('/api/')) {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch {}
      let [status, data] = [400, { error: 'Unknown endpoint' }];

      if (req.url === '/api/register') [status, data] = handleRegister(parsed);
      else if (req.url === '/api/status') [status, data] = handleStatus(parsed);
      else if (req.url === '/api/events') [status, data] = handleEvents(parsed);
      else if (req.url === '/api/admin/create-event') [status, data] = handleAdminCreateEvent(parsed);
      else if (req.url === '/api/admin/start-event') [status, data] = handleAdminStartEvent(parsed);
      else if (req.url === '/api/admin/lock-event') [status, data] = handleAdminLockEvent(parsed);
      else if (req.url === '/api/admin/reset') [status, data] = handleAdminReset();
      else if (req.url === '/api/admin/state') [status, data] = handleAdminState();

      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    });
    return;
  }

  // Static files
  let filePath = path.join(ROOT, req.url.split('?')[0]);
  if (filePath.endsWith('/') || filePath === ROOT) filePath = path.join(ROOT, 'app', 'home.html');

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Admin server running at http://localhost:${PORT}`);
  console.log(`  Admin page: http://localhost:${PORT}/app/admin.html`);
  console.log(`  Game home:  http://localhost:${PORT}/app/home.html\n`);
});
