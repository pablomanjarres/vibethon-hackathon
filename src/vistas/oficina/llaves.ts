import { CarFront, CheckCheck, KeyRound } from "lucide-react";
import type { Estado, EstadoServicio, Servicio } from "../../parqueadero/tipos";
import type { Insignia } from "../../ui/Pastilla";

/** Where the keys of a received ficho are, as the office reads the service state. */
export type EstadoLlave = "valet" | "oficina" | "entregadas";

const LLAVE_POR_SERVICIO: Partial<Record<EstadoServicio, EstadoLlave>> = {
  "ficho emitido": "valet",
  "en curso": "valet",
  estacionado: "valet",
  "llaves en oficina": "oficina",
  entregado: "entregadas",
};

export const ESTADO_LLAVE = {
  valet: { texto: "Llaves con el valet", Icono: CarFront, tono: "reservada" },
  oficina: { texto: "En la oficina", Icono: KeyRound, tono: "libre" },
  entregadas: { texto: "Entregadas", Icono: CheckCheck, tono: "neutro" },
} as const satisfies Record<EstadoLlave, Insignia>;

export interface FichoRecibido {
  servicio: Servicio;
  llave: EstadoLlave;
  celda: string | null;
  /** The valet is back at the desk with the keys of a parked car: the office can receive them. */
  puedeRecibir: boolean;
}

/** Every ficho already handed to a driver, newest first, with its car's cell and where its keys are. */
export function fichosRecibidos(estado: Estado, placas: Set<string> | null): FichoRecibido[] {
  return Object.values(estado.servicios)
    .filter((s) => LLAVE_POR_SERVICIO[s.estado] && (!placas || placas.has(s.placa)))
    .reverse()
    .map((servicio) => ({
      servicio,
      llave: LLAVE_POR_SERVICIO[servicio.estado]!,
      celda: estado.carros[servicio.placa]?.celda ?? null,
      puedeRecibir: servicio.estado === "estacionado",
    }));
}
