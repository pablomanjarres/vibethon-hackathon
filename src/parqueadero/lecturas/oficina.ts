import { ESTADOS_CELDA, ESTADOS_VALET } from "../transiciones.ts";
import type { Celda, Estado, EstadoCelda, EstadoServicio, EstadoValet, Evento, Mapa } from "../tipos.ts";
import { contar, hora } from "./formato.ts";

export interface VistaOficina {
  hora: string;
  minuto: number;
  mapas: (Mapa & { celdas: Celda[] })[];
  celdas: Record<EstadoCelda, number>;
  entradas: {
    id: string;
    nombre: string;
    enPasaje: number;
    capacidad: number;
    /** Cells handed out to this entrance in the session: the fairness split. */
    celdasAsignadas: number;
    valets: Record<EstadoValet, number>;
  }[];
  fichosActivos: { ficho: string; placa: string; estado: EstadoServicio; valet: string | null }[];
  llavesEnTablero: string[];
  pagos: { cantidad: number; total: number; moneda: string };
  /** Newest first. */
  bitacora: Evento[];
}

/** The office desk: the whole lot, the split between entrances, valets, fichos, keys and payments. */
export function vistaOficina(estado: Estado): VistaOficina {
  return {
    hora: hora(estado.inicio, estado.minuto),
    minuto: estado.minuto,
    mapas: estado.mapas.map((mapa) => ({ ...mapa, celdas: estado.celdas.filter((c) => c.mapa === mapa.id) })),
    celdas: contar(
      estado.celdas.map((c) => c.estado),
      ESTADOS_CELDA,
    ),
    entradas: estado.entradas.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      enPasaje: e.fila.length,
      capacidad: e.capacidadPasaje,
      celdasAsignadas: e.celdasAsignadas,
      valets: contar(
        estado.valets.filter((v) => v.entrada === e.id).map((v) => v.estado),
        ESTADOS_VALET,
      ),
    })),
    fichosActivos: Object.values(estado.servicios)
      .filter((s) => s.estado !== "entregado")
      .map((s) => ({ ficho: s.ficho, placa: s.placa, estado: s.estado, valet: s.valet })),
    llavesEnTablero: Object.values(estado.carros)
      .filter((c) => c.llave === "tablero" && c.estado !== "retirado")
      .map((c) => c.placa),
    pagos: {
      cantidad: estado.pagos.length,
      total: estado.pagos.reduce((suma, p) => suma + p.monto, 0),
      moneda: estado.reglas.moneda,
    },
    // The clock already shows the time, so clock ticks would only push real events out of view.
    bitacora: estado.bitacora
      .filter((e) => e.tipo !== "avanzarReloj")
      .slice(-12)
      .reverse(),
  };
}
