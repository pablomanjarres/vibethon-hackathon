import type { ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import "./panel.css";

interface Props {
  Icono: LucideIcon;
  titulo: string;
  subtitulo?: ReactNode;
  /** The X in the corner: where it goes and what it does, read by screen readers. */
  cerrar?: { href: string; etiqueta: string };
}

/** Panel top: icon tile, title, small subtitle and the X that backs out of this view. */
export function PanelCabecera({ Icono, titulo, subtitulo, cerrar }: Props) {
  return (
    <header className="ui-pc">
      <span className="ui-pc-icono" aria-hidden="true">
        <Icono size={20} strokeWidth={2} />
      </span>
      <div className="ui-pc-texto">
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      {cerrar && (
        <a className="ui-pc-cerrar" href={cerrar.href} aria-label={cerrar.etiqueta} title={cerrar.etiqueta}>
          <X size={18} strokeWidth={2.2} aria-hidden="true" />
        </a>
      )}
    </header>
  );
}
