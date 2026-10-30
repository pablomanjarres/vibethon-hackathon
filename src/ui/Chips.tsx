import type { ReactNode } from "react";
import "./panel.css";

export interface Chip {
  id: string;
  texto: ReactNode;
  /** A chip that switches the view (entrance, valet, plate) is a link. */
  href?: string;
  actual?: boolean;
}

/** A row of rounded pill chips; the current one is filled. */
export function Chips({ etiqueta, chips }: { etiqueta: string; chips: Chip[] }) {
  return (
    <nav aria-label={etiqueta}>
      <ul className="ui-chips">
        {chips.map((chip) => (
          <li key={chip.id}>
            {chip.href ? (
              <a href={chip.href} className="ui-chip" aria-current={chip.actual ? "true" : undefined}>
                {chip.texto}
              </a>
            ) : (
              <span className="ui-chip">{chip.texto}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
