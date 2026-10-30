import { CarFront, KeyRound, ParkingSquare, Undo2, type LucideIcon } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import { hora } from "../../parqueadero/lecturas/formato";
import type { VistaValet } from "../../parqueadero/lecturas/valet";
import type { Estado } from "../../parqueadero/tipos";
import type { Paso } from "./Progreso";

export type Servicio = NonNullable<VistaValet["servicio"]>;

export interface AccionValet {
  texto: string;
  Icono: LucideIcon;
  comando: Comando;
}

interface Etapa {
  tipo: Comando["tipo"];
  texto: string;
  accion?: (s: Servicio) => AccionValet | null;
}

/** Taking a car in: the valet gets the keys, then parks it in the reserved cell. */
const ENTRADA: Etapa[] = [
  { tipo: "pedirValet", texto: "Asignación recibida" },
  {
    tipo: "entregarLlaves",
    texto: "Llaves recibidas",
    accion: (s) => ({ texto: "Recibí las llaves", Icono: KeyRound, comando: { tipo: "entregarLlaves", placa: s.placa } }),
  },
  {
    tipo: "estacionar",
    texto: "Carro estacionado",
    accion: (s) => (s.celda ? { texto: `Ya lo estacioné en ${s.celda}`, Icono: ParkingSquare, comando: { tipo: "estacionar", placa: s.placa } } : null),
  },
];

/** Giving a car back: the valet takes it out of the cell, then hands it over against the ficho. */
const DEVOLUCION: Etapa[] = [
  { tipo: "pedirDevolucion", texto: "Devolución pedida" },
  {
    tipo: "recogerCarro",
    texto: "Carro sacado de la celda",
    accion: (s) => ({ texto: s.celda ? `Saqué el carro de ${s.celda}` : "Saqué el carro", Icono: CarFront, comando: { tipo: "recogerCarro", ficho: s.ficho } }),
  },
  {
    tipo: "entregarCarro",
    texto: "Carro entregado",
    accion: (s) => ({ texto: "Entregué el carro", Icono: Undo2, comando: { tipo: "entregarCarro", ficho: s.ficho } }),
  },
];

/** How many steps of this assignment are done, read from the service and the car. */
function hechos(estado: Estado, s: Servicio): number {
  if (s.estado === "devolución") return estado.carros[s.placa]?.estado === "estacionado" ? 1 : 2;
  if (s.estado === "entregado") return DEVOLUCION.length;
  if (s.estado === "solicitado") return 1;
  if (s.estado === "en curso") return 2;
  return ENTRADA.length;
}

/** Time of the latest log entry for this step that names the plate or the ficho. */
function horaDe(estado: Estado, tipo: string, s: Servicio): string | null {
  const evento = [...estado.bitacora].reverse().find((e) => e.tipo === tipo && (e.detalle.includes(s.placa) || e.detalle.includes(s.ficho)));
  return evento ? hora(estado.inicio, evento.minuto) : null;
}

/** The steps of the current assignment, how many are done, and the one action the valet takes next. */
export function etapasDe(estado: Estado, s: Servicio): { pasos: Paso[]; hechos: number; accion: AccionValet | null } {
  const lista = s.estado === "devolución" || s.estado === "entregado" ? DEVOLUCION : ENTRADA;
  const listos = hechos(estado, s);
  const pasos = lista.map((etapa, i) => ({
    texto: etapa.texto,
    hecho: i < listos,
    hora: i < listos ? (horaDe(estado, etapa.tipo, s) ?? (i === 0 ? s.asignado : null)) : null,
  }));
  return { pasos, hechos: listos, accion: lista[listos]?.accion?.(s) ?? null };
}
