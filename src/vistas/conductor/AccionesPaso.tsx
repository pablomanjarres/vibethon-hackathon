import { DoorOpen } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import { Boton } from "../../ui/Boton";
import type { PasoActual } from "./acciones";

interface Props {
  paso: PasoActual;
  /** Sends the step's command; without it the buttons are a preview and send nothing. */
  onEnviar?: (comando: Comando) => void;
  /** Id of the text explaining a preview. */
  describedBy?: string;
}

/** The current step as one primary button (or an in-person instruction) and at most one quiet link. */
export function AccionesPaso({ paso, onEnviar, describedBy }: Props) {
  const { principal, instruccion, secundario } = paso;
  if (!principal && !instruccion && !secundario) return null;
  return (
    <div className="cd-acciones">
      {principal && (
        <Boton Icono={principal.Icono} ancho aria-describedby={describedBy} onClick={() => onEnviar?.(principal.comando)}>
          {principal.texto}
        </Boton>
      )}
      {instruccion && (
        <p className="cd-instruccion">
          <DoorOpen size={20} strokeWidth={2} aria-hidden="true" />
          <span>{instruccion}</span>
        </p>
      )}
      {secundario && (
        <button type="button" className="cd-enlace" aria-describedby={describedBy} onClick={() => onEnviar?.(secundario.comando)}>
          {secundario.texto}
        </button>
      )}
    </div>
  );
}
