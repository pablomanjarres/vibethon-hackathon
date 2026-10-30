import { exigir } from "./transiciones.ts";
import type { Carro, Celda, Entrada, Estado, Servicio, Valet } from "./tipos.ts";

/** Lookups shared by the commands (which reject what is missing) and the read models. */

export function normalizarPlaca(placa: string): string {
  return placa.trim().toUpperCase().replace(/[\s-]+/g, "");
}

export function nombreEntrada(estado: Estado, id: string | null): string {
  return estado.entradas.find((e) => e.id === id)?.nombre ?? "el lote";
}

/** The n-th access code: four digits, all different for the first 9000 cars, the same on every run. */
export function codigoAcceso(n: number): string {
  return String(((n * 7919 + 4271) % 9000) + 1000);
}

/** Cars registered outside a full passage (older saved states have no list yet). */
export function esperaDe(entrada: Entrada): string[] {
  return entrada.espera ?? [];
}

export function entradaPorId(estado: Estado, id: string): Entrada {
  const entrada = estado.entradas.find((e) => e.id === id);
  exigir(entrada, `No existe la entrada ${id}.`);
  return entrada;
}

export function carroPorPlaca(estado: Estado, placa: string): Carro {
  const carro = estado.carros[normalizarPlaca(placa)];
  exigir(carro && carro.estado !== "retirado", `No hay un carro activo con placa ${normalizarPlaca(placa)}.`);
  return carro;
}

export function celdaDe(estado: Estado, carro: Carro): Celda {
  const celda = estado.celdas.find((c) => c.id === carro.celda);
  exigir(celda, `${carro.placa} no tiene celda.`);
  return celda;
}

export function servicioDe(estado: Estado, carro: Carro): Servicio {
  const servicio = carro.servicio ? estado.servicios[carro.servicio] : undefined;
  exigir(servicio, `${carro.placa} no tiene servicio de valet.`);
  return servicio;
}

export function servicioPorFicho(estado: Estado, ficho: string): Servicio {
  const buscado = ficho.trim().toUpperCase();
  const servicio = Object.values(estado.servicios).find((s) => s.ficho === buscado);
  exigir(servicio, `No existe el ficho ${buscado}.`);
  exigir(servicio.estado !== "entregado", `El ficho ${buscado} ya se cerró.`);
  return servicio;
}

export function valetPorId(estado: Estado, id: string | null): Valet {
  const valet = estado.valets.find((v) => v.id === id);
  exigir(valet, "El servicio no tiene valet asignado.");
  return valet;
}
