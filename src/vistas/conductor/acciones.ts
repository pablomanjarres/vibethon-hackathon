import { Banknote, CarFront, KeyRound, LogOut, ParkingSquare, type LucideIcon } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import type { VistaConductor } from "../../parqueadero/lecturas/conductor";

export type Seccion = "turno" | "ficho" | "pago";

export interface Paso {
  seccion: Seccion;
  texto: string;
  Icono: LucideIcon;
  comando: Comando;
}

/** The follow-up steps the driver can take, each shown in the section it belongs to. */
export function pasos(v: VistaConductor): Paso[] {
  if (!v.encontrado) return [];
  const lista: Paso[] = [];
  if (v.ficho && v.llave === "conductor" && v.estado === "en fila")
    lista.push({ seccion: "ficho", texto: "Ya entregué las llaves", Icono: KeyRound, comando: { tipo: "entregarLlaves", placa: v.placa } });
  if (v.estado === "con celda" && !v.ficho) lista.push({ seccion: "turno", texto: "Ya estacioné", Icono: ParkingSquare, comando: { tipo: "estacionar", placa: v.placa } });
  if (v.ficho && v.estado === "estacionado") lista.push({ seccion: "ficho", texto: "Pedir mi carro", Icono: CarFront, comando: { tipo: "pedirDevolucion", ficho: v.ficho } });
  if (!v.pagado && (v.estado === "estacionado" || v.estado === "en devolución"))
    lista.push({ seccion: "pago", texto: "Pagar", Icono: Banknote, comando: { tipo: "pagar", placa: v.placa } });
  if (!v.ficho && v.pagado && v.estado === "estacionado") lista.push({ seccion: "pago", texto: "Salir", Icono: LogOut, comando: { tipo: "salir", placa: v.placa } });
  return lista;
}

/** Why "Reservar valet" cannot act now, or null when it can. */
export function motivoValet(v: VistaConductor): string | null {
  if (v.puedePedirValet) return null;
  if (v.ficho) return `ya tienes el ficho ${v.ficho}.`;
  if (v.estado === "en fila" || v.estado === "en espera") return "primero reserva tu celda: el valet necesita saber dónde estacionar.";
  if (v.estado !== "con celda") return "se pide cuando tienes una celda reservada.";
  return "no hay valets disponibles ahora.";
}
