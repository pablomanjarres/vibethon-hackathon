import { ordenAfuera, ordenDeAtencion } from "./asignador.ts";
import type { Estado } from "./tipos.ts";

/** How many recent cell movements (assignments and releases) the estimate looks at. */
const MOVIMIENTOS_RECIENTES = 8;

export interface Espera {
  /** Place in the combined order of both entrances, 1 = next. */
  posicion: number;
  /** Cars, from either entrance, served before this one (including cars leaving without parking). */
  carrosAdelante: number;
  /** Minute range, or null while there is not enough data. */
  rango: { min: number; max: number } | null;
  /** Upper bound of the range (0 without data or with a free cell now). */
  minutos: number;
  suficientesDatos: boolean;
  /** One sentence to show next to the numbers. */
  nota: string;
}

/** Gaps in minutes between the recent movements of cells: each one hands the line a cell or frees one. */
function intervalosRecientes(estado: Estado): number[] {
  const movimientos = [...(estado.asignaciones ?? []), ...(estado.liberaciones ?? [])].sort((a, b) => a - b).slice(-MOVIMIENTOS_RECIENTES);
  return movimientos.slice(1).map((m, i) => m - movimientos[i]);
}

/**
 * Wait estimate for a car in a passage or outside one. Position and cars ahead come from the split
 * order; minutes come from how fast cells moved recently, never from invented capacity.
 */
export function estimarEspera(estado: Estado, placa: string): Espera | null {
  const orden = [...ordenDeAtencion(estado), ...ordenAfuera(estado)];
  const indice = orden.indexOf(placa);
  if (indice < 0) return null;
  return estimarEnPuesto(estado, orden.slice(0, indice));
}

/** The estimate for a car that registers now at an entrance (for the arrival screen). */
export function estimarParaNuevo(estado: Estado, entradaId: string): Espera {
  const entrada = estado.entradas.find((e) => e.id === entradaId);
  const lleno = entrada ? entrada.fila.length >= entrada.capacidadPasaje : false;
  const adelante = lleno ? [...ordenDeAtencion(estado), ...ordenAfuera(estado)] : ordenDeAtencion(estado);
  return estimarEnPuesto(estado, adelante);
}

function estimarEnPuesto(estado: Estado, adelante: string[]): Espera {
  const libres = estado.celdas.filter((c) => c.estado === "libre").length;
  const queParquean = adelante.filter((p) => !estado.carros[p].sinParquear).length;
  const celdasQueFaltan = Math.max(0, queParquean + 1 - libres);
  const base = { posicion: adelante.length + 1, carrosAdelante: adelante.length };
  if (celdasQueFaltan === 0) {
    return { ...base, rango: { min: 0, max: 0 }, minutos: 0, suficientesDatos: true, nota: "Hay una celda libre para este puesto." };
  }
  const intervalos = intervalosRecientes(estado);
  if (intervalos.length < 2) {
    return {
      ...base,
      rango: null,
      minutos: 0,
      suficientesDatos: false,
      nota: "Aún no hay datos suficientes para estimar: la estimación aparece cuando se asignen o liberen celdas.",
    };
  }
  const corto = Math.max(1, Math.min(...intervalos));
  const largo = Math.max(corto, ...intervalos);
  const rango = { min: celdasQueFaltan * corto, max: celdasQueFaltan * largo };
  return { ...base, rango, minutos: rango.max, suficientesDatos: true, nota: "Es una estimación con los movimientos recientes del lote." };
}
