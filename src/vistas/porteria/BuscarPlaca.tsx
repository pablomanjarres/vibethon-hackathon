import { useId, useState } from "react";
import { Search } from "lucide-react";
import type { RegistroCarro } from "../../parqueadero/lecturas/registro";
import { Vacio } from "../../ui/Datos";
import { Pastilla } from "../../ui/Pastilla";
import { ESTADO_CARRO } from "./estadoCarro";

/** Rows shown before the operator types; a search narrows the rest. */
const VISIBLES = 6;

interface Props {
  carros: RegistroCarro[];
  elegida: string | null;
  onElegir: (placa: string) => void;
}

/** This entrance's cars, newest activity first: search a plate, pick a row to open its detail. */
export function BuscarPlaca({ carros, elegida, onElegir }: Props) {
  const id = useId();
  const [busqueda, setBusqueda] = useState("");
  const filtro = busqueda.trim().toUpperCase().replace(/\s+/g, "");
  const coincidencias = carros.filter((carro) => carro.placa.includes(filtro));
  const visibles = filtro ? coincidencias : coincidencias.slice(0, VISIBLES);
  return (
    <section className="pt-buscador" aria-labelledby={`${id}-titulo`}>
      <h2 id={`${id}-titulo`} className="pt-seccion">
        Placas de esta entrada <span className="num">{carros.length}</span>
      </h2>
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
      {carros.length === 0 ? (
        <Vacio>Ningún carro ha entrado por aquí todavía. Cada conductor registra su placa al llegar.</Vacio>
      ) : visibles.length === 0 ? (
        <Vacio>Ninguna placa de esta entrada coincide con «{busqueda}».</Vacio>
      ) : (
        <ul className="ui-lista pt-placas">
          {visibles.map((carro) => (
            <li key={carro.placa}>
              <button type="button" className="pt-placa-fila" aria-pressed={carro.placa === elegida} onClick={() => onElegir(carro.placa)}>
                <span className="pt-placa">
                  <strong className="num">{carro.placa}</strong>
                  <span className="ui-texto-suave num">
                    {carro.celda ? `Celda ${carro.celda}` : "Sin celda"} · Llegó {carro.llego}
                    {carro.estacionado && ` · Estacionó ${carro.estacionado}`}
                    {carro.salio && ` · Salió ${carro.salio}`}
                  </span>
                </span>
                <Pastilla {...ESTADO_CARRO[carro.estado]} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {!filtro && coincidencias.length > VISIBLES && (
        <p className="ui-texto-suave">
          Mostrando las {VISIBLES} más recientes de {coincidencias.length}. Escribe la placa para encontrar las demás.
        </p>
      )}
    </section>
  );
}
