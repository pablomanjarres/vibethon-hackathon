import { ESTADO_CELDA } from "./estados";
import { H, W, type Puesto } from "./distribuirLote";
import "./puestos.css";

const pct = (valor: number, total: number) => `${(valor / total) * 100}%`;

interface Props {
  puesto: Puesto;
  elegido: boolean;
  /** Without it the stall is a picture, not a button. */
  onSeleccionar?: (id: string) => void;
}

/** One cell as a stall: id plus the availability dot or the state's icon, named by id, state and plate. */
export function PuestoCelda({ puesto: { celda, x, y, w, h }, elegido, onSeleccionar }: Props) {
  const meta = ESTADO_CELDA[celda.estado];
  const posicion = { left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H) };
  const clase = `ui-puesto ui-puesto-${celda.estado}${elegido ? " ui-puesto-elegido" : ""}`;
  const etiqueta = `Celda ${celda.id}, ${meta.texto}${celda.placa ? `, ${celda.placa}` : ""}`;
  const contenido = (
    <>
      <span className="ui-puesto-id num">{celda.id}</span>
      {celda.estado === "libre" ? <span className="ui-puesto-punto" aria-hidden="true" /> : <meta.Icono size={14} strokeWidth={2.2} aria-hidden="true" />}
    </>
  );
  return onSeleccionar ? (
    <button type="button" data-celda={celda.id} className={clase} style={posicion} aria-label={etiqueta} aria-pressed={elegido} onClick={() => onSeleccionar(celda.id)}>
      {contenido}
    </button>
  ) : (
    <span data-celda={celda.id} className={clase} style={posicion} role="img" aria-label={etiqueta}>
      {contenido}
    </span>
  );
}
