import type { ReactNode } from "react";
import { ParkingSquare } from "lucide-react";
import { Cifra, Datos, Tarjeta } from "../../ui/Tarjeta";

interface Props {
  celda: string | null;
  minutos: number | null;
  pagado: boolean;
  children?: ReactNode;
}

/** Where the car is: cell, time since parking and payment, with the next actions below. */
export function Estacionado({ celda, minutos, pagado, children }: Props) {
  return (
    <Tarjeta titulo="Tu carro" Icono={ParkingSquare}>
      <div className="ui-cifras">
        <Cifra valor={celda ?? "—"} etiqueta="Celda" />
        {minutos !== null && <Cifra valor={`${minutos} min`} etiqueta="Estacionado hace" />}
      </div>
      <Datos filas={[{ etiqueta: "Pago", valor: pagado ? "Pagado" : "Pendiente" }]} />
      {children}
    </Tarjeta>
  );
}
