import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import "./tarjeta.css";

interface Props {
  titulo: string;
  Icono?: LucideIcon;
  /** Right side of the header, e.g. a count or a status pill. */
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A titled section card on the cream surface, like the Chargetrip panel blocks. */
export function Tarjeta({ titulo, Icono, extra, children, className }: Props) {
  return (
    <section className={`ui-tarjeta${className ? ` ${className}` : ""}`}>
      <header className="ui-tarjeta-cabeza">
        <h2>
          {Icono && <Icono size={18} strokeWidth={2} aria-hidden="true" />}
          {titulo}
        </h2>
        {extra}
      </header>
      {children}
    </section>
  );
}

/** One number with its label; used for counts and the headline wait. */
export function Cifra({ valor, etiqueta, detalle }: { valor: ReactNode; etiqueta: string; detalle?: string }) {
  return (
    <div className="ui-cifra">
      <span className="ui-cifra-valor num">{valor}</span>
      <span className="ui-cifra-etiqueta">{etiqueta}</span>
      {detalle && <span className="ui-cifra-detalle">{detalle}</span>}
    </div>
  );
}

/** Label and value rows, the charger-card detail list. */
export function Datos({ filas }: { filas: { etiqueta: string; valor: ReactNode }[] }) {
  return (
    <dl className="ui-datos">
      {filas.map((fila) => (
        <div key={fila.etiqueta}>
          <dt>{fila.etiqueta}</dt>
          <dd className="num">{fila.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Why a list is empty, in a sentence. */
export function Vacio({ children }: { children: ReactNode }) {
  return <p className="ui-vacio">{children}</p>;
}
