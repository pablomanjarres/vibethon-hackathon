import { useId, useRef, useState, type FormEvent } from "react";
import { MapPinned } from "lucide-react";
import { normalizarPlaca } from "../../parqueadero/consultas";
import { codigoDeRegistro } from "../../parqueadero/lecturas/conductor";
import { tienda } from "../../parqueadero/tienda";
import type { Estado } from "../../parqueadero/tipos";
import { Hoja } from "../../ui/Hoja";
import { useComando } from "../../ui/useTienda";

interface Props {
  estado: Estado;
  /** Called with the plate, its access code and the engine's confirmation once the car is in line. */
  onRegistrada: (placa: string, codigo: string, texto: string) => void;
}

/** Self check-in on arrival: plate, entrance from the state and one primary action that saves the spot in line. */
export function RegistroLlegada({ estado, onRegistrada }: Props) {
  const id = useId();
  const { aviso, enviar } = useComando();
  const campo = useRef<HTMLInputElement>(null);
  const [placa, setPlaca] = useState("");
  const [entrada, setEntrada] = useState(estado.entradas[0]?.id ?? "");
  const [rechazo, setRechazo] = useState(false);

  const guardar = (event: FormEvent) => {
    event.preventDefault();
    const normalizada = normalizarPlaca(placa);
    if (enviar({ tipo: "registrarLlegada", placa: normalizada, entrada })) {
      const despues = tienda.leer();
      onRegistrada(normalizada, codigoDeRegistro(despues, normalizada) ?? "", [...despues.bitacora].reverse().find((e) => e.detalle.includes(normalizada))?.detalle ?? `${normalizada} quedó registrada.`);
    } else setRechazo(true);
  };
  const reintentar = () => {
    setRechazo(false);
    requestAnimationFrame(() => campo.current?.select());
  };

  return (
    <form className="cd-registro" onSubmit={guardar}>
      <div className="ui-campo">
        <label htmlFor={`${id}-placa`}>Placa del carro</label>
        <input
          ref={campo}
          id={`${id}-placa`}
          value={placa}
          onChange={(event) => setPlaca(event.target.value.toUpperCase())}
          placeholder="ABC123"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={8}
          required
        />
      </div>
      <fieldset className="cd-entradas">
        <legend>¿Por qué entrada llegaste?</legend>
        <div className="ui-chips">
          {estado.entradas.map((e) => (
            <label key={e.id} className="ui-chip cd-entrada">
              <input type="radio" name={`${id}-entrada`} value={e.id} checked={entrada === e.id} onChange={() => setEntrada(e.id)} />
              {e.nombre}
                          </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="ui-accion ui-accion-primaria cd-guardar">
        <MapPinned size={20} strokeWidth={2} aria-hidden="true" />
        <span>Guardar mi puesto</span>
      </button>
      {rechazo && aviso && !aviso.ok && (
        <Hoja titulo={`No se guardó ${normalizarPlaca(placa) || "la placa"}`} accion="Intentar de nuevo" onCerrar={reintentar}>
          {aviso.texto}
        </Hoja>
      )}
    </form>
  );
}
