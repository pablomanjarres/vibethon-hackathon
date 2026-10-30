import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { useDialog } from "../shared/useDialog";
import { Boton } from "./Boton";
import "./hoja.css";

interface Props {
  titulo: string;
  /** The engine's reason, in one or two sentences. */
  children: ReactNode;
  accion: string;
  onCerrar: () => void;
}

/** A bottom sheet for a refused action: what failed, why, and one way to try again. Escape closes it. */
export function Hoja({ titulo, children, accion, onCerrar }: Props) {
  const tituloId = useId();
  const textoId = useId();
  const superficie = useDialog<HTMLDivElement>(onCerrar);
  return (
    <div className="ui-hoja-fondo" onClick={onCerrar}>
      <div
        ref={superficie}
        className="ui-hoja"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={textoId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="ui-hoja-icono ui-tono-peligro" aria-hidden="true">
          <CircleAlert size={28} strokeWidth={2} />
        </span>
        <h2 id={tituloId} className="ui-hoja-titulo">
          {titulo}
        </h2>
        <p id={textoId} className="ui-hoja-texto">
          {children}
        </p>
        <Boton ancho onClick={onCerrar}>
          {accion}
        </Boton>
      </div>
    </div>
  );
}
