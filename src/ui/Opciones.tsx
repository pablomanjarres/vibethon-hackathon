import type { ReactNode } from "react";

interface Opcion {
  id: string;
  texto: ReactNode;
  href: string;
}

/** Outline pills that switch which entrance, valet or plate a view shows. */
export function Opciones({ etiqueta, opciones, actual }: { etiqueta: string; opciones: Opcion[]; actual: string | null }) {
  return (
    <nav aria-label={etiqueta}>
      <ul className="ui-opciones">
        {opciones.map((opcion) => (
          <li key={opcion.id}>
            <a href={opcion.href} aria-current={opcion.id === actual ? "true" : undefined}>
              {opcion.texto}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
