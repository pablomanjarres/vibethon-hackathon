import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import "./panel.css";

export interface AccionPanel {
  texto: string;
  Icono: LucideIcon;
  onClick?: () => void;
  /** A tile that only navigates is a link. */
  href?: string;
  /** When set, the tile is disabled and this sentence, shown under the row, says why. */
  motivo?: string | null;
  /** True while the section this tile opens is showing. */
  activa?: boolean;
}

/** Up to three equal action tiles, icon above label; the first one is the primary, light tile. */
export function FilaAcciones({ acciones }: { acciones: AccionPanel[] }) {
  const base = useId();
  const motivos = acciones.map((accion, i) => (accion.motivo ? { id: `${base}-${i}`, texto: `${accion.texto}: ${accion.motivo}` } : null));
  return (
    <div className="ui-acciones-bloque">
      <div className="ui-acciones" style={{ gridTemplateColumns: `repeat(${acciones.length}, minmax(0, 1fr))` }}>
        {acciones.map((accion, i) => {
          const clase = i === 0 ? "ui-accion ui-accion-primaria" : "ui-accion";
          const contenido = (
            <>
              <accion.Icono size={20} strokeWidth={2} aria-hidden="true" />
              <span>{accion.texto}</span>
            </>
          );
          if (accion.href && !accion.motivo)
            return (
              <a key={accion.texto} className={clase} href={accion.href}>
                {contenido}
              </a>
            );
          return (
            <button
              key={accion.texto}
              type="button"
              className={clase}
              disabled={Boolean(accion.motivo)}
              aria-describedby={motivos[i]?.id}
              aria-expanded={accion.activa}
              onClick={accion.onClick}
            >
              {contenido}
            </button>
          );
        })}
      </div>
      {motivos.some(Boolean) && (
        <ul className="ui-acciones-motivos">
          {motivos.map((motivo) => motivo && <li key={motivo.id} id={motivo.id}>{motivo.texto}</li>)}
        </ul>
      )}
    </div>
  );
}
