import type { Ref } from "react";
import { ScanLine } from "lucide-react";
import type { VistaPorteria } from "../../parqueadero/lecturas/porteria";
import { CampoPlaca } from "../../ui/CampoPlaca";
import { TarjetaDatos } from "../../ui/TarjetaDatos";

interface Props {
  porConfirmar: VistaPorteria["porConfirmar"];
  /** Sends the plate to the engine; true when it was accepted. */
  onConfirmar: (placa: string) => boolean;
  inputRef?: Ref<HTMLInputElement>;
}

/** Manual fallback for the gate camera: type a plate or pick a car the camera could not confirm. */
export function ConfirmarIngreso({ porConfirmar, onConfirmar, inputRef }: Props) {
  return (
    <TarjetaDatos Icono={ScanLine} titulo="Confirmación manual" contador={{ valor: porConfirmar.length, etiqueta: "Por confirmar" }}>
      <p className="pt-turno">La cámara confirma cada placa sola. Usa esto solo si no la pudo leer: revisa la placa contra su reserva.</p>
      <CampoPlaca etiqueta="Placa en la portería" accion="Confirmar" Icono={ScanLine} onEnviar={onConfirmar} inputRef={inputRef} />
      <ul className="ui-lista pt-confirmar">
        {porConfirmar.map((carro) => (
          <li key={carro.placa}>
            <button type="button" className="pt-placa-fila" onClick={() => onConfirmar(carro.placa)}>
              <span className="pt-placa">
                <strong className="num">{carro.placa}</strong>
                <span className="ui-texto-suave num">Reserva en la celda {carro.celda}</span>
              </span>
              <span className="pt-confirmar-accion">Confirmar</span>
            </button>
          </li>
        ))}
      </ul>
    </TarjetaDatos>
  );
}
