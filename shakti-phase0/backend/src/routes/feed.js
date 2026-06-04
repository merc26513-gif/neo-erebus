import { Artifacts } from '../store.js';
export default async function (app) {
  app.get('/api/feed', async () => ({ items: Artifacts.feed() }));
}
