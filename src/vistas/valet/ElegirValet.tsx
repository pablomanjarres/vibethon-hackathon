import { useId, useState, type FormEvent } from "react";
import { KeyRound, LogIn } from "lucide-react";
import { href } from "../../shared/route";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Shell } from "../../ui/Shell";

/** First open on a phone: the valet signs in with their id and code once; the link keeps both from then on. */
export function ElegirValet({ rechazado }: { rechazado: boolean }) {
  const id = useId();
  const [valet, setValet] = useState("");
  const [codigo, setCodigo] = useState("");
  const entrar = (event: FormEvent) => {
    event.preventDefault();
    window.location.hash = href("valet", { valet: valet.trim().toUpperCase(), codigo: codigo.trim() });
  };
  return (
    <Shell vista="valet" privado>
      <PanelCabecera
        Icono={KeyRound}
        titulo="Entrar como valet"
        subtitulo="Escribe tu código de valet y tu clave una vez; quedan guardados en este enlace."
        cerrar={{ href: href(""), etiqueta: "Volver al inicio" }}
      />
      <AvisoResultado aviso={rechazado ? { ok: false, texto: "Valet o código incorrectos." } : null} />
      <form className="vl-entrar" onSubmit={entrar}>
        <div className="ui-campo">
          <label htmlFor={`${id}-valet`}>Valet</label>
          <input
            id={`${id}-valet`}
            value={valet}
            onChange={(event) => setValet(event.target.value.toUpperCase())}
            placeholder="RG-V1"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            required
          />
        </div>
        <div className="ui-campo">
          <label htmlFor={`${id}-codigo`}>Código</label>
          <input
            id={`${id}-codigo`}
            type="password"
            inputMode="numeric"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value)}
            placeholder="0000"
            autoComplete="current-password"
            required
          />
        </div>
        <Boton type="submit" variante="primario" Icono={LogIn} ancho>
          Entrar
        </Boton>
      </form>
    </Shell>
  );
}
