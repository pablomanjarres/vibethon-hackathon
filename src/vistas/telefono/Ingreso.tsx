import { Car, LogIn } from "lucide-react";
import type { Estado } from "../../parqueadero/tipos";
import { Acordeon } from "../../ui/Acordeon";
import { IngresoConductor } from "../conductor/IngresoConductor";
import { RegistroLlegada } from "../conductor/RegistroLlegada";
import "../conductor/conductor.css";

interface Props {
  estado: Estado;
  onRegistrada: (placa: string, codigo: string, texto: string) => void;
  placa?: string;
  /** Why the plate and code did not open a car; the sign-in then starts open. */
  error?: string;
}

/** The phone's first screen: register a car on arrival, or sign in with plate and code. Nothing about any car shows before both match. */
export function Ingreso({ estado, onRegistrada, placa, error }: Props) {
  return (
    <div className="tl-ingreso">
      <span className="tl-ingreso-icono" aria-hidden="true">
        <Car size={28} />
      </span>
      <h1>Guarda tu puesto</h1>
      <p className="ui-texto-suave">Tu placa y tu entrada, y entras a la fila del parqueadero de EAFIT.</p>
      {error && (
        <p className="tl-ingreso-error" role="alert">
          {error}
        </p>
      )}
      <RegistroLlegada estado={estado} onRegistrada={onRegistrada} />
      <Acordeon Icono={LogIn} titulo="Ya me registré" inicial={Boolean(error)}>
        <IngresoConductor placa={placa} />
      </Acordeon>
    </div>
  );
}
