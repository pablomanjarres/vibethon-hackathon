import { siguienteEntrada } from "../equidad.ts";
import { estimarEspera } from "../espera.ts";
import type { Estado } from "../tipos.ts";
import { hora } from "./formato.ts";

export interface CarroEnPasaje {
  placa: string;
  llego: string;
  esperaMinutos: number;
  conValet: boolean;
}

export interface VistaPorteria {
  entrada: string;
  nombre: string;
  pasaje: { ocupados: number; capacidad: number };
  fila: CarroEnPasaje[];
  esMiTurno: boolean;
  /** Why this gate may or may not hand out the next cell. */
  turno: string;
  puedeAsignar: boolean;
  celdasLibres: string[];
  valetsDisponibles: number;
}

/** One gate: its passage, whose turn it is and why, and the free cells. */
export function vistaPorteria(estado: Estado, entradaId: string): VistaPorteria {
  const entrada = estado.entradas.find((e) => e.id === entradaId);
  if (!entrada) throw new Error(`No existe la entrada ${entradaId}.`);
  const deTurno = siguienteEntrada(estado);
  const esMiTurno = deTurno?.id === entrada.id;
  const celdasLibres = estado.celdas.filter((c) => c.estado === "libre").map((c) => c.id);
  let turno: string;
  if (entrada.fila.length === 0) turno = "No hay carros en el pasaje.";
  else if (!esMiTurno) turno = `Turno de ${deTurno?.nombre}: su primer carro llegó antes.`;
  else if (celdasLibres.length === 0) turno = "Es tu turno, pero no hay celdas libres.";
  else turno = `Tu turno: ${entrada.fila[0]} puede pasar a la celda ${celdasLibres[0]}.`;
  return {
    entrada: entrada.id,
    nombre: entrada.nombre,
    pasaje: { ocupados: entrada.fila.length, capacidad: entrada.capacidadPasaje },
    fila: entrada.fila.map((placa) => ({
      placa,
      llego: hora(estado.inicio, estado.carros[placa].llegoEn),
      esperaMinutos: estimarEspera(estado, placa)?.minutos ?? 0,
      conValet: estado.carros[placa].servicio !== null,
    })),
    esMiTurno,
    turno,
    puedeAsignar: esMiTurno && celdasLibres.length > 0,
    celdasLibres,
    valetsDisponibles: estado.valets.filter((v) => v.entrada === entrada.id && v.estado === "disponible").length,
  };
}
