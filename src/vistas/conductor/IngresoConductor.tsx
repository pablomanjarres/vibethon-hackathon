import { useId, useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { normalizarPlaca } from "../../parqueadero/consultas";
import { setParams } from "../../shared/route";

/** "Ya me registré": plate plus the access code given at check-in; both go to the URL so a refresh keeps the session. */
export function IngresoConductor({ placa: inicial = "" }: { placa?: string }) {
  const id = useId();
  const [placa, setPlaca] = useState(inicial);
  const [codigo, setCodigo] = useState("");
  const entrar = (event: FormEvent) => {
    event.preventDefault();
    setParams({ placa: normalizarPlaca(placa), codigo: codigo.trim() }, { push: true });
  };
  return (
    <form className="cd-registro" onSubmit={entrar}>
      <div className="cd-ingreso">
        <div className="ui-campo">
          <label htmlFor={`${id}-placa`}>Placa</label>
          <input
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
        <div className="ui-campo">
          <label htmlFor={`${id}-codigo`}>Código</label>
          <input
            id={`${id}-codigo`}
            value={codigo}
            onChange={(event) => setCodigo(event.target.value.replace(/\D/g, ""))}
            placeholder="1234"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            required
          />
        </div>
      </div>
      <button type="submit" className="ui-accion cd-guardar">
        <LogIn size={20} strokeWidth={2} aria-hidden="true" />
        <span>Ver mi puesto</span>
      </button>
    </form>
  );
}
