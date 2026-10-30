import { CircleAlert } from "lucide-react";
import type { VistaConductor } from "../../parqueadero/lecturas/conductor";
import { detalleEspera, lineaEspera } from "./textoEspera";

/** One short status for the current step: the wait in one line, or the cell, or the read model's message. */
export function EstadoPaso({ v }: { v: VistaConductor }) {
  const titulo = v.espera ? lineaEspera(v.espera) : v.destino ? `Zona ${v.destino.zona} · Celda ${v.destino.numero}` : null;
  const detalle = v.espera
    ? [v.estado === "en espera" && "Afuera del pasaje: entras apenas haya cupo.", v.sinParquear && "Saldrás sin parquear: conservas tu puesto hasta la portería.", detalleEspera(v.espera)]
        .filter(Boolean)
        .join(" ")
    : v.mensaje;
  return (
    <div className="cd-estado" aria-live="polite">
      {v.aviso && (
        <p className="ui-aviso cd-aviso" role="status">
          <CircleAlert size={18} strokeWidth={2.2} aria-hidden="true" />
          <span>{v.aviso}</span>
        </p>
      )}
      {titulo && <p className="cd-titulo-paso num">{titulo}</p>}
      <p className={titulo ? "cd-detalle-paso" : "cd-mensaje"}>{detalle}</p>
    </div>
  );
}
