import { CarFront, MapPin, X } from "lucide-react";
import type { detalleCelda } from "../../parqueadero/lecturas/registro";
import { Boton } from "../../ui/Boton";
import { Datos } from "../../ui/Datos";
import { ESTADO_CELDA } from "../../ui/estados";
import { Pastilla } from "../../ui/Pastilla";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { horasCarro } from "./carro";

interface Props {
  detalle: NonNullable<ReturnType<typeof detalleCelda>>;
  onVerCarro: (placa: string) => void;
  onCerrar: () => void;
}

const TEXTO = {
  libre: "Lista para el siguiente carro en la fila.",
  reservada: "Apartada para un carro que va en camino.",
  ocupada: "Hay un carro estacionado.",
};

/** One cell opened up from the map: its state, its zone and the car in it, which can be opened in turn. */
export function DetalleCelda({ detalle: { celda, carro }, onVerCarro, onCerrar }: Props) {
  return (
    <TarjetaDatos Icono={MapPin} titulo={`Celda ${celda.id}`}>
      <Pastilla {...ESTADO_CELDA[celda.estado]} />
      <p className="ui-texto-suave">{TEXTO[celda.estado]}</p>
      <Datos
        filas={[
          { etiqueta: "Zona", valor: celda.zona },
          { etiqueta: "Placa", valor: carro?.placa ?? "Sin carro" },
          ...(carro ? [{ etiqueta: "Entrada", valor: carro.entrada }, { etiqueta: "Horas", valor: horasCarro(carro) }] : []),
        ]}
      />
      {carro && (
        <Boton variante="secundario" Icono={CarFront} onClick={() => onVerCarro(carro.placa)}>
          Ver carro {carro.placa}
        </Boton>
      )}
      <Boton variante="contorno" Icono={X} onClick={onCerrar}>
        Cerrar detalle
      </Boton>
    </TarjetaDatos>
  );
}
