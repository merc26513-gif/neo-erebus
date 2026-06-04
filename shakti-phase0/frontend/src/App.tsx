import { useEffect, useState } from 'react';
import { initTMA } from './tma';
import { api } from './api';
import { Feed } from './components/Feed';
import { SpaceTree } from './components/SpaceTree';
import { Runner } from './components/Runner';

export default function App() {
  const [me, setMe] = useState<any>(null);
  const [space, setSpace] = useState<any>(null);
  const [arts, setArts] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [mode, setMode] = useState<'feed' | 'arch'>('feed');

  useEffect(() => {
    initTMA();
    api.login().then((d) => {
      setMe(d.user); setSpace(d.space);
      api.space(d.space.id).then((s) => setArts(s.artifacts || []));
    });
  }, []);

  if (!me) return <div className="loading">подключаюсь к пространству…</div>;
  return (
    <div className="app">
      <header>
        <span className="logo">⚡ SHAKTI · мастерская</span>
        <span className="who">@{me.username}</span>
        <div className="modes">
          <button className={mode==='feed'?'on':''} onClick={() => setMode('feed')}>лента</button>
          <button className={mode==='arch'?'on':''} onClick={() => setMode('arch')}>архитектура</button>
        </div>
      </header>
      {mode === 'feed'
        ? <Feed userId={me.id} onOpen={setOpen} />
        : <SpaceTree space={space} artifacts={arts} />}
      {open && <Runner src={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
