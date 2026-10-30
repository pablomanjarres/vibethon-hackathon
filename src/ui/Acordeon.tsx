import { useId, useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import "./panel.css";

interface Props {
  Icono: LucideIcon;
  titulo: string;
  /** Short count or status beside the label. */
  extra?: ReactNode;
  /** Open on first render. */
  inicial?: boolean;
  /** Controlled mode: a tile elsewhere in the panel can open this section. */
  abierto?: boolean;
  onCambiar?: (abierto: boolean) => void;
  id?: string;
  children: ReactNode;
}

/** One collapsible panel section: icon, label and chevron on a button that reports aria-expanded. */
export function Acordeon({ Icono, titulo, extra, inicial = false, abierto, onCambiar, id, children }: Props) {
  const propio = useId();
  const [local, setLocal] = useState(inicial);
  const abiertoAhora = abierto ?? local;
  const cuerpo = `${id ?? propio}-cuerpo`;
  const cambiar = () => {
    setLocal(!abiertoAhora);
    onCambiar?.(!abiertoAhora);
  };
  return (
    <section className="ui-acordeon" id={id}>
      <h2>
        <button type="button" aria-expanded={abiertoAhora} aria-controls={cuerpo} onClick={cambiar}>
          <Icono size={18} strokeWidth={2} aria-hidden="true" />
          <span className="ui-acordeon-titulo">{titulo}</span>
          {extra && <span className="ui-acordeon-extra num">{extra}</span>}
          <ChevronDown size={18} className="ui-acordeon-chevron" aria-hidden="true" />
        </button>
      </h2>
      <div id={cuerpo} className="ui-acordeon-cuerpo" hidden={!abiertoAhora}>
        {children}
      </div>
    </section>
  );
}
