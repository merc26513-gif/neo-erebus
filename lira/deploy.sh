#!/bin/bash
# LIRA :: DEPLOY SCRIPT
# Запусти: bash deploy.sh YOUR_ANTHROPIC_API_KEY
# Или без ключа (работает в оффлайн-режиме)

set -e
echo "🪐 LIRA :: деплой на LiraMira"

API_KEY="${1:-}"

# Node.js если нет
if ! command -v node &>/dev/null; then
  echo "→ устанавливаю Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# PM2 если нет
if ! command -v pm2 &>/dev/null; then
  echo "→ устанавливаю pm2..."
  npm install -g pm2
fi

# Создаём директорию
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p /opt/lira
cp "$SCRIPT_DIR/server.js" /opt/lira/
cp "$SCRIPT_DIR/index.html" /opt/lira/
cp "$SCRIPT_DIR/package.json" /opt/lira/

cd /opt/lira
npm install

# Сохраняем API ключ если передан
if [ -n "$API_KEY" ]; then
  echo "ANTHROPIC_API_KEY=$API_KEY" > /opt/lira/.env
  echo "→ API ключ сохранён"
fi

# Открываем порт
ufw allow 3000/tcp 2>/dev/null || true

# Запускаем через PM2
pm2 stop lira 2>/dev/null || true

if [ -n "$API_KEY" ]; then
  pm2 start server.js --name lira --env production
else
  pm2 start server.js --name lira
fi

pm2 save
pm2 startup 2>/dev/null || true

echo ""
echo "✓ LIRA запущена"
echo "→ открывай: http://85.192.28.83:3000"
echo ""
pm2 status lira
