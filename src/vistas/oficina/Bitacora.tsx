import { hora } from "../../parqueadero/lecturas/formato";
import type { Evento } from "../../parqueadero/tipos";
import { Vacio } from "../../ui/Datos";

/** Log entries with their clock time, newest first. */
export function Bitacora({ eventos, inicio }: { eventos: Evento[]; inicio: string }) {
  if (eventos.length === 0) return <Vacio>Todavía no hay eventos.</Vacio>;
  return (
    <ol className="ui-lista of-bitacora" aria-label="Lo más reciente arriba">
      {eventos.map((evento, i) => (
        <li key={`${evento.minuto}-${i}`}>
          <time className="num">{hora(inicio, evento.minuto)}</time>
          <span>{evento.detalle}</span>
        </li>
      ))}
    </ol>
  );
}
