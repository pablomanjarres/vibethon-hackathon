/** Loading shapes keep the geometry of what they stand in for. */
export function ListSkeleton() {
  return (
    <div className="pp-list" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <span key={index} className="pp-row pp-row-sk">
          <span className="pp-sk" style={{ width: 64 }} />
          <span className="pp-sk" style={{ width: `${78 - (index % 3) * 14}%` }} />
          <span className="pp-sk" style={{ width: 96 }} />
        </span>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="pp-detail" aria-hidden="true">
      <span className="pp-sk" style={{ width: 80 }} />
      <span className="pp-sk pp-sk-title" style={{ width: "70%" }} />
      {[92, 84, 50].map((width) => (
        <span key={width} className="pp-sk" style={{ width: `${width}%` }} />
      ))}
      <span className="pp-sk pp-sk-button" />
    </div>
  );
}
