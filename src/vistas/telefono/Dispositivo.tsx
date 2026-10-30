import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import "./dispositivo.css";

/**
 * A modern phone around the screen on wide displays: thin bezel, island, side buttons, status bar
 * and home bar. On a real phone the frame drops away and the screen fills the viewport.
 */
export function Dispositivo({ hora, children }: { hora: string; children: ReactNode }) {
  return (
    <div className="tl-dispositivo">
      <div className="tl-pantalla">
        <div className="tl-barra-estado" aria-hidden="true">
          <span className="num">{hora}</span>
          <span className="tl-isla" />
          <span className="tl-iconos">
            <Signal size={15} strokeWidth={2.6} />
            <Wifi size={15} strokeWidth={2.6} />
            <BatteryFull size={20} strokeWidth={2} />
          </span>
        </div>
        {children}
        <span className="tl-inicio" aria-hidden="true" />
      </div>
    </div>
  );
}
