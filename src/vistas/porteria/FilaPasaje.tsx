import { useId, useState } from "react";
import { Hourglass, KeyRound, Search } from "lucide-react";
import type { CarroEnPasaje } from "../../parqueadero/lecturas/porteria";
import { Pastilla } from "../../ui/Pastilla";
import { Vacio } from "../../ui/Datos";

const INSIGNIA = {
  fila: { texto: "En fila", Icono: Hourglass, tono: "reservada" },
  valet: { texto: "Con valet", Icono: KeyRound, tono: "neutro" },
} as const;

/** The passage line as a guest list: search by plate, one row per car with its arrival, wait and badge. */
export function FilaPasaje({ fila }: { fila: CarroEnPasaje[] }) {
  const id = useId();
  const [busqueda, setBusqueda] = useState("");
  const filtro = busqueda.trim().toUpperCase();
  const visibles = fila.map((carro, i) => ({ carro, puesto: i + 1 })).filter(({ carro }) => carro.placa.includes(filtro));
  return (
    <div className="pt-filapasaje">
      <div className="pt-buscar">
        <label htmlFor={id} className="pt-oculto">
          Buscar placa
        </label>
        <Search size={18} strokeWidth={2} aria-hidden="true" />
        <input
          id={id}
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar placa"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {fila.length === 0 ? (
        <Vacio>No hay carros en el pasaje. Registra la placa cuando llegue el siguiente.</Vacio>
      ) : visibles.length === 0 ? (
        <Vacio>Ninguna placa en esta fila coincide con «{busqueda}».</Vacio>
      ) : (
        <ol className="ui-lista pt-fila">
          {visibles.map(({ carro, puesto }) => (
            <li key={carro.placa}>
              <span className="pt-pos num" aria-label={`Puesto ${puesto}`}>
                {puesto}
              </span>
              <span className="pt-placa">
                <strong className="num">{carro.placa}</strong>
                <span className="ui-texto-suave num">
                  Llegó {carro.llego} · espera ~{carro.esperaMinutos} min
                </span>
              </span>
              <Pastilla {...INSIGNIA[carro.conValet ? "valet" : "fila"]} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
