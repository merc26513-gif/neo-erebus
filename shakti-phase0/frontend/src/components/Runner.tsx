// SECURITY: executes artifact HTML in a sandboxed iframe.
// sandbox="allow-scripts" WITHOUT allow-same-origin -> the artifact cannot read
// the parent DOM, cookies, or our API. Prod: serve src from an isolated origin.
export function Runner({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="runner">
      <button className="x" onClick={onClose}>✕</button>
      <iframe
        title="artifact"
        src={src}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        allow="accelerometer; gyroscope"
      />
    </div>
  );
}
