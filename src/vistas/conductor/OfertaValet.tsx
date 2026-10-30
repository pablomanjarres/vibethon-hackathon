import { KeyRound } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import type { VistaConductor } from "../../parqueadero/lecturas/conductor";
import { Boton } from "../../ui/Boton";

interface Props {
  placa: string;
  oferta: NonNullable<VistaConductor["oferta"]>;
  /** The valet picked on a chip (the first four free are offered); the first free one otherwise. */
  elegido: string | null;
  onElegir: (valet: string) => void;
  onEnviar: (comando: Comando) => void;
}

/** Compact valet offer while in the passage: price, the free valets of this entrance, and one button to hire. */
export function OfertaValet({ placa, oferta, elegido, onElegir, onEnviar }: Props) {
  const valet = elegido && oferta.disponibles.includes(elegido) ? elegido : oferta.disponibles[0];
  if (!valet) return null;
  return (
    <section className={`cd-oferta${oferta.sugerido ? " cd-oferta-sugerida" : ""}`} aria-label="Servicio de valet">
      <p className="cd-oferta-titulo">
        <KeyRound size={18} aria-hidden="true" /> Valet · <span className="num">{oferta.precio} {oferta.moneda}</span>
      </p>
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
