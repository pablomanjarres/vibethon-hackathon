import { reglaDeReparto } from "../asignador.ts";
import { esperaDe } from "../consultas.ts";
import { estimarParaNuevo, type Espera } from "../espera.ts";
import type { Estado } from "../tipos.ts";

export interface VistaLlegada {
  entradas: {
    id: string;
    nombre: string;
    /** Cars in the passage between registration and the gate. */
    dentro: number;
    capacidad: number;
    /** Cars registered outside because the passage is full. */
    afuera: number;
    /** What a car registering here now would get. */
    esperaNueva: Espera;
  }[];
  celdasLibres: number;
  celdasTotal: number;
  /** The split rule in one sentence. */
  regla: string;
}

/** What a driver sees before registering: both lines, inside and outside, and the shared availability. No plates. */
export function vistaLlegada(estado: Estado): VistaLlegada {
  return {
    entradas: estado.entradas.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      dentro: e.fila.length,
      capacidad: e.capacidadPasaje,
      afuera: esperaDe(e).length,
      esperaNueva: estimarParaNuevo(estado, e.id),
    })),
    celdasLibres: estado.celdas.filter((c) => c.estado === "libre").length,
    celdasTotal: estado.celdas.length,
    regla: reglaDeReparto(estado),
  };
}
