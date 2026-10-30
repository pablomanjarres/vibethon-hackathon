import { ArrowLeftRight, CarFront, Clock3, Hourglass, LogOut, ParkingSquare } from "lucide-react";
import type { RegistroCarro } from "../../parqueadero/lecturas/registro";
import type { EstadoCarro } from "../../parqueadero/tipos";
import type { Insignia } from "../../ui/Pastilla";

/** Text, icon and tone for each car state as the office reads it. */
export const ESTADO_CARRO = {
  "en espera": { texto: "Esperando afuera", Icono: Hourglass, tono: "reservada" },
  "en fila": { texto: "En el pasaje", Icono: Clock3, tono: "reservada" },
  "con celda": { texto: "Con celda", Icono: ParkingSquare, tono: "reservada" },
  estacionado: { texto: "Estacionado", Icono: CarFront, tono: "ocupada" },
  "en devolución": { texto: "En devolución", Icono: ArrowLeftRight, tono: "reservada" },
  retirado: { texto: "Salió", Icono: LogOut, tono: "neutro" },
} as const satisfies Record<EstadoCarro, Insignia>;

/** "Llegó 06:29 · Estacionó 06:41 · Salió 07:02", only the times that already happened. */
export function horasCarro(carro: RegistroCarro): string {
  return [`Llegó ${carro.llego}`, carro.estacionado && `Estacionó ${carro.estacionado}`, carro.salio && `Salió ${carro.salio}`]
    .filter(Boolean)
    .join(" · ");
}

export function dinero(total: number, moneda: string): string {
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: moneda, maximumFractionDigits: 0 }).format(total);
  } catch {
    return `${total.toLocaleString("es-CO")} ${moneda}`;
  }
}
