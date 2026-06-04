# SHAKTI — Phase 0 (мастерская живых стикеров / каркас пространства)

Работающий скелет: вход через Telegram (с проверкой initData), пространство → объекты,
лента с лайками/spark, режим «архитектура» (дерево), и **Runner** — безопасный запуск
HTML-стикеров в sandbox-iframe. Твои три живых стикера уже вшиты как первые экспонаты.

## Что уже ПРОВЕРЕНО кодом (живой Node 22)
- ✅ Валидация Telegram initData (HMAC-SHA256): валид → ok, подделка/чужой токен → reject.
- ✅ Леджер двойной записи: баланс выводится из проводок, инвариант total=0, овердрафт блокируется.
- ✅ Тиражи/владение: минт до supply, дальше `sold out`; авторство ≠ владение.
- ✅ Лента: публичные объекты + счётчики spark/like (приватные скрыты).
- ✅ Экспорт webm-лупа (VP9+alpha) через ffmpeg — для пресетов/своего контента.

## Запуск (локально)
```bash
# 1) backend
cd backend
cp .env.example .env        # для доступа из браузера без Telegram оставь ALLOW_DEV_LOGIN=1
npm install
npm run dev                 # http://localhost:8787

# 2) frontend (другой терминал)
cd ../frontend
npm install
npm run dev                 # http://localhost:5173  (проксирует /api и /exhibits на :8787)
```
Открой http://localhost:5173 — войдёшь как dev_max, увидишь ленту из 3 стикеров,
тыкнешь → откроется живой стикер в песочнице. Лайк/⚡ работают.

## В Telegram
1. @BotFather → создай бота, возьми токен → в `backend/.env` (`BOT_TOKEN=...`), убери `ALLOW_DEV_LOGIN`.
2. @BotFather → настрой Mini App, URL = адрес задеплоенного фронта (HTTPS).
3. Залей фронт+бэк на VPS (LiraMira), отдавай по HTTPS (Caddy/NGINX).
4. **Прод-безопасность:** отдавай `/exhibits` (чужой HTML) с ОТДЕЛЬНОГО origin, не с API-хоста (см. комментарий в server.js и Runner.tsx).

## Архитектура (что где)
- `backend/src/auth.js` — проверка initData (verified).
- `backend/src/store.js` — in-memory store + **двойной леджер** + editions/ownership (verified). Прод: заменить на Postgres по `schema.sql` (те же операции).
- `backend/src/routes/*` — auth / spaces / artifacts / feed.
- `backend/schema.sql` — прод-схема Postgres + pgvector.
- `frontend/src/components/Runner.tsx` — sandbox-iframe (allow-scripts БЕЗ allow-same-origin).
- `exhibits/*.html` — твои живые стикеры (первые экспонаты).

## ⚠️ Проверить дальше (нужен браузер/устройство/живой TG)
изоляцию sandbox-iframe в реальных браузерах · лимит WebGL-контекстов на телефоне ·
MediaRecorder+alpha для client-side превью · живой Telegram SDK/Stars · pgvector на проде.

## Следующие фазы
1: студия v0 (база→пресеты→экспорт webm) + client-side превью + webm-плитки в ленте.
2: чат, экономика (Spark/Coin за Stars), маркет/дропы.
3: чужие пространства, pgvector-дискавери, ремиксы, граф-вид.
