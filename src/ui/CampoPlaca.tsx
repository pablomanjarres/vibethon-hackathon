import { useId, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { Boton } from "./Boton";

interface Props {
  etiqueta: string;
  accion: string;
  Icono?: LucideIcon;
  /** Returns true when the plate was accepted, which clears the field. */
  onEnviar: (placa: string) => boolean | void;
}

/** One plate field with its submit button. The engine validates the plate and explains a rejection. */
export function CampoPlaca({ etiqueta, accion, Icono, onEnviar }: Props) {
  const id = useId();
  const [placa, setPlaca] = useState("");
  const enviar = (event: FormEvent) => {
    event.preventDefault();
    if (onEnviar(placa) !== false) setPlaca("");
  };
  return (
    <form className="ui-campo" onSubmit={enviar}>
      <label htmlFor={id}>{etiqueta}</label>
      <div className="ui-campo-fila">
        <input
          id={id}
          value={placa}
          onChange={(event) => setPlaca(event.target.value.toUpperCase())}
          placeholder="ABC123"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={8}
          required
        />
        <Boton type="submit" variante="primario" Icono={Icono}>
          {accion}
        </Boton>
      </div>
    </form>
  );
}
