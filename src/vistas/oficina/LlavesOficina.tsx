import { useId, useState, type FormEvent } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { Vacio } from "../../ui/Datos";
import { Pastilla } from "../../ui/Pastilla";
import { useComando } from "../../ui/useTienda";
import { ESTADO_LLAVE, type FichoRecibido } from "./llaves";

/**
 * The key desk: every received ficho with its car, cell and keys; the valet's keys are received here,
 * and the driver's ficho is validated before the keys go back (the engine rejects a wrong or repeated ficho).
 */
export function LlavesOficina({ fichos }: { fichos: FichoRecibido[] }) {
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
          <Boton type="submit" variante="primario" Icono={ShieldCheck}>
            Validar y entregar
          </Boton>
        </div>
      </form>
      <AvisoResultado aviso={aviso} />
      <h3 className="of-sub">Fichos recibidos</h3>
      {fichos.length > 0 ? (
        <ul className="of-lineas of-fichos" aria-label="Fichos recibidos">
          {fichos.map(({ servicio, llave, celda, puedeRecibir }) => (
            <li key={servicio.id}>
              <span className="of-ficho-datos">
                <strong className="num">{servicio.ficho}</strong>
                <span className="num">
                  {servicio.placa} · {celda ? `Celda ${celda}` : "Sin celda aún"}
                </span>
              </span>
              <span className="of-ficho-estado">
                <Pastilla {...ESTADO_LLAVE[llave]} />
                {puedeRecibir ? (
                  <Boton variante="contorno" Icono={KeyRound} onClick={() => enviar({ tipo: "dejarLlaves", ficho: servicio.ficho })}>
                    Recibir llaves
                  </Boton>
                ) : (
                  llave === "valet" && <span className="of-motivo">Aún no estaciona</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Vacio>Todavía no se ha emitido ningún ficho.</Vacio>
      )}
    </>
  );
}
