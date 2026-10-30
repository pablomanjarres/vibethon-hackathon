import type { EstadoCarro } from "../../parqueadero/tipos";

const ETAPAS = ["Registro", "Fila", "Celda", "Estacionado", "Salida"] as const;

/** Where each car state sits on the way through the lot. */
const AVANCE: Record<EstadoCarro, number> = {
  "en espera": 1,
  "en fila": 1,
  "con celda": 2,
  estacionado: 3,
  "en devolución": 4,
  retirado: 5,
};

/** The trip through the lot as one segmented bar: done, current and still ahead. */
export function Recorrido({ estado }: { estado: EstadoCarro }) {
  const avance = AVANCE[estado];
  return (
    <div className="tl-recorrido">
      <ol aria-label={`Paso ${Math.min(avance + 1, ETAPAS.length)} de ${ETAPAS.length}: ${ETAPAS[Math.min(avance, ETAPAS.length - 1)]}`}>
        {ETAPAS.map((etapa, i) => (
          <li key={etapa} className={i < avance ? "tl-hecha" : i === avance ? "tl-ahora" : undefined} aria-current={i === avance ? "step" : undefined}>
            <span className="tl-tramo" aria-hidden="true" />
            <span className="tl-etapa">{etapa}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
