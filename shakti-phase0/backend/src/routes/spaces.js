import { Spaces, Artifacts } from '../store.js';
export default async function (app) {
  app.get('/api/spaces/:id', async (req, reply) => {
    const s = Spaces.get(req.params.id);
    if (!s) return reply.code(404).send({ error: 'not found' });
    return { space: s, artifacts: Artifacts.bySpace(s.id) };
  });
}
