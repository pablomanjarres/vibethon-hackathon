import { Hourglass, KeyRound } from "lucide-react";
import type { CarroEnPasaje } from "../../parqueadero/lecturas/porteria";
import { Pastilla } from "../../ui/Pastilla";
import { Vacio } from "../../ui/Datos";

const INSIGNIA = {
  fila: { texto: "En fila", Icono: Hourglass, tono: "reservada" },
  valet: { texto: "Con valet", Icono: KeyRound, tono: "neutro" },
} as const;

/** The passage line in order: one row per car with its arrival, wait and badge. Picking a row opens its detail. */
export function FilaPasaje({ fila, onElegir }: { fila: CarroEnPasaje[]; onElegir: (placa: string) => void }) {
  if (fila.length === 0) return <Vacio>No hay carros en el pasaje. Cada conductor registra su placa al llegar.</Vacio>;
  return (
    <ol className="ui-lista pt-fila">
      {fila.map((carro, i) => (
        <li key={carro.placa}>
          <button type="button" className="pt-placa-fila" onClick={() => onElegir(carro.placa)}>
            <span className="pt-pos num" aria-label={`Puesto ${i + 1}`}>
              {i + 1}
            </span>
            <span className="pt-placa">
              <strong className="num">{carro.placa}</strong>
              <span className="ui-texto-suave num">
                Llegó {carro.llego} · espera ~{carro.esperaMinutos} min
              </span>
            </span>
            <Pastilla {...INSIGNIA[carro.conValet ? "valet" : "fila"]} />
          </button>
        </li>
      ))}
    </ol>
  );
}
