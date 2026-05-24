#!/bin/bash
set -e
BASE="https://raw.githubusercontent.com/merc26513-gif/neo-erebus/claude/new-session-9Ykh5/lira"

echo ">>> LIRA :: установка"

# Node.js
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
fi

# PM2
command -v pm2 &>/dev/null || npm install -g pm2

# Файлы
mkdir -p /opt/lira
curl -fsSL "$BASE/server.js"   -o /opt/lira/server.js
curl -fsSL "$BASE/index.html"  -o /opt/lira/index.html
curl -fsSL "$BASE/package.json" -o /opt/lira/package.json

cd /opt/lira && npm install --production

# Порт
ufw allow 3000/tcp 2>/dev/null || true

# PM2
pm2 stop lira 2>/dev/null || true
pm2 start /opt/lira/server.js --name lira
pm2 save && pm2 startup 2>/dev/null || true

echo ""
echo "=== LIRA запущена: http://85.192.28.83:3000 ==="
