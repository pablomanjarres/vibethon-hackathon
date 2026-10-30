import { esperaDe } from "./consultas.ts";
import { ordenDeAtencion } from "./equidad.ts";
import type { Estado } from "./tipos.ts";

export interface Espera {
  /** Cars, from either entrance, that get a cell before this one. */
  carrosAdelante: number;
  minutos: number;
}

/**
 * Wait estimate for a car in a passage: cars ahead in the fairness order, minus the cells free
 * right now, times the scenario's minutes between two cells freeing up.
 */
export function estimarEspera(estado: Estado, placa: string): Espera | null {
  const orden = ordenDeAtencion(estado);
  let posicion = orden.indexOf(placa);
  if (posicion < 0) {
    // Outside a full passage: behind every car already in a passage and every earlier registration outside.
    const afuera = estado.entradas.flatMap((e) => esperaDe(e)).sort((a, b) => estado.carros[a].llegoEn - estado.carros[b].llegoEn);
    const puesto = afuera.indexOf(placa);
    if (puesto < 0) return null;
    posicion = orden.length + puesto;
  }
  const libres = estado.celdas.filter((c) => c.estado === "libre").length;
  return {
    carrosAdelante: posicion,
    minutos: Math.max(0, posicion + 1 - libres) * estado.reglas.minutosPorLiberacion,
  };
}
