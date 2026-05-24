const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = 3000;
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// ── Загрузка сессий ──────────────────────────────────────
let sessions = {};
if (fs.existsSync(SESSIONS_FILE)) {
  try { sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8')); }
  catch(e) { sessions = {}; }
}
function saveSessions() {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

// ── HTTP сервер ──────────────────────────────────────────
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
    return;
  }
  res.writeHead(404); res.end('not found');
});

// ── WebSocket ────────────────────────────────────────────
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('client connected');

  // Отправляем список сессий при подключении
  ws.send(JSON.stringify({ type: 'sessions_list', sessions: Object.keys(sessions) }));

  ws.on('message', async (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch(e) { return; }

    // ── Загрузить сессию ──
    if (msg.type === 'load_session') {
      const s = sessions[msg.name];
      if (s) ws.send(JSON.stringify({ type: 'session_loaded', name: msg.name, state: s }));
      else ws.send(JSON.stringify({ type: 'error', text: 'сессия не найдена' }));
      return;
    }

    // ── Сохранить сессию ──
    if (msg.type === 'save_session') {
      sessions[msg.name] = {
        agents: msg.agents,
        bg: msg.bg,
        savedAt: new Date().toISOString(),
      };
      saveSessions();
      broadcast({ type: 'sessions_list', sessions: Object.keys(sessions) });
      ws.send(JSON.stringify({ type: 'saved', name: msg.name }));
      return;
    }

    // ── Синхронизация поля (real-time между вкладками) ──
    if (msg.type === 'field_update') {
      broadcast({ type: 'field_update', state: msg.state }, ws);
      return;
    }

    // ── Команда всему полю ──
    if (msg.type === 'field_command') {
      broadcast({ type: 'field_command', cmd: msg.cmd, value: msg.value }, ws);
      return;
    }
  });

  ws.on('close', () => console.log('client disconnected'));
});

function broadcast(data, exclude) {
  const str = JSON.stringify(data);
  wss.clients.forEach(c => {
    if (c !== exclude && c.readyState === 1) c.send(str);
  });
}

server.listen(PORT, () => {
  console.log(`LIRA server running on http://localhost:${PORT}`);
});
