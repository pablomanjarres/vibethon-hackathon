import { carroPorPlaca, celdaDe } from "../consultas.ts";
import { liberarCelda } from "../asignador.ts";
import { vencerPagos } from "./valet.ts";
import { exigir } from "../transiciones.ts";
import type { Estado } from "../tipos.ts";

/** Simulated parking payment: minutes parked times the scenario rate (the valet is paid upfront when hired). */
export function pagar(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  exigir(carro.estado === "estacionado" || carro.estado === "en devolución", `${carro.placa} no está estacionado.`);
  exigir(!carro.pagado, `${carro.placa} ya pagó.`);
  const minutos = Math.max(0, estado.minuto - (carro.estacionadoEn ?? estado.minuto));
  const { tarifaPorMinuto, moneda } = estado.reglas;
  const monto = minutos * tarifaPorMinuto;
  estado.consecutivos.pago += 1;
  estado.pagos.push({ id: `P-${estado.consecutivos.pago}`, placa: carro.placa, minutos, monto, enMinuto: estado.minuto });
  carro.pagado = true;
  return `${carro.placa} pagó ${monto} ${moneda} por ${minutos} min.`;
}

/** A self-parked car leaves after paying; its cell becomes free. Valet cars leave with their ficho instead. */
export function salir(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  const servicio = carro.servicio ? estado.servicios[carro.servicio] : null;
  exigir(!servicio || ["entregado", "rechazado", "vencido"].includes(servicio.estado), `${carro.placa} está con valet: primero reclama las llaves en la oficina con el ficho.`);
  exigir(carro.estado === "estacionado", `${carro.placa} no está estacionado.`);
  exigir(carro.pagado, `Falta el pago de ${carro.placa}.`);
  const celda = celdaDe(estado, carro);
  liberarCelda(estado, celda);
  carro.celda = null;
  carro.estado = "retirado";
  carro.salioEn = estado.minuto;
  return `${carro.placa} salió; la celda ${celda.id} quedó libre.`;
}

/** Simulated clock. */
export function avanzarReloj(estado: Estado, minutos: number): string {
  exigir(Number.isInteger(minutos) && minutos > 0, "El reloj solo avanza en minutos enteros positivos.");
  estado.minuto += minutos;
  const vencidos = vencerPagos(estado);
  return [`Pasaron ${minutos} min.`, ...vencidos].join(" ");
}
