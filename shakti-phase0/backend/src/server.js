import Fastify from 'fastify';
import cors from '@fastify/cors';
import fstatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import spaceRoutes from './routes/spaces.js';
import artifactRoutes from './routes/artifacts.js';
import feedRoutes from './routes/feed.js';
import { Users, Spaces, Artifacts } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
// NOTE prod: serve exhibits from an ISOLATED sandbox origin, not the API host.
await app.register(fstatic, { root: path.join(__dirname, '../../exhibits'), prefix: '/exhibits/' });

await app.register(authRoutes);
await app.register(spaceRoutes);
await app.register(artifactRoutes);
await app.register(feedRoutes);

// seed: drop the three living stickers as first exhibits in dev_max's museum
function seed() {
  const u = Users.upsertFromTg({ id: 777, username: 'dev_max', language_code: 'ru' });
  const sp = Spaces.byOwner(u.id)[0];
  if (Artifacts.bySpace(sp.id).length) return;
  const ex = [
    ['Живой стикер', 'living.html'],
    ['Эволюция', 'evolution.html'],
    ['Внутрь пространства', 'inside.html'],
  ];
  for (const [title, file] of ex)
    Artifacts.create({
      space_id: sp.id, author_id: u.id, type: 'sticker', title,
      storage_ref: `/exhibits/${file}`,
      manifest: { network: 'none', needsWebGL: true, preview: 'client-capture' },
      edition: { kind: 'limited', supply: 50 },
    });
}
seed();

const port = process.env.PORT || 8787;
app.listen({ port, host: '0.0.0.0' }).then(() => console.log('Shakti API on :' + port));
