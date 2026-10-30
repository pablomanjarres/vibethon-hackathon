import { KeyRound } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import type { VistaConductor } from "../../parqueadero/lecturas/conductor";
import type { EstadoCarro } from "../../parqueadero/tipos";
import { Boton } from "../../ui/Boton";

interface Props {
  placa: string;
  /** The engine's offer, or null when the driver cannot hire one right now. */
  oferta: VistaConductor["oferta"];
  /** Where the car is: tells why the offer is closed. */
  estado: EstadoCarro | null;
  tarifa: { precio: number; moneda: string };
  /** The valet picked on a chip (the first four free are offered); the first free one otherwise. */
  elegido: string | null;
  onElegir: (valet: string) => void;
  onEnviar: (comando: Comando) => void;
}

/** The valet row of a waiting driver: the offer with chips and one button to hire, or why it is closed. */
export function OfertaValet({ placa, oferta, estado, tarifa, elegido, onElegir, onEnviar }: Props) {
  const valet = oferta && (elegido && oferta.disponibles.includes(elegido) ? elegido : oferta.disponibles[0]);
  const titulo = (
    <p className="cd-oferta-titulo">
      <KeyRound size={18} aria-hidden="true" /> Valet · <span className="num">{oferta?.precio ?? tarifa.precio} {oferta?.moneda ?? tarifa.moneda}</span>
    </p>
  );
  if (!oferta || !valet)
    return (
      <section className="cd-oferta cd-oferta-cerrada" aria-label="Servicio de valet" aria-disabled="true">
        {titulo}
        <p className="ui-texto-suave">{estado === "en espera" ? "Disponible cuando entres al pasaje" : "No hay valets libres en tu entrada"}</p>
      </section>
    );
  return (
    <section className={`cd-oferta${oferta.sugerido ? " cd-oferta-sugerida" : ""}`} aria-label="Servicio de valet">
      {titulo}
      {oferta.sugerido && <p className="cd-oferta-sugerencia">Te conviene: tu espera supera 15 min</p>}
      <ul className="ui-chips" aria-label="Valets disponibles">
        {oferta.disponibles.slice(0, 4).map((id) => (
          <li key={id}>
            <button type="button" className="ui-chip" aria-current={id === valet ? "true" : undefined} onClick={() => onElegir(id)}>
              {id}
            </button>
          </li>
        ))}
      </ul>
      <Boton variante="secundario" Icono={KeyRound} ancho onClick={() => onEnviar({ tipo: "contratarValet", placa, valet })}>
        Contratar a {valet}
      </Boton>
      <p className="ui-texto-suave">Sin prioridad: conservas tu puesto en la fila.</p>
    </section>
  );
}
