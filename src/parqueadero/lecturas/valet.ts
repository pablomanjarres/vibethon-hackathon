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

/** One valet's phone: the current service and the next step. */
export function vistaValet(estado: Estado, valetId: string): VistaValet {
  const valet = estado.valets.find((v) => v.id === valetId);
  if (!valet) throw new Error(`No existe el valet ${valetId}.`);
  const servicio = valet.servicio ? estado.servicios[valet.servicio] : null;
  const carro = servicio ? estado.carros[servicio.placa] : null;
  let siguientePaso = "Disponible. Espera una solicitud.";
  if (servicio && carro) {
    if (servicio.estado === "solicitado")
      siguientePaso = `Recibe las llaves de ${carro.placa} en la portería de ${nombreEntrada(estado, carro.entrada)} y llévalo a la celda ${carro.celda}.`;
    else if (servicio.estado === "en curso")
      siguientePaso = carro.celda ? `Lleva ${carro.placa} a la celda ${carro.celda}.` : `Sigue en la fila con ${carro.placa}; la portería asigna la celda.`;
    else if (servicio.estado === "devolución")
      siguientePaso = carro.estado === "estacionado" ? `Saca ${carro.placa} de la celda ${carro.celda}.` : `Entrega ${carro.placa} contra el ficho ${servicio.ficho}.`;
  }
  return {
    id: valet.id,
    entrada: nombreEntrada(estado, valet.entrada),
    estado: valet.estado,
    servicio:
      servicio && carro
        ? {
            id: `${servicio.id}:${servicio.estado === "devolución" ? "devolucion" : "entrada"}`,
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
