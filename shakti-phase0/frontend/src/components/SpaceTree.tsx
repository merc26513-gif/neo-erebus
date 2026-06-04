// Phase-0 architecture view: simple tree of the space. Graph/star map = Phase 2.
export function SpaceTree({ space, artifacts }: { space: any; artifacts: any[] }) {
  return (
    <div className="tree">
      <div className="root">🏛 {space?.title}</div>
      <ul>{artifacts.map((a) => <li key={a.id}>🎴 {a.title}</li>)}</ul>
    </div>
  );
}
