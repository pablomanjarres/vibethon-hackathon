import {
  asignarCelda,
  confirmarIngreso,
  dejarSalir,
  estacionar,
  registrarLlegada,
  reportarCeldaOcupada,
  reservarCelda,
  salirSinParquear,
} from "./comandos/filas.ts";
import { avanzarReloj, pagar, salir } from "./comandos/salida.ts";
import { confirmarFicho, contratarValet, dejarLlaves, entregarLlaves, pagarValet, reclamarLlaves } from "./comandos/valet.ts";
import { Rechazo } from "./transiciones.ts";
import type { Estado, Evento } from "./tipos.ts";

/** Every change the driver, gate, valet and office views can ask for. */
export type Comando =
  | { tipo: "registrarLlegada"; placa: string; entrada: string }
  | { tipo: "asignarCelda"; entrada: string }
  | { tipo: "reservarCelda"; placa: string; celda: string }
  | { tipo: "confirmarIngreso"; entrada: string; placa: string }
  | { tipo: "salirSinParquear"; placa: string }
  | { tipo: "dejarSalir"; entrada: string }
  | { tipo: "reportarCeldaOcupada"; placa: string }
  | { tipo: "estacionar"; placa: string }
  | { tipo: "contratarValet"; placa: string; valet: string }
  | { tipo: "pagarValet"; servicio: string; aprobado: boolean }
  | { tipo: "entregarLlaves"; placa: string }
  | { tipo: "confirmarFicho"; placa: string; ficho: string }
  | { tipo: "dejarLlaves"; ficho: string }
  | { tipo: "reclamarLlaves"; ficho: string }
  | { tipo: "pagar"; placa: string }
  | { tipo: "salir"; placa: string }
  | { tipo: "avanzarReloj"; minutos: number };

export type Resultado =
  | { ok: true; estado: Estado; evento: Evento }
  | { ok: false; estado: Estado; motivo: string };

function aplicar(estado: Estado, comando: Comando): string {
  switch (comando.tipo) {
    case "registrarLlegada":
      return registrarLlegada(estado, comando.placa, comando.entrada);
    case "asignarCelda":
      return asignarCelda(estado, comando.entrada);
    case "reservarCelda":
      return reservarCelda(estado, comando.placa, comando.celda);
    case "confirmarIngreso":
      return confirmarIngreso(estado, comando.entrada, comando.placa);
    case "salirSinParquear":
      return salirSinParquear(estado, comando.placa);
    case "dejarSalir":
      return dejarSalir(estado, comando.entrada);
    case "reportarCeldaOcupada":
      return reportarCeldaOcupada(estado, comando.placa);
    case "estacionar":
      return estacionar(estado, comando.placa);
    case "contratarValet":
      return contratarValet(estado, comando.placa, comando.valet);
    case "pagarValet":
      return pagarValet(estado, comando.servicio, comando.aprobado);
    case "entregarLlaves":
      return entregarLlaves(estado, comando.placa);
    case "confirmarFicho":
      return confirmarFicho(estado, comando.placa, comando.ficho);
    case "dejarLlaves":
      return dejarLlaves(estado, comando.ficho);
    case "reclamarLlaves":
      return reclamarLlaves(estado, comando.ficho);
    case "pagar":
      return pagar(estado, comando.placa);
    case "salir":
      return salir(estado, comando.placa);
    case "avanzarReloj":
      return avanzarReloj(estado, comando.minutos);
  }
}

/**
 * The single entry point for every state change. It works on a copy, so a rejected command
 * leaves the state exactly as it was and returns the reason to show the person.
 */
export function ejecutar(estado: Estado, comando: Comando): Resultado {
  const borrador = structuredClone(estado);
  try {
    const evento: Evento = { minuto: borrador.minuto, tipo: comando.tipo, detalle: aplicar(borrador, comando) };
    borrador.bitacora.push(evento);
    return { ok: true, estado: borrador, evento };
  } catch (error) {
    if (error instanceof Rechazo) return { ok: false, estado, motivo: error.message };
    throw error;
  }
}
