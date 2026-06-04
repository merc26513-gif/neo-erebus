import { getInitData } from './tma';
const H = () => ({ 'Content-Type': 'application/json', Authorization: `tma ${getInitData()}` });
export const api = {
  login: () => fetch('/api/auth', { method: 'POST', headers: H() }).then((r) => r.json()),
  space: (id: string) => fetch(`/api/spaces/${id}`).then((r) => r.json()),
  feed: () => fetch('/api/feed').then((r) => r.json()),
  react: (id: string, user_id: string, kind: string) =>
    fetch(`/api/artifacts/${id}/react`, { method: 'POST', headers: H(), body: JSON.stringify({ user_id, kind }) }).then((r) => r.json()),
};
