import type { ReactNode } from "react";

/** Why it is empty, and the one thing to do next. */
export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action: ReactNode }) {
  return (
    <div className="pp-empty">
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
