import { nombreEntrada } from "../consultas.ts";
import { hora } from "./formato.ts";
import type { Estado, EstadoServicio, EstadoValet } from "../tipos.ts";

export interface VistaValet {
  id: string;
  entrada: string;
  estado: EstadoValet;
  /** The car this valet is assigned to; `id` changes with every new assignment (use it to show a notice). */
  servicio: {
    id: string;
    ficho: string;
    placa: string;
    estado: EstadoServicio;
    celda: string | null;
    entrada: string;
    /** Clock time the assignment arrived. */
    asignado: string;
  } | null;
  /** The one thing this valet does next. */
  siguientePaso: string;
}

/** Whether this valet id and code match: the valet phone opens only then. */
export function valetAutorizado(estado: Estado, valetId: string, codigo: string): boolean {
  const valet = estado.valets.find((v) => v.id === valetId);
  return Boolean(valet && valet.codigo === codigo.trim());
}

/** One valet's phone: the current service and the next step. */
export function vistaValet(estado: Estado, valetId: string): VistaValet {
  const valet = estado.valets.find((v) => v.id === valetId);
  if (!valet) throw new Error(`No existe el valet ${valetId}.`);
  const servicio = valet.servicio ? estado.servicios[valet.servicio] : null;
  const carro = servicio ? estado.carros[servicio.placa] : null;
  const pasos: Partial<Record<string, string>> = carro && servicio
    ? {
        "pago pendiente": `Apartado para ${carro.placa}: esperando el pago.`,
        pagado: `Ve al pasaje de ${nombreEntrada(estado, carro.entrada)}, recibe ${carro.placa} y entrega el ficho ${servicio.ficho}.`,
        "ficho emitido": `Espera a que el conductor confirme el ficho ${servicio.ficho}.`,
        "en curso": carro.celda ? `Lleva ${carro.placa} a la celda ${carro.celda} (confirma en la portería).` : `Sigue en la fila con ${carro.placa}; la portería asigna la celda.`,
        estacionado: `Deja las llaves de ${carro.placa} en la oficina con el ficho ${servicio.ficho}.`,
      }
    : {};
  const siguientePaso = (servicio && pasos[servicio.estado]) || "Disponible. Espera una asignación.";
  return {
    id: valet.id,
    entrada: nombreEntrada(estado, valet.entrada),
    estado: valet.estado,
    servicio:
      servicio && carro
        ? {
            id: servicio.id,
            ficho: servicio.ficho,
            placa: carro.placa,
            estado: servicio.estado,
            celda: carro.celda,
            entrada: nombreEntrada(estado, carro.entrada),
            asignado: hora(estado.inicio, servicio.asignadoEn ?? estado.minuto),
          }
        : null,
    siguientePaso,
  };
}

/** Every valet with their entrance and state, for choosing whose phone to show. */
export function listaValets(estado: Estado): { id: string; entrada: string; estado: EstadoValet }[] {
  return estado.valets.map((v) => ({ id: v.id, entrada: nombreEntrada(estado, v.entrada), estado: v.estado }));
}
