import { ArrowLeftRight, CarFront, Hourglass, ListOrdered, LogOut, Navigation } from "lucide-react";
import type { EstadoCarro } from "../../parqueadero/tipos";
import type { Insignia } from "../../ui/Pastilla";

/** Text, icon and tone for each car state the gate looks up. */
export const ESTADO_CARRO: Record<EstadoCarro, Insignia> = {
  "en espera": { texto: "Afuera", Icono: Hourglass, tono: "reservada" },
  "en fila": { texto: "En el pasaje", Icono: ListOrdered, tono: "reservada" },
  "con celda": { texto: "Va a su celda", Icono: Navigation, tono: "libre" },
  estacionado: { texto: "Estacionado", Icono: CarFront, tono: "ocupada" },
  "en devolución": { texto: "En devolución", Icono: ArrowLeftRight, tono: "reservada" },
  retirado: { texto: "Salió", Icono: LogOut, tono: "neutro" },
};
