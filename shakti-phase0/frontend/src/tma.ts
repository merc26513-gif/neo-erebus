// Telegram Mini App glue. Falls back to dev mode outside Telegram.
export const tg = (window as any).Telegram?.WebApp;
export function initTMA() { try { tg?.ready(); tg?.expand(); } catch {} }
export function getInitData(): string { return tg?.initData || ''; } // empty in browser -> dev login
