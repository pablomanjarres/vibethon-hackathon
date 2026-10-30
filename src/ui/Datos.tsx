import type { ReactNode } from "react";
import "./datos.css";

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
