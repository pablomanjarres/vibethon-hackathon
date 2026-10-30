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

/** Cars with a reserved cell wait here until the gate checks the plate: type it or pick it from the list. */
export function ConfirmarIngreso({ porConfirmar, onConfirmar, inputRef }: Props) {
  return (
    <TarjetaDatos Icono={ScanLine} titulo="Confirmar ingreso" contador={{ valor: porConfirmar.length, etiqueta: "Por confirmar" }}>
      <p className="pt-turno">Revisa la placa contra su reserva: el carro no puede estacionar hasta que la confirmes.</p>
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
