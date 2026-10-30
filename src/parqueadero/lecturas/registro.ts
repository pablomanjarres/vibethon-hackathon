import type { Carro, Celda, Estado, EstadoCarro, Evento } from "../tipos.ts";
import { nombreEntrada } from "../consultas.ts";
import { hora } from "./formato.ts";

/** One car as the office sees it: where it came in and the times it arrived, parked and left. */
export interface RegistroCarro {
  placa: string;
  /** Entrance id, or null for cars already in the lot when the scenario starts. */
  entradaId: string | null;
  entrada: string;
  estado: EstadoCarro;
  celda: string | null;
  llego: string;
  estacionado: string | null;
  salio: string | null;
  valet: string | null;
  ficho: string | null;
  pagado: boolean;
  monto: number | null;
}

function registro(estado: Estado, carro: Carro): RegistroCarro {
  const servicio = carro.servicio ? estado.servicios[carro.servicio] : null;
  const pago = [...estado.pagos].reverse().find((p) => p.placa === carro.placa);
  return {
    placa: carro.placa,
    entradaId: carro.entrada,
    entrada: carro.entrada ? nombreEntrada(estado, carro.entrada) : "Ya en el lote",
    estado: carro.estado,
    celda: carro.celda,
    llego: hora(estado.inicio, carro.llegoEn),
    estacionado: carro.estacionadoEn === null ? null : hora(estado.inicio, carro.estacionadoEn),
    salio: carro.salioEn == null ? null : hora(estado.inicio, carro.salioEn),
    valet: servicio?.valet ?? null,
    ficho: servicio?.ficho ?? null,
    pagado: carro.pagado,
    monto: pago?.monto ?? null,
  };
}

const ultimaActividad = (c: Carro) => Math.max(c.llegoEn, c.estacionadoEn ?? -Infinity, c.salioEn ?? -Infinity);

/**
 * Every car the office follows, newest activity first. With `entradaId`, only the cars that came in
 * through that entrance (each office sees its own gate).
 */
export function registroCarros(estado: Estado, entradaId?: string): RegistroCarro[] {
  return Object.values(estado.carros)
    .filter((c) => entradaId === undefined || c.entrada === entradaId)
    .sort((a, b) => ultimaActividad(b) - ultimaActividad(a))
    .map((c) => registro(estado, c));
}

/** One car's full record plus every log entry that mentions it, newest first. */
export function detalleCarro(estado: Estado, placa: string): (RegistroCarro & { historial: Evento[] }) | null {
  const carro = estado.carros[placa];
  if (!carro) return null;
  const menciona = new RegExp(`\\b${placa}\\b`);
  return { ...registro(estado, carro), historial: estado.bitacora.filter((e) => menciona.test(e.detalle)).reverse() };
}

/** One cell with the car in it, if any. */
export function detalleCelda(estado: Estado, celdaId: string): { celda: Celda; carro: RegistroCarro | null } | null {
  const celda = estado.celdas.find((c) => c.id === celdaId);
  if (!celda) return null;
  const carro = celda.placa ? estado.carros[celda.placa] : undefined;
  return { celda, carro: carro ? registro(estado, carro) : null };
}
