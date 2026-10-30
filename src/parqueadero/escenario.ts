import type { Carro, Celda, Entrada, Estado, EstadoCelda, Mapa, Reglas, Valet } from "./tipos.ts";

/**
 * Shape of a scenario file in escenarios/. The organizers' maps, starting conditions and
 * simulation events arrive in this shape; nothing about the lot is hardcoded elsewhere.
 */
export interface CeldaInicial {
  id: string;
  zona: string;
  x: number;
  y: number;
  estado: EstadoCelda;
  placa?: string;
  /** Minute the car parked, relative to the start (negative means before it). */
  desde?: number;
}

export interface MapaInicial extends Mapa {
  celdas: CeldaInicial[];
}

export interface EntradaInicial {
  id: string;
  codigo: string;
  nombre: string;
  capacidadPasaje: number;
  valets: number;
  fila: { placa: string; llegoEn: number }[];
}

export type EventoSimulado =
  | { minuto: number; tipo: "llegada"; placa: string; entrada: string }
  | { minuto: number; tipo: "salida"; placa: string };

export interface Escenario {
  id: string;
  nombre: string;
  inicio: string;
  reglas: Reglas;
  mapas: MapaInicial[];
  entradas: EntradaInicial[];
  eventos: EventoSimulado[];
}

export class EscenarioInvalido extends Error {
  name = "EscenarioInvalido";
}

function revisar(condicion: unknown, mensaje: string): asserts condicion {
  if (!condicion) throw new EscenarioInvalido(`Escenario inválido: ${mensaje}`);
}

const ESTADOS_INICIALES: readonly string[] = ["libre", "reservada", "ocupada"];

/** Checks a scenario file before the app uses it, so a bad map fails at load with a clear message. */
export function validarEscenario(datos: unknown): Escenario {
  const esc = datos as Escenario;
  revisar(esc && typeof esc === "object", "no es un objeto.");
  revisar(typeof esc.id === "string" && esc.id.length > 0, "falta el id.");
  revisar(/^\d{2}:\d{2}$/.test(esc.inicio ?? ""), "inicio debe tener la forma HH:MM.");
  const r = esc.reglas;
  revisar(
    r && [r.minutosPorLiberacion, r.tarifaPorMinuto, r.tarifaValet].every((n) => Number.isFinite(n) && n >= 0),
    "las reglas necesitan minutosPorLiberacion, tarifaPorMinuto y tarifaValet.",
  );
  revisar(Array.isArray(esc.mapas) && esc.mapas.length > 0, "necesita al menos un mapa.");
  revisar(Array.isArray(esc.entradas) && esc.entradas.length > 0, "necesita al menos una entrada.");

  const placas = new Set<string>();
  const placaNueva = (placa: string | undefined, donde: string) => {
    revisar(typeof placa === "string" && placa.length > 0, `${donde} necesita placa.`);
    revisar(!placas.has(placa), `la placa ${placa} aparece dos veces.`);
    placas.add(placa);
  };
  const celdas = new Set<string>();
  for (const mapa of esc.mapas) {
    revisar(Array.isArray(mapa.celdas) && mapa.celdas.length > 0, `el mapa ${mapa.id} no tiene celdas.`);
    for (const celda of mapa.celdas) {
      revisar(!celdas.has(celda.id), `la celda ${celda.id} aparece dos veces.`);
      celdas.add(celda.id);
      revisar(ESTADOS_INICIALES.includes(celda.estado), `la celda ${celda.id} tiene un estado desconocido.`);
      revisar(
        celda.x >= 1 && celda.x <= mapa.columnas && celda.y >= 1 && celda.y <= mapa.filas,
        `la celda ${celda.id} está fuera del mapa ${mapa.id}.`,
      );
      if (celda.estado === "libre") revisar(!celda.placa, `la celda libre ${celda.id} no puede tener placa.`);
      else placaNueva(celda.placa, `la celda ${celda.estado} ${celda.id}`);
    }
  }
  const entradas = new Set<string>();
  for (const entrada of esc.entradas) {
    revisar(!entradas.has(entrada.id), `la entrada ${entrada.id} aparece dos veces.`);
    entradas.add(entrada.id);
    revisar(Number.isInteger(entrada.capacidadPasaje) && entrada.capacidadPasaje > 0, `${entrada.nombre} necesita capacidadPasaje.`);
    revisar(Number.isInteger(entrada.valets) && entrada.valets >= 0, `${entrada.nombre} necesita un número de valets.`);
    revisar(
      entrada.fila.length <= entrada.capacidadPasaje,
      `la fila de ${entrada.nombre} supera su pasaje (${entrada.fila.length} de ${entrada.capacidadPasaje}).`,
    );
    for (const carro of entrada.fila) placaNueva(carro.placa, `un carro de la fila de ${entrada.nombre}`);
  }
  for (const evento of esc.eventos ?? []) {
    revisar(evento.tipo === "llegada" || evento.tipo === "salida", `hay un evento de tipo desconocido.`);
    if (evento.tipo === "llegada") revisar(entradas.has(evento.entrada), `la llegada de ${evento.placa} usa una entrada desconocida.`);
  }
  return { ...esc, eventos: esc.eventos ?? [] };
}

function carroNuevo(placa: string, datos: Partial<Carro>): Carro {
  return {
    placa,
    entrada: null,
    estado: "en fila",
    llegoEn: 0,
    celda: null,
    servicio: null,
    estacionadoEn: null,
    llave: "conductor",
    pagado: false,
    ...datos,
  };
}

/** The starting state of a scenario. Same scenario in, same state out: the demo always starts from one seed. */
export function estadoInicial(esc: Escenario): Estado {
  const carros: Record<string, Carro> = {};
  const celdas: Celda[] = esc.mapas.flatMap((mapa) =>
    mapa.celdas.map((c) => {
      if (c.placa) {
        const ocupada = c.estado === "ocupada";
        carros[c.placa] = carroNuevo(c.placa, {
          estado: ocupada ? "estacionado" : "con celda",
          celda: c.id,
          llegoEn: c.desde ?? 0,
          estacionadoEn: ocupada ? (c.desde ?? 0) : null,
        });
      }
      return { id: c.id, mapa: mapa.id, zona: c.zona, x: c.x, y: c.y, estado: c.estado, placa: c.placa ?? null };
    }),
  );
  const entradas: Entrada[] = esc.entradas.map((e) => {
    for (const c of e.fila) carros[c.placa] = carroNuevo(c.placa, { entrada: e.id, llegoEn: c.llegoEn });
    return { id: e.id, codigo: e.codigo, nombre: e.nombre, capacidadPasaje: e.capacidadPasaje, fila: e.fila.map((c) => c.placa), espera: [], celdasAsignadas: 0 };
  });
  const valets: Valet[] = esc.entradas.flatMap((e) =>
    Array.from({ length: e.valets }, (_, i): Valet => ({ id: `${e.codigo}-V${i + 1}`, entrada: e.id, estado: "disponible", servicio: null })),
  );
  return {
    escenario: esc.id,
    inicio: esc.inicio,
    minuto: 0,
    reglas: { ...esc.reglas },
    mapas: esc.mapas.map(({ id, nombre, columnas, filas }) => ({ id, nombre, columnas, filas })),
    entradas,
    celdas,
    carros,
    valets,
    servicios: {},
    pagos: [],
    bitacora: [],
    consecutivos: { servicio: 0, pago: 0 },
  };
}
