import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import "./panel.css";

interface Props {
  Icono: LucideIcon;
  titulo: string;
  /** The green availability badge, e.g. free cells over total. */
  contador?: { valor: ReactNode; etiqueta: string };
  children: ReactNode;
}

/** The inner, darker card of key facts with its availability counter. */
export function TarjetaDatos({ Icono, titulo, contador, children }: Props) {
  return (
    <section className="ui-td">
      <header className="ui-td-cabeza">
        <h2>
          <Icono size={18} strokeWidth={2} aria-hidden="true" />
          {titulo}
        </h2>
        {contador && (
          <span className="ui-contador">
            <span className="ui-contador-valor num">{contador.valor}</span>
            <span className="ui-contador-etiqueta">{contador.etiqueta}</span>
          </span>
        )}
      </header>
      {children}
    </section>
  );
}
