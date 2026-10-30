import { CarFront, OctagonAlert, ParkingSquare, type LucideIcon } from "lucide-react";
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
  /** When set, the action is not possible yet and this says why. */
  motivo?: string | null;
}

interface Etapa {
  tipo: Comando["tipo"];
  texto: string;
  accion?: (s: Servicio, estado: Estado) => AccionValet | null;
}

/** One service: paid, the valet confirms the driver's ficho and takes the keys, parks the car, and leaves the keys at the office. */
const ETAPAS: Etapa[] = [
  { tipo: "pagarValet", texto: "Pago aprobado" },
  { tipo: "entregarLlaves", texto: "Llegaste al carro" },
  { tipo: "confirmarFicho", texto: "Ficho confirmado y llaves recibidas" },
  {
    tipo: "estacionar",
    texto: "Carro estacionado",
    accion: (s, estado) =>
      s.celda
        ? {
            texto: `Ya lo estacioné en ${s.celda}`,
            Icono: ParkingSquare,
            comando: { tipo: "estacionar", placa: s.placa },
            motivo: estado.carros[s.placa]?.confirmado ? null : "Espera la confirmación de la portería",
          }
        : null,
  },
  {
    tipo: "dejarLlaves",
    texto: "Llaves en la oficina",
    accion: (s) => ({ texto: "Dejé las llaves en la oficina", Icono: CarFront, comando: { tipo: "dejarLlaves", ficho: s.ficho } }),
  },
];

const HECHOS: Record<string, number> = { "pago pendiente": 0, pagado: 1, "ficho emitido": 2, "en curso": 3, estacionado: 4 };

/** How many steps of this service are done. */
function hechos(_estado: Estado, s: Servicio): number {
  return HECHOS[s.estado] ?? ETAPAS.length;
}

/** Time of the latest log entry for this step that names the plate or the ficho. */
function horaDe(estado: Estado, tipo: string, s: Servicio): string | null {
  const evento = [...estado.bitacora].reverse().find((e) => e.tipo === tipo && (e.detalle.includes(s.placa) || e.detalle.includes(s.ficho)));
  return evento ? hora(estado.inicio, evento.minuto) : null;
}

/** The steps of the current assignment, how many are done, and the one action the valet takes next. */
export function etapasDe(estado: Estado, s: Servicio): { pasos: Paso[]; hechos: number; accion: AccionValet | null } {
  const lista = ETAPAS;
  const listos = hechos(estado, s);
  const pasos = lista.map((etapa, i) => ({
    texto: etapa.texto,
    hecho: i < listos,
    hora: i < listos ? (horaDe(estado, etapa.tipo, s) ?? (i === 0 ? s.asignado : null)) : null,
  }));
  return { pasos, hechos: listos, accion: lista[listos]?.accion?.(s, estado) ?? null };
}

/** While the car is headed to a reserved cell, the valet can report that cell taken and get another. */
export function celdaOcupada(estado: Estado, s: Servicio): AccionValet | null {
  const carro = estado.carros[s.placa];
  if (!s.celda || carro?.estado !== "con celda") return null;
  return { texto: "La celda está ocupada", Icono: OctagonAlert, comando: { tipo: "reportarCeldaOcupada", placa: s.placa } };
}
