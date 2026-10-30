import { FlaskConical } from "lucide-react";
import type { Estado } from "../../parqueadero/tipos";
import { Acordeon } from "../../ui/Acordeon";
import { SelectorPlacas } from "../telefono/SelectorPlacas";

/** Demo shortcut (only with ?demo): every plate in the lot with its code, one click to sign in as it. */
export function ModoDemo({ estado, placa }: { estado: Estado; placa: string | null }) {
  return (
    <div>
      <Acordeon Icono={FlaskConical} titulo="Modo demo" extra="Entrar como otra placa">
        <div className="cd-demo">
          <SelectorPlacas estado={estado} vista="conductor" actual={placa ?? ""} extra={{ demo: "1" }} />
        </div>
      </Acordeon>
    </div>
  );
}
