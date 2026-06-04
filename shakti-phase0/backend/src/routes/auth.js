import { validateInitData } from '../auth.js';
import { Users, Spaces } from '../store.js';
export default async function (app) {
  app.post('/api/auth', async (req, reply) => {
    const initData = (req.headers.authorization || '').replace(/^tma /, '');
    let tg = validateInitData(initData, process.env.BOT_TOKEN);
    if (!tg && process.env.ALLOW_DEV_LOGIN === '1') tg = { id: 777, username: 'dev_max', language_code: 'ru' };
    if (!tg) return reply.code(401).send({ error: 'invalid initData' });
    const user = Users.upsertFromTg(tg);
    const space = Spaces.byOwner(user.id)[0];
    return { user, space };
  });
}
