// Phase-0 in-memory store. Same operations a Postgres layer will expose.
// Ledger is APPEND-ONLY double-entry: balance is DERIVED, never stored.
import crypto from 'node:crypto';
const uid = () => crypto.randomUUID();

const db = {
  users: new Map(),
  spaces: new Map(),
  rooms: new Map(),
  artifacts: new Map(),
  editions: new Map(),
  ownership: [],      // {edition_id, owner_id, serial}
  reactions: [],      // {user_id, artifact_id, kind}
  ledger: [],         // {id, account, amount, memo, ref, created_at}
};

export const Users = {
  upsertFromTg(tg) {
    for (const u of db.users.values()) if (u.tg_id === tg.id) return u;
    const u = { id: uid(), tg_id: tg.id, username: tg.username || null, lang: tg.language_code || null };
    db.users.set(u.id, u);
    // every new user gets a default space (their museum)
    Spaces.create(u.id, `${u.username || 'space'}'s museum`);
    return u;
  },
  get: (id) => db.users.get(id) || null,
};

export const Spaces = {
  create(owner_id, title) {
    const s = { id: uid(), owner_id, title, visibility: 'public', bg_shader_seed: Math.floor(Math.random()*1e9), created_at: Date.now() };
    db.spaces.set(s.id, s);
    return s;
  },
  byOwner: (owner_id) => [...db.spaces.values()].filter((s) => s.owner_id === owner_id),
  get: (id) => db.spaces.get(id) || null,
};

export const Artifacts = {
  create(d) {
    const a = {
      id: uid(), space_id: d.space_id, room_id: d.room_id || null, author_id: d.author_id,
      type: d.type || 'sticker', title: d.title || 'untitled', description: d.description || '',
      storage_ref: d.storage_ref, preview_ref: d.preview_ref || null, loop_ref: d.loop_ref || null,
      manifest: d.manifest || { network: 'none' }, visibility: d.visibility || 'public',
      remix_of: d.remix_of || null, created_at: Date.now(),
    };
    db.artifacts.set(a.id, a);
    if (d.edition) Editions.mint(a.id, d.edition.supply, d.edition.kind);
    return a;
  },
  get: (id) => db.artifacts.get(id) || null,
  bySpace: (space_id) => [...db.artifacts.values()].filter((a) => a.space_id === space_id),
  feed() {
    return [...db.artifacts.values()]
      .filter((a) => a.visibility === 'public')
      .sort((a, b) => b.created_at - a.created_at)
      .map((a) => ({
        ...a,
        author: Users.get(a.author_id),
        sparks: db.reactions.filter((r) => r.artifact_id === a.id && r.kind === 'spark').length,
        likes: db.reactions.filter((r) => r.artifact_id === a.id && r.kind === 'like').length,
      }));
  },
  react(user_id, artifact_id, kind) {
    db.reactions = db.reactions.filter((r) => !(r.user_id === user_id && r.artifact_id === artifact_id && r.kind === kind));
    db.reactions.push({ user_id, artifact_id, kind });
  },
};

export const Editions = {
  mint(artifact_id, supply, kind = 'limited') {
    const e = { id: uid(), artifact_id, supply: supply ?? 1, kind };
    db.editions.set(e.id, e);
    return e;
  },
  acquire(edition_id, owner_id) {
    const e = db.editions.get(edition_id);
    if (!e) return { ok: false, error: 'no edition' };
    const owned = db.ownership.filter((o) => o.edition_id === edition_id).length;
    if (owned >= e.supply) return { ok: false, error: 'sold out' };
    const serial = owned + 1;
    db.ownership.push({ edition_id, owner_id, serial });
    return { ok: true, serial, supply: e.supply };
  },
  owners: (edition_id) => db.ownership.filter((o) => o.edition_id === edition_id),
};

export const Ledger = {
  balance: (account) => db.ledger.filter((e) => e.account === account).reduce((s, e) => s + e.amount, 0),
  // tx = [{account, amount}, ...]  MUST sum to 0 (double-entry)
  post(tx, memo, ref = null) {
    const sum = tx.reduce((s, p) => s + p.amount, 0);
    if (sum !== 0) throw new Error('ledger imbalance: postings must sum to 0');
    const created_at = Date.now();
    for (const p of tx) db.ledger.push({ id: uid(), account: p.account, amount: p.amount, memo, ref, created_at });
    return { ok: true };
  },
  transfer(from, to, amount, memo) {
    if (amount <= 0) return { ok: false, error: 'amount<=0' };
    if (this.balance(from) < amount) return { ok: false, error: 'insufficient' };
    this.post([{ account: from, amount: -amount }, { account: to, amount }], memo);
    return { ok: true };
  },
  total: () => db.ledger.reduce((s, e) => s + e.amount, 0), // invariant: always 0
};

export const _db = db;
