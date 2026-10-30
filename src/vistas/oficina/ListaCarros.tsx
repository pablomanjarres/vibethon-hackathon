import { useId, useState } from "react";
import type { RegistroCarro } from "../../parqueadero/lecturas/registro";
import { Vacio } from "../../ui/Datos";
import { Pastilla } from "../../ui/Pastilla";
import { ESTADO_CARRO, horasCarro } from "./carro";

interface Props {
  carros: RegistroCarro[];
  seleccion: string | null;
  onSeleccionar: (placa: string) => void;
  /** On the whole-lot office each row also says which entrance the car used. */
  conEntrada: boolean;
}

/** Every car this office follows, searchable by plate; picking one opens its detail. */
export function ListaCarros({ carros, seleccion, onSeleccionar, conEntrada }: Props) {
  const id = useId();
  const [busqueda, setBusqueda] = useState("");
  const texto = busqueda.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const visibles = texto ? carros.filter((c) => c.placa.includes(texto)) : carros;
  return (
    <>
      <div className="ui-campo">
        <label htmlFor={id}>Buscar placa</label>
        <input
          id={id}
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="ABC123"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
      </div>
      {visibles.length === 0 ? (
        <Vacio>{carros.length ? `Ninguna placa coincide con ${texto}.` : "Todavía no ha llegado ningún carro por esta entrada."}</Vacio>
      ) : (
        <ul className="of-carros" aria-label="Carros">
          {visibles.map((carro) => (
            <li key={carro.placa}>
              <button type="button" className="of-carro" aria-pressed={carro.placa === seleccion} onClick={() => onSeleccionar(carro.placa)}>
                <span className="of-carro-fila">
                  <strong className="num">{carro.placa}</strong>
                  <Pastilla {...ESTADO_CARRO[carro.estado]} />
                </span>
                <span className="of-carro-linea num">
                  {[carro.celda && `Celda ${carro.celda}`, conEntrada && carro.entrada].filter(Boolean).join(" · ")}
                </span>
                <span className="of-carro-linea num">{horasCarro(carro)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
