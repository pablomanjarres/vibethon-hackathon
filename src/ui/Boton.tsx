import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import "./controles.css";

type Variante = "primario" | "secundario" | "contorno";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  Icono?: LucideIcon;
  /** Stretch to the full width of its container (phone actions). */
  ancho?: boolean;
}

/** Ink-filled primary, tile-filled secondary, outline pill: the three Chargetrip buttons. */
export function Boton({ variante = "primario", Icono, ancho, className, children, type = "button", ...rest }: Props) {
  const clases = ["ui-boton", `ui-boton-${variante}`, ancho && "ui-boton-ancho", className].filter(Boolean).join(" ");
  return (
    <button type={type} className={clases} {...rest}>
      {Icono && <Icono size={18} strokeWidth={2} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
