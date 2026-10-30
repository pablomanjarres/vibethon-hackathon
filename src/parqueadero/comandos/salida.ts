import { carroPorPlaca, celdaDe } from "../consultas.ts";
import { liberarCelda } from "../asignador.ts";
import { exigir } from "../transiciones.ts";
import type { Estado } from "../tipos.ts";

/** Simulated payment: minutes parked times the scenario rate, plus the valet fee when there was one. */
export function pagar(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  exigir(carro.estado === "estacionado" || carro.estado === "en devolución", `${carro.placa} no está estacionado.`);
  exigir(!carro.pagado, `${carro.placa} ya pagó.`);
  const minutos = Math.max(0, estado.minuto - (carro.estacionadoEn ?? estado.minuto));
  const { tarifaPorMinuto, tarifaValet, moneda } = estado.reglas;
  const monto = minutos * tarifaPorMinuto + (carro.servicio ? tarifaValet : 0);
  estado.consecutivos.pago += 1;
  estado.pagos.push({ id: `P-${estado.consecutivos.pago}`, placa: carro.placa, minutos, monto, enMinuto: estado.minuto });
  carro.pagado = true;
  return `${carro.placa} pagó ${monto} ${moneda} por ${minutos} min.`;
}

/** A self-parked car leaves after paying; its cell becomes free. Valet cars leave with their ficho instead. */
export function salir(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  exigir(!carro.servicio, `${carro.placa} está con valet: se entrega con su ficho.`);
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
  return `Pasaron ${minutos} min.`;
}
