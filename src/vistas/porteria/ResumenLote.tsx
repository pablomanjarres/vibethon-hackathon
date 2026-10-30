import { LayoutGrid } from "lucide-react";
import { vistaOficina } from "../../parqueadero/lecturas/oficina";
import { vistaPorteria } from "../../parqueadero/lecturas/porteria";
import type { Estado } from "../../parqueadero/tipos";
import { ESTADO_CELDA, type EstadoCeldaUi } from "../../ui/estados";
import { Pastilla } from "../../ui/Pastilla";
import { TarjetaDatos } from "../../ui/TarjetaDatos";

const ORDEN: EstadoCeldaUi[] = ["libre", "ocupada", "reservada"];

/** The whole lot at a glance: cell totals, then every gate's passage and the first car waiting at it. */
export function ResumenLote({ estado, actual }: { estado: Estado; actual: string }) {
  const totales = vistaOficina(estado).celdas;
  return (
    <TarjetaDatos Icono={LayoutGrid} titulo="Lote ahora">
      <ul className="ui-lista pt-totales">
        {ORDEN.map((clave) => (
          <li key={clave}>
            <strong className="num">{totales[clave]}</strong>
            <Pastilla {...ESTADO_CELDA[clave]} />
          </li>
        ))}
      </ul>
      <ul className="ui-lista pt-entradas">
        {estado.entradas.map((e) => {
          const v = vistaPorteria(estado, e.id);
          const primero = v.fila[0]?.placa;
          const reservada = primero ? estado.carros[primero].celda : null;
          const celda = reservada ? `celda ${reservada}` : v.puedeAsignar ? `le toca la ${v.celdasLibres[0]}` : "sin celda aún";
          return (
            <li key={e.id} aria-current={e.id === actual ? "true" : undefined}>
              <span className="pt-placa">
                <strong>
                  {v.nombre} {v.esMiTurno && <span className="pt-turno-marca">· tiene el turno</span>}
                </strong>
                <span className="ui-texto-suave num">{primero ? `Primero: ${primero} · ${celda}` : "Pasaje vacío"}</span>
              </span>
              <span className="num pt-cupo">
                Pasaje {v.pasaje.ocupados} de {v.pasaje.capacidad}
              </span>
            </li>
          );
        })}
      </ul>
    </TarjetaDatos>
  );
}
