import { useId, useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import type { Servicio } from "../../parqueadero/tipos";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { Vacio } from "../../ui/Datos";
import { useComando } from "../../ui/useTienda";

/** The key desk: the driver's ficho hands the keys back (the engine rejects a wrong or repeated ficho), and the keys still waiting here. */
export function LlavesOficina({ esperando }: { esperando: Servicio[] }) {
  const id = useId();
  const [ficho, setFicho] = useState("");
  const { aviso, enviar } = useComando();
  const entregar = (event: FormEvent) => {
    event.preventDefault();
    if (enviar({ tipo: "reclamarLlaves", ficho })) setFicho("");
  };
  return (
    <>
      <form className="ui-campo" onSubmit={entregar}>
        <label htmlFor={id}>Ficho del conductor</label>
        <div className="ui-campo-fila">
          <input
            id={id}
            value={ficho}
            onChange={(event) => setFicho(event.target.value.toUpperCase())}
            placeholder="F-001-0000"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
          />
          <Boton type="submit" variante="primario" Icono={KeyRound}>
            Entregar llaves
          </Boton>
        </div>
      </form>
      <AvisoResultado aviso={aviso} />
      <h3 className="of-sub">Llaves en la oficina</h3>
      {esperando.length > 0 ? (
        <ul className="of-lineas">
          {esperando.map((s) => (
            <li key={s.id}>
              <strong className="num">{s.placa}</strong>
              <span className="num">{s.ficho}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Vacio>No hay llaves esperando.</Vacio>
      )}
    </>
  );
}
