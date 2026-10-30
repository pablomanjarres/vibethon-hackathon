import { esperaDe } from "../../parqueadero/consultas";
import { contar } from "../../parqueadero/lecturas/formato";
import { registroCarros, type RegistroCarro } from "../../parqueadero/lecturas/registro";
import { ESTADOS_VALET } from "../../parqueadero/transiciones";
import type { Estado, EstadoValet, Evento } from "../../parqueadero/tipos";

/** What one office (one entrance, or the whole lot) is looking at right now. */
export interface ResumenOficina {
  nombre: string;
  enPasaje: number;
  capacidad: number;
  afuera: number;
  celdasEntregadas: number;
  estacionados: number;
  salidas: number;
  valets: Record<EstadoValet, number>;
  pagos: { cantidad: number; total: number };
  carros: RegistroCarro[];
  /** Newest first, clock ticks left out. */
  bitacora: Evento[];
}

const suma = <T>(lista: T[], valor: (item: T) => number) => lista.reduce((total, item) => total + valor(item), 0);

/** The overview for one entrance's office, or for the whole lot when `entradaId` is null. */
export function resumenOficina(estado: Estado, entradaId: string | null): ResumenOficina {
  const entradas = estado.entradas.filter((e) => entradaId === null || e.id === entradaId);
  const ids = new Set(entradas.map((e) => e.id));
  const carros = registroCarros(estado, entradaId ?? undefined);
  const placas = new Set(carros.map((c) => c.placa));
  const pagos = estado.pagos.filter((p) => placas.has(p.placa));
  const propio = (e: Evento) => entradaId === null || carros.some((c) => e.detalle.includes(c.placa));
  return {
    nombre: entradaId === null ? "Todo el lote" : entradas[0].nombre,
    enPasaje: suma(entradas, (e) => e.fila.length),
    capacidad: suma(entradas, (e) => e.capacidadPasaje),
    afuera: suma(entradas, (e) => esperaDe(e).length),
    celdasEntregadas: suma(entradas, (e) => e.celdasAsignadas),
    estacionados: carros.filter((c) => c.estado === "estacionado").length,
    salidas: carros.filter((c) => c.salio !== null).length,
    valets: contar(
      estado.valets.filter((v) => ids.has(v.entrada)).map((v) => v.estado),
      ESTADOS_VALET,
    ),
    pagos: { cantidad: pagos.length, total: suma(pagos, (p) => p.monto) },
    carros,
    bitacora: estado.bitacora
      .filter((e) => e.tipo !== "avanzarReloj" && propio(e))
      .slice(-12)
      .reverse(),
  };
}
