import type { Espera } from "../../parqueadero/espera";
import { carros } from "../../parqueadero/lecturas/formato";

/** The range alone: "entre 7 y 28 min", or why there are no minutes yet. Never a lone "0 min". */
export function rangoEspera(espera: Espera): string {
  if (!espera.suficientesDatos || !espera.rango) return "aún sin datos para estimar";
  const { min, max } = espera.rango;
  if (max === 0) return "celda libre para ti";
  return min === max ? `${max} min (estimado)` : `entre ${min} y ${max} min (estimado)`;
}

/** The wait in one line: "Puesto 3 · entre 7 y 28 min (estimado)". */
export function lineaEspera(espera: Espera): string {
  return `Puesto ${espera.posicion} · ${rangoEspera(espera)}`;
}

/** Cars ahead, plus the estimate's note only when the line shows minutes (the other states say it already). */
export function detalleEspera(espera: Espera): string {
  const adelante = `${espera.carrosAdelante === 0 ? "Nadie" : carros(espera.carrosAdelante)} antes que tú.`;
  return espera.rango && espera.rango.max > 0 ? `${adelante} ${espera.nota}` : adelante;
}
