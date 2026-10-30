import { BellRing, X } from "lucide-react";
import type { Servicio } from "./pasos";
import { detalleAsignacion } from "./useNuevaAsignacion";

/** The prominent card that tells the valet a car was just assigned to them. */
export function NotiAsignacion({ servicio, onCerrar }: { servicio: Servicio; onCerrar: () => void }) {
  return (
    <section className="vl-noti" role="alert">
      <BellRing size={22} strokeWidth={2.2} aria-hidden="true" className="vl-noti-icono" />
      <p className="vl-noti-texto">
        <strong>Nueva asignación:</strong> <span className="num">{detalleAsignacion(servicio)}</span>
      </p>
      <button type="button" className="vl-noti-cerrar" aria-label="Cerrar aviso" title="Cerrar aviso" onClick={onCerrar}>
        <X size={18} strokeWidth={2.2} aria-hidden="true" />
      </button>
    </section>
  );
}
