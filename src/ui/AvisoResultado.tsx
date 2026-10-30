import { CircleAlert, CircleCheck } from "lucide-react";
import type { Aviso } from "./useTienda";
import "./aviso.css";

/** The last command's outcome: what changed, or why the engine refused it. */
export function AvisoResultado({ aviso }: { aviso: Aviso | null }) {
  if (!aviso) return null;
  const Icono = aviso.ok ? CircleCheck : CircleAlert;
  return (
    <p className={`ui-aviso ${aviso.ok ? "ui-tono-libre" : "ui-tono-peligro"}`}>
      <Icono size={18} strokeWidth={2.2} aria-hidden="true" />
      <span>{aviso.texto}</span>
    </p>
  );
}
