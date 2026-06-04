import { Artifacts, Editions, _db } from '../store.js';
export default async function (app) {
  app.post('/api/artifacts', async (req) => Artifacts.create(req.body));
  app.get('/api/artifacts/:id', async (req, reply) => {
    const a = Artifacts.get(req.params.id);
    if (!a) return reply.code(404).send({ error: 'not found' });
    const edition = [..._db.editions.values()].find((e) => e.artifact_id === a.id) || null;
    const owners = edition ? Editions.owners(edition.id) : [];
    return { artifact: a, edition, owners };
  });
  app.post('/api/artifacts/:id/react', async (req) => {
    Artifacts.react(req.body.user_id, req.params.id, req.body.kind || 'spark');
    return { ok: true };
  });
  app.post('/api/artifacts/:id/acquire', async (req, reply) => {
    const a = Artifacts.get(req.params.id);
    const edition = a && [..._db.editions.values()].find((e) => e.artifact_id === a.id);
    if (!edition) return reply.code(404).send({ error: 'no edition' });
    return Editions.acquire(edition.id, req.body.owner_id);
  });
}
