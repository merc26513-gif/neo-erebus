import crypto from 'node:crypto';

// Validate Telegram WebApp initData. Returns parsed user object or null.
export function validateInitData(initData, botToken) {
  if (!initData || !botToken) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get('hash');
  if (!hash) return null;
  p.delete('hash');
  const dcs = [...p.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secret).update(dcs).digest('hex');
  const ok =
    calc.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash));
  if (!ok) return null;
  // optional freshness check
  const authDate = Number(p.get('auth_date') || 0);
  const ageSec = Date.now() / 1000 - authDate;
  if (authDate && ageSec > 86400) return null; // 24h
  try {
    return JSON.parse(p.get('user') || 'null');
  } catch {
    return null;
  }
}

// dev helper: forge a signed initData (NEVER use on the client/prod)
export function _devSign(fields, botToken) {
  const dcs = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secret).update(dcs).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}
