import type { Celda, EstadoCelda, EstadoValet, Valet } from "./tipos.ts";

/** A command the rules do not allow. The engine turns it into a rejected result with this message. */
export class Rechazo extends Error {
  name = "Rechazo";
}

export function exigir(condicion: unknown, motivo: string): asserts condicion {
  if (!condicion) throw new Rechazo(motivo);
}

/** The only changes a cell may make. */
export const TRANSICIONES_CELDA: Record<EstadoCelda, readonly EstadoCelda[]> = {
  libre: ["reservada"],
  reservada: ["ocupada", "libre"],
  ocupada: ["libre"],
};

/** The only changes a valet may make. */
export const TRANSICIONES_VALET: Record<EstadoValet, readonly EstadoValet[]> = {
  disponible: ["reservado"],
  reservado: ["en servicio", "disponible"],
  "en servicio": ["disponible"],
};

export const ESTADOS_CELDA = Object.keys(TRANSICIONES_CELDA) as EstadoCelda[];
export const ESTADOS_VALET = Object.keys(TRANSICIONES_VALET) as EstadoValet[];

export function puedeCambiar<E extends string>(tabla: Record<E, readonly E[]>, de: E, a: E): boolean {
  return tabla[de].includes(a);
}

export function cambiarCelda(celda: Celda, a: EstadoCelda): void {
  exigir(puedeCambiar(TRANSICIONES_CELDA, celda.estado, a), `La celda ${celda.id} no puede pasar de ${celda.estado} a ${a}.`);
  celda.estado = a;
}

export function cambiarValet(valet: Valet, a: EstadoValet): void {
  exigir(puedeCambiar(TRANSICIONES_VALET, valet.estado, a), `El valet ${valet.id} no puede pasar de ${valet.estado} a ${a}.`);
  valet.estado = a;
}
