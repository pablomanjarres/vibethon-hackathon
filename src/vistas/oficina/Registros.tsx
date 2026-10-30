import { ArrowLeftRight, CarFront, Hand } from "lucide-react";
import { hora } from "../../parqueadero/lecturas/formato";
import type { VistaOficina } from "../../parqueadero/lecturas/oficina";
import type { EstadoServicio, Evento } from "../../parqueadero/tipos";
import type { Insignia } from "../../ui/Pastilla";
import { Pastilla } from "../../ui/Pastilla";
import { Cifra, Vacio } from "../../ui/Datos";

/** Text, icon and tone for each valet service state shown at the desk. */
const ESTADO_SERVICIO: Record<EstadoServicio, Insignia> = {
  solicitado: { texto: "Solicitado", Icono: Hand, tono: "reservada" },
  "en curso": { texto: "En curso", Icono: ArrowLeftRight, tono: "ocupada" },
  estacionado: { texto: "Estacionado", Icono: CarFront, tono: "libre" },
  devolución: { texto: "Devolución", Icono: ArrowLeftRight, tono: "reservada" },
  entregado: { texto: "Entregado", Icono: CarFront, tono: "neutro" },
};

export function FichosActivos({ fichos }: { fichos: VistaOficina["fichosActivos"] }) {
  return (
    <>
      {fichos.length === 0 ? (
        <Vacio>No hay servicios de valet abiertos.</Vacio>
      ) : (
        <ul className="ui-lista">
          {fichos.map((f) => (
            <li key={f.ficho}>
              <span>
                <strong className="num">{f.ficho}</strong> · <span className="num">{f.placa}</span>
                <br />
                <span className="ui-texto-suave">{f.valet ? `Valet ${f.valet}` : "Sin valet asignado"}</span>
              </span>
              <Pastilla {...ESTADO_SERVICIO[f.estado]} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function LlavesYPagos({ llaves, pagos }: { llaves: string[]; pagos: VistaOficina["pagos"] }) {
  return (
    <>
      <div className="ui-cifras">
        <Cifra valor={llaves.length} etiqueta="Llaves en el tablero" />
        <Cifra valor={pagos.cantidad} etiqueta="Pagos" />
        <Cifra valor={dinero(pagos.total, pagos.moneda)} etiqueta="Recaudado" />
      </div>
      {llaves.length > 0 ? (
        <p className="ui-texto-suave num">Tablero: {llaves.join(", ")}</p>
      ) : (
        <Vacio>No hay llaves en el tablero.</Vacio>
      )}
    </>
  );
}

export function Bitacora({ eventos, inicio }: { eventos: Evento[]; inicio: string }) {
  return (
    <>
      <p className="ui-texto-suave">Lo más reciente arriba.</p>
      {eventos.length === 0 ? (
        <Vacio>Todavía no hay eventos.</Vacio>
      ) : (
        <ol className="ui-lista of-bitacora">
          {eventos.map((evento, i) => (
            <li key={`${evento.minuto}-${i}`}>
              <time className="num">{hora(inicio, evento.minuto)}</time>
              <span>{evento.detalle}</span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

function dinero(total: number, moneda: string): string {
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: moneda, maximumFractionDigits: 0 }).format(total);
  } catch {
    return `${total.toLocaleString("es-CO")} ${moneda}`;
  }
}
