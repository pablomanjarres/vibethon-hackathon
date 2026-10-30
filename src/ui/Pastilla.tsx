import type { LucideIcon } from "lucide-react";
import "./controles.css";

export type Tono = "libre" | "reservada" | "ocupada" | "peligro" | "neutro";

export interface Insignia {
  texto: string;
  Icono: LucideIcon;
  tono: Tono;
}

/** A status read by its text, icon and tone together, never by color alone. */
export function Pastilla({ texto, Icono, tono, grande = false }: Insignia & { grande?: boolean }) {
  return (
    <span className={`ui-pastilla ui-tono-${tono}${grande ? " ui-pastilla-grande" : ""}`}>
      <Icono size={grande ? 16 : 14} strokeWidth={2.2} aria-hidden="true" />
      {texto}
    </span>
  );
}
