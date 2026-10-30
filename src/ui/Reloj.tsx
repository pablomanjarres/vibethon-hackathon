import { Clock3 } from "lucide-react";
import { hora } from "../parqueadero/lecturas/formato";
import { useEstado } from "./useTienda";

/** The simulated clock of the shared state, shown in every view's bar. */
export function Reloj() {
  const estado = useEstado();
  return (
    <span className="ui-reloj num" aria-label={`Hora simulada ${hora(estado.inicio, estado.minuto)}`}>
      <Clock3 size={16} aria-hidden="true" />
      {hora(estado.inicio, estado.minuto)}
    </span>
  );
}
