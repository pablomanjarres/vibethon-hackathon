import { CarFront, Clock3, Hand, KeyRound, ParkingSquare, UserRoundCheck } from "lucide-react";
import type { Insignia } from "./Pastilla";

/** Text, icon and tone for every cell state. The one place a cell status gets its look, on the map and in the panel. */
export const ESTADO_CELDA = {
  libre: { texto: "Libre", Icono: ParkingSquare, tono: "libre" },
  reservada: { texto: "Reservada", Icono: Clock3, tono: "reservada" },
  ocupada: { texto: "Ocupada", Icono: CarFront, tono: "ocupada" },
} as const satisfies Record<string, Insignia>;

/** Text, icon and tone for every valet state. */
export const ESTADO_VALET = {
  disponible: { texto: "Disponible", Icono: UserRoundCheck, tono: "libre" },
  reservado: { texto: "Reservado", Icono: Hand, tono: "reservada" },
  "en servicio": { texto: "En servicio", Icono: KeyRound, tono: "ocupada" },
} as const satisfies Record<string, Insignia>;

export type EstadoCeldaUi = keyof typeof ESTADO_CELDA;
export type EstadoValetUi = keyof typeof ESTADO_VALET;
