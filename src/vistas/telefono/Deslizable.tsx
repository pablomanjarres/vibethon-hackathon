import { useId, useRef, useState, type ReactNode } from "react";

interface Pestana {
  id: string;
  titulo: string;
  contenido: ReactNode;
}

/** Underlined tabs over panels that also swipe sideways; the tab follows the swipe. */
export function Deslizable({ pestanas }: { pestanas: Pestana[] }) {
  const base = useId();
  const carril = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const ir = (i: number) => {
    setActual(i);
    carril.current?.scrollTo({ left: i * carril.current.clientWidth, behavior: "smooth" });
  };
  return (
    <div className="tl-deslizable">
      <div className="tl-pestanas" role="tablist">
        {pestanas.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`${base}-${p.id}`}
            aria-selected={i === actual}
            aria-controls={`${base}-${p.id}-panel`}
            tabIndex={i === actual ? 0 : -1}
            onClick={() => ir(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") ir(Math.min(pestanas.length - 1, i + 1));
              if (e.key === "ArrowLeft") ir(Math.max(0, i - 1));
            }}
          >
            {p.titulo}
          </button>
        ))}
      </div>
      <div
        ref={carril}
        className="tl-carril"
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== actual) setActual(i);
        }}
      >
        {pestanas.map((p, i) => (
          <div
            key={p.id}
            role="tabpanel"
            id={`${base}-${p.id}-panel`}
            aria-labelledby={`${base}-${p.id}`}
            className="tl-panel"
            inert={i !== actual}
          >
            {p.contenido}
          </div>
        ))}
      </div>
    </div>
  );
}
