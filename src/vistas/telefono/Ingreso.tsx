import { useId, useState, type FormEvent } from "react";
import { Car, LogIn } from "lucide-react";
import { setParams } from "../../shared/route";
import { Boton } from "../../ui/Boton";

/** Sign-in on the phone: plate and access code. Nothing about any car shows before both match. */
export function Ingreso({ error }: { error?: string }) {
  const id = useId();
  const [placa, setPlaca] = useState("");
  const [codigo, setCodigo] = useState("");
  const entrar = (e: FormEvent) => {
    e.preventDefault();
    setParams({ placa: placa.trim().toUpperCase(), codigo: codigo.trim() }, { push: true });
  };
  return (
    <div className="tl-ingreso">
      <span className="tl-ingreso-icono" aria-hidden="true">
        <Car size={28} />
      </span>
      <h1>Parqueadero EAFIT</h1>
      <p className="ui-texto-suave">Entra con la placa de tu carro y el código que te dieron al registrarte.</p>
      <form className="tl-ingreso-form" onSubmit={entrar}>
        <div className="ui-campo">
          <label htmlFor={`${id}-placa`}>Placa</label>
          <input
            id={`${id}-placa`}
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            placeholder="ABC123"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={8}
            required
          />
        </div>
        <div className="ui-campo">
          <label htmlFor={`${id}-codigo`}>Código de acceso</label>
          <input
            id={`${id}-codigo`}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            placeholder="0000"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
          />
        </div>
        {error && (
          <p className="tl-ingreso-error" role="alert">
            {error}
          </p>
        )}
        <Boton type="submit" Icono={LogIn} ancho>
          Entrar
        </Boton>
      </form>
    </div>
  );
}
