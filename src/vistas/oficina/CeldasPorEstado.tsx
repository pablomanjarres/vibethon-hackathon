import { LayoutGrid } from "lucide-react";
import type { Celda } from "../../parqueadero/tipos";
import { ESTADO_CELDA, type EstadoCeldaUi } from "../../ui/estados";
import { Pastilla } from "../../ui/Pastilla";
import { Tarjeta } from "../../ui/Tarjeta";

interface Props {
  celdas: Celda[];
  seleccion: string | null;
  onSeleccionar: (id: string) => void;
}

/** Every cell grouped by state, as a guest list; picking one selects it on the map. */
export function CeldasPorEstado({ celdas, seleccion, onSeleccionar }: Props) {
  return (
    <Tarjeta titulo="Celdas por estado" Icono={LayoutGrid} extra={<span className="ui-texto-suave num">{celdas.length} en total</span>}>
      {(Object.keys(ESTADO_CELDA) as EstadoCeldaUi[]).map((estado) => {
        const grupo = celdas.filter((c) => c.estado === estado);
        const meta = ESTADO_CELDA[estado];
        return (
          <div key={estado} className="of-grupo">
            <Pastilla {...meta} texto={`${meta.texto}: ${grupo.length}`} />
            {grupo.length > 0 && (
              <ul className="of-celdas" aria-label={`Celdas ${meta.texto.toLowerCase()}s`}>
                {grupo.map((celda) => (
                  <li key={celda.id}>
                    <button
                      type="button"
                      className="of-celda num"
                      aria-pressed={celda.id === seleccion}
                      aria-label={`Celda ${celda.id}${celda.placa ? `, ${celda.placa}` : ""}`}
                      onClick={() => onSeleccionar(celda.id)}
                    >
                      {celda.id}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </Tarjeta>
  );
}
