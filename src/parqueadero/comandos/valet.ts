import { carroPorPlaca, celdaDe, nombreEntrada, servicioDe, servicioPorFicho, valetPorId } from "../consultas.ts";
import { cambiarCelda, cambiarValet, exigir } from "../transiciones.ts";
import type { Estado, Servicio } from "../tipos.ts";

/** A driver waiting in a passage asks for a valet of that entrance; the service gets its ficho. */
export function pedirValet(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  exigir(carro.estado === "en fila", "Solo un carro que espera en el pasaje puede pedir valet.");
  exigir(!carro.servicio, `${carro.placa} ya tiene un valet asignado.`);
  const valet = estado.valets.find((v) => v.entrada === carro.entrada && v.estado === "disponible");
  exigir(valet, `No hay valets disponibles en ${nombreEntrada(estado, carro.entrada)}. Sigue en la fila.`);
  estado.consecutivos.servicio += 1;
  const numero = estado.consecutivos.servicio;
  const servicio: Servicio = {
    id: `S-${numero}`,
    placa: carro.placa,
    ficho: `F-${String(numero).padStart(3, "0")}`,
    valet: valet.id,
    estado: "solicitado",
  };
  estado.servicios[servicio.id] = servicio;
  cambiarValet(valet, "reservado");
  valet.servicio = servicio.id;
  carro.servicio = servicio.id;
  return `${valet.id} va hacia ${carro.placa}. Ficho ${servicio.ficho}.`;
}

/** The driver hands over the keys and walks to class; the car keeps its place in the line. */
export function entregarLlaves(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  const servicio = servicioDe(estado, carro);
  exigir(servicio.estado === "solicitado", `Las llaves de ${carro.placa} ya se entregaron.`);
  const valet = valetPorId(estado, servicio.valet);
  cambiarValet(valet, "en servicio");
  servicio.estado = "en curso";
  carro.llave = "valet";
  return `${carro.placa} quedó con ${valet.id}. Guarda el ficho ${servicio.ficho} y ve a clase.`;
}

/** With the ficho, the driver asks for the car back; a free valet takes the job. */
export function pedirDevolucion(estado: Estado, ficho: string): string {
  const servicio = servicioPorFicho(estado, ficho);
  exigir(
    servicio.estado === "estacionado",
    servicio.estado === "devolución" ? "Ya hay un valet trayendo el carro." : "El carro todavía no está estacionado.",
  );
  const carro = estado.carros[servicio.placa];
  const valet =
    estado.valets.find((v) => v.entrada === carro.entrada && v.estado === "disponible") ??
    estado.valets.find((v) => v.estado === "disponible");
  exigir(valet, "No hay valets disponibles. Intenta en unos minutos.");
  cambiarValet(valet, "reservado");
  valet.servicio = servicio.id;
  servicio.valet = valet.id;
  servicio.estado = "devolución";
  return `${valet.id} va por ${carro.placa} (ficho ${servicio.ficho}).`;
}

/** The valet takes the car out of its cell, which becomes free for the next car in line. */
export function recogerCarro(estado: Estado, ficho: string): string {
  const servicio = servicioPorFicho(estado, ficho);
  exigir(servicio.estado === "devolución", "Primero hay que pedir la devolución con el ficho.");
  const carro = estado.carros[servicio.placa];
  exigir(carro.estado === "estacionado", `${carro.placa} ya salió de su celda.`);
  const valet = valetPorId(estado, servicio.valet);
  cambiarValet(valet, "en servicio");
  const celda = celdaDe(estado, carro);
  cambiarCelda(celda, "libre");
  celda.placa = null;
  carro.celda = null;
  carro.estado = "en devolución";
  carro.llave = "valet";
  return `${valet.id} sacó ${carro.placa} de ${celda.id}; la celda quedó libre.`;
}

/** The valet hands the car and keys back against the ficho, once it is paid. */
export function entregarCarro(estado: Estado, ficho: string): string {
  const servicio = servicioPorFicho(estado, ficho);
  const carro = estado.carros[servicio.placa];
  exigir(carro.estado === "en devolución", "El valet todavía no ha sacado el carro.");
  exigir(carro.pagado, `Falta el pago de ${carro.placa}.`);
  const valet = valetPorId(estado, servicio.valet);
  cambiarValet(valet, "disponible");
  valet.servicio = null;
  servicio.valet = null;
  servicio.estado = "entregado";
  carro.llave = "conductor";
  carro.estado = "retirado";
  return `${carro.placa} fue entregado con el ficho ${servicio.ficho}.`;
}
