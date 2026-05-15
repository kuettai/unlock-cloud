// --- Game ID Gate ---
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('game_id') || localStorage.getItem('resolve_game_id');
const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// Clear game state if game_id changed
if (gameId) {
  const prevId = localStorage.getItem('resolve_game_id');
  if (prevId && prevId !== gameId) {
    // Different game — clear all saved game state
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('utc_') || k === 'cafe_order_state') localStorage.removeItem(k);
    });
  }
  localStorage.setItem('resolve_game_id', gameId);
}

function submitGateCode() {
  const code = document.getElementById('gate-code-input').value.trim();
  if (!code) return;
  localStorage.setItem('resolve_game_id', code);
  window.location.href = `home.html?game_id=${code}`;
}

if (gameId || isLocal) {
  if (gameId && !isLocal) {
    // Auto-launch game — skip catalog
    window.location.href = `index.html?game_id=${gameId}`;
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('qr-gate').style.display = 'none';
      document.getElementById('main-content').style.display = '';
    });
  }
} else {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('qr-gate').style.display = '';
    document.getElementById('main-content').style.display = 'none';
  });
}

// --- App ---
function setMode(mode) {
  localStorage.setItem('gameMode', mode);
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
}

// Init mode toggle
setMode(localStorage.getItem('gameMode') || 'normal');

const BASE = '../scenarios';
const ASSET_BASE = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  ? BASE
  : 'https://beta.re-solve.cloud/scenarios';
let categories = [];

async function init() {
  const resp = await fetch(`${BASE}/categories.json`);
  categories = await resp.json();
  showCategories();
}

function showCategories() {
  document.getElementById('subtitle').textContent = 'Choose a category';
  document.getElementById('back-btn').style.display = 'none';
  const el = document.getElementById('content');
  el.innerHTML = categories.map(c => `
    <div class="cat-card" onclick="showEpisodes('${c.id}')" style="border-color:${c.color}20">
      <div class="cat-icon">${c.icon}</div>
      <div class="cat-info">
        <div class="cat-title">${c.title}</div>
        <div class="cat-desc">${c.description}</div>
        <div class="cat-meta">${c.episodes} episode${c.episodes > 1 ? 's' : ''}</div>
      </div>
    </div>
  `).join('');
}

async function showEpisodes(catId) {
  const cat = categories.find(c => c.id === catId);
  document.getElementById('subtitle').textContent = cat.title;
  document.getElementById('back-btn').style.display = 'block';
  const el = document.getElementById('content');
  el.innerHTML = '<div class="loading">Loading episodes...</div>';

  const resp = await fetch(`${BASE}/${catId}/index.json`);
  const list = await resp.json();

  const metas = await Promise.all(list.map(async id => {
    try {
      const r = await fetch(`${BASE}/${catId}/${id}/meta.json`);
      const meta = await r.json();
      meta._id = id;
      meta._cat = catId;
      return meta;
    } catch { return null; }
  }));

  const valid = metas.filter(Boolean).sort((a, b) => a.episode - b.episode);
  if (!valid.length) { el.innerHTML = '<div class="loading">No episodes found.</div>'; return; }

  el.innerHTML = valid.map(m => {
    const diffClass = `diff-${(m.difficulty?.label || '').toLowerCase()}`;
    const hasSave = localStorage.getItem(`utc_${m.id}`);
    const resumeBadge = hasSave ? '<span class="resume-badge">In Progress</span>' : '';
    const tags = [
      `<span class="scenario-tag ${diffClass}">${m.difficulty?.label || 'Unknown'}</span>`,
      `<span class="scenario-tag">${m.duration_minutes} min</span>`,
      `<span class="scenario-tag">${m.players?.min || 1}-${m.players?.max || 6} players</span>`,
    ];
    return `<div class="scenario-card" onclick="play('${m._cat}','${m._id}')">
      <img class="scenario-cover" src="${ASSET_BASE}/${m._cat}/${m._id}/assets/cover.png" alt="${m.title}" onerror="this.style.display='none'">
      <div class="scenario-body">
      <div class="scenario-ep">${m.episode}</div>
      <div class="scenario-info">
        <div class="scenario-title">${m.title} ${resumeBadge}</div>
        <div class="scenario-desc">${m.description}</div>
        <div class="scenario-meta">${tags.join('')}</div>
        <div style="margin-top:8px"><button onclick="event.stopPropagation();playGuest('${m._cat}','${m._id}')" style="background:none;border:1px solid var(--border);border-radius:4px;padding:4px 10px;color:var(--muted);font-size:11px;cursor:pointer">Play as Guest</button></div>
      </div>
      </div>
    </div>`;
  }).join('');
}

function play(cat, id) {
  const gid = localStorage.getItem('resolve_game_id');
  const extra = gid ? `&game_id=${gid}` : '';
  window.location.href = `index.html?scenario=${BASE}/${cat}/${id}${extra}`;
}

function playGuest(cat, id) {
  const gid = localStorage.getItem('resolve_game_id');
  const extra = gid ? `&game_id=${gid}` : '';
  window.location.href = `index.html?scenario=${BASE}/${cat}/${id}&mode=guest${extra}`;
}

if (gameId || isLocal) init();
document.addEventListener('DOMContentLoaded', function(){
  const text = 'Built by Kiro';
  const el = document.querySelector('.kiro-text');
  if (!el) return;
  let i = 0;
  setTimeout(function type(){
    if(i <= text.length){ el.textContent = text.slice(0,i); i++; setTimeout(type, 80); }
    else { el.style.borderRight = 'none'; }
  }, 3000);

  // Ghost wander
  const ghost = document.querySelector('.kiro-bg');
  if (!ghost) return;
  ghost.classList.add('visible');
  setInterval(() => {
    ghost.classList.remove('visible');
    setTimeout(() => {
      const size = 150 + Math.random() * 200;
      ghost.style.width = size + 'px';
      ghost.style.height = (size * 1.2) + 'px';
      ghost.style.top = Math.random() * (window.innerHeight - size) + 'px';
      ghost.style.left = Math.random() * (window.innerWidth - size) + 'px';
      setTimeout(() => ghost.classList.add('visible'), 50);
    }, 1500);
  }, 8000);
});