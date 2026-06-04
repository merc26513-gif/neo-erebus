import { useEffect, useState } from 'react';
import { api } from '../api';
export function Feed({ userId, onOpen }: { userId: string; onOpen: (src: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const load = () => api.feed().then((d) => setItems(d.items || []));
  useEffect(() => { load(); }, []);
  return (
    <div className="feed">
      {items.map((a) => (
        <div className="tile" key={a.id}>
          <div className="thumb" onClick={() => onOpen(a.storage_ref)}>
            {/* Phase-0: poster placeholder; Phase-1: client-captured webm loop */}
            <span>▶ {a.title}</span>
          </div>
          <div className="meta">
            <b>{a.title}</b><span className="by">@{a.author?.username}</span>
            <button onClick={() => api.react(a.id, userId, 'spark').then(load)}>⚡ {a.sparks}</button>
            <button onClick={() => api.react(a.id, userId, 'like').then(load)}>♥ {a.likes}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
