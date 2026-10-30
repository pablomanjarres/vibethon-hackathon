import { expect } from "vitest";
import { estadoInicial } from "../escenario.ts";
import { ESCENARIO_INICIAL } from "../escenarios/index.ts";
import { ejecutar, type Comando } from "../motor.ts";
import type { Estado } from "../tipos.ts";

/** Shared helpers for the engine tests. The seed: Las Vegas 4/4 and Regional 6/6 full, A04 the only free cell. */
export const semilla = (): Estado => estadoInicial(ESCENARIO_INICIAL);

/** Runs commands that must all be accepted; fails with the engine's reason otherwise. */
export function correr(estado: Estado, ...comandos: Comando[]): Estado {
  let actual = estado;
  for (const comando of comandos) {
    const resultado = ejecutar(actual, comando);
    if (!resultado.ok) throw new Error(`${comando.tipo} fue rechazado: ${resultado.motivo}`);
    actual = resultado.estado;
  }
  return actual;
}

/** Runs a command that must be rejected, checks the state did not change, and returns the reason. */
export function rechazo(estado: Estado, comando: Comando): string {
  const antes = structuredClone(estado);
  const resultado = ejecutar(estado, comando);
  expect(resultado.ok).toBe(false);
  expect(estado).toEqual(antes);
  return resultado.ok ? "" : resultado.motivo;
}

/** Pays and takes out self-parked seed cars, freeing their cells. */
export function liberar(estado: Estado, ...placas: string[]): Estado {
  return correr(estado, ...placas.flatMap((placa): Comando[] => [{ tipo: "pagar", placa }, { tipo: "salir", placa }]));
}

export const celda = (estado: Estado, id: string) => estado.celdas.find((c) => c.id === id);
