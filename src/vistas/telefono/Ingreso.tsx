import { Car } from "lucide-react";
import { IngresoConductor } from "../conductor/IngresoConductor";
import "../conductor/conductor.css";

/** Sign-in on the phone: plate and access code. Nothing about any car shows before both match. */
export function Ingreso({ placa, error }: { placa?: string; error?: string }) {
  return (
    <div className="tl-ingreso">
      <span className="tl-ingreso-icono" aria-hidden="true">
        <Car size={28} />
      </span>
      <h1>Parqueadero EAFIT</h1>
      <p className="ui-texto-suave">Entra con la placa de tu carro y el código que te dieron al registrarte.</p>
      {error && (
        <p className="tl-ingreso-error" role="alert">
          {error}
        </p>
      )}
      <IngresoConductor placa={placa} />
    </div>
  );
}
