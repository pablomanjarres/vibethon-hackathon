import { asignarCelda, estacionar, registrarLlegada, reservarCelda } from "./comandos/filas.ts";
import { avanzarReloj, pagar, salir } from "./comandos/salida.ts";
import { entregarCarro, entregarLlaves, pedirDevolucion, pedirValet, recogerCarro } from "./comandos/valet.ts";
import { Rechazo } from "./transiciones.ts";
import type { Estado, Evento } from "./tipos.ts";

/** Every change the driver, gate, valet and office views can ask for. */
export type Comando =
  | { tipo: "registrarLlegada"; placa: string; entrada: string }
  | { tipo: "asignarCelda"; entrada: string }
  | { tipo: "reservarCelda"; placa: string; celda: string }
  | { tipo: "estacionar"; placa: string }
  | { tipo: "pedirValet"; placa: string }
  | { tipo: "entregarLlaves"; placa: string }
  | { tipo: "pedirDevolucion"; ficho: string }
  | { tipo: "recogerCarro"; ficho: string }
  | { tipo: "entregarCarro"; ficho: string }
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
    case "estacionar":
      return estacionar(estado, comando.placa);
    case "pedirValet":
      return pedirValet(estado, comando.placa);
    case "entregarLlaves":
      return entregarLlaves(estado, comando.placa);
    case "pedirDevolucion":
      return pedirDevolucion(estado, comando.ficho);
    case "recogerCarro":
      return recogerCarro(estado, comando.ficho);
    case "entregarCarro":
      return entregarCarro(estado, comando.ficho);
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
