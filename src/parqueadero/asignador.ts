import { esperaDe } from "./consultas.ts";
import { cambiarCelda } from "./transiciones.ts";
import type { Carro, Celda, Entrada, Estado } from "./tipos.ts";

/**
 * The allocator: who waits where, in which order cars are served, and which cell each one gets.
 * Every view reads the same order from here.
 *
 * Inside each passage it is first in, first out, and cars only move forward. Between entrances the
 * next free cell goes to the car that arrived first, whatever its entrance; on a tie, to the
 * entrance that has received fewer cells, then the order in the scenario file.
 */

/** The split rule in one sentence, as the app shows it. */
export function reglaDeReparto(estado: Estado): string {
  const nombres = estado.entradas.map((e) => e.nombre).join(" o por ");
  return `Dentro de cada entrada se respeta el orden de llegada, y la siguiente celda libre es para el carro que llegó primero, entre por ${nombres}.`;
}

/** Every car in the passages, in the order the split rule will serve them. */
export function ordenDeAtencion(estado: Estado): string[] {
  const posiciones = estado.entradas.map(() => 0);
  const asignadas = estado.entradas.map((e) => e.celdasAsignadas);
  const orden: string[] = [];
  for (;;) {
    let elegida = -1;
    estado.entradas.forEach((entrada, i) => {
      const placa = entrada.fila[posiciones[i]];
      if (placa === undefined) return;
      if (elegida < 0) {
        elegida = i;
        return;
      }
      const llega = estado.carros[placa].llegoEn;
      const llegaElegida = estado.carros[estado.entradas[elegida].fila[posiciones[elegida]]].llegoEn;
      if (llega < llegaElegida || (llega === llegaElegida && asignadas[i] < asignadas[elegida])) elegida = i;
    });
    if (elegida < 0) return orden;
    orden.push(estado.entradas[elegida].fila[posiciones[elegida]]);
    posiciones[elegida] += 1;
    asignadas[elegida] += 1;
  }
}

/** Cars registered outside full passages, by arrival time: they come after every car already inside. */
export function ordenAfuera(estado: Estado): string[] {
  return estado.entradas.flatMap((e) => esperaDe(e)).sort((a, b) => estado.carros[a].llegoEn - estado.carros[b].llegoEn);
}

/** The entrance whose gate serves next, or null when both passages are empty. */
export function siguienteEntrada(estado: Estado): Entrada | null {
  const primero = ordenDeAtencion(estado)[0];
  if (primero === undefined) return null;
  return estado.entradas.find((e) => e.id === estado.carros[primero].entrada) ?? null;
}

/** When a car leaves the passage at the gate, the next car waiting outside comes in behind the others. */
function entrarDesdeAfuera(estado: Estado, entrada: Entrada): void {
  const [siguiente, ...resto] = esperaDe(entrada);
  if (!siguiente || entrada.fila.length >= entrada.capacidadPasaje) return;
  entrada.espera = resto;
  entrada.fila.push(siguiente);
  estado.carros[siguiente].estado = "en fila";
}

/** The first car of the passage leaves it through the gate. */
export function salirPorLaPorteria(estado: Estado, entrada: Entrada): Carro {
  const carro = estado.carros[entrada.fila.shift() as string];
  entrarDesdeAfuera(estado, entrada);
  return carro;
}

/** Reserves the cell for the car in the same step, so nobody else can get it. */
function reservar(estado: Estado, carro: Carro, celda: Celda): void {
  cambiarCelda(celda, "reservada");
  celda.placa = carro.placa;
  carro.estado = "con celda";
  carro.celda = celda.id;
  carro.confirmado = false;
  estado.asignaciones = [...(estado.asignaciones ?? []), estado.minuto];
}

/**
 * The first car of an entrance leaves the passage with its cell reserved. The gate camera reads its
 * plate on the way through, so the entry is confirmed; the gate confirms by hand only after a reassignment.
 */
export function darCelda(estado: Estado, entrada: Entrada, celda: Celda): Carro {
  const carro = salirPorLaPorteria(estado, entrada);
  reservar(estado, carro, celda);
  carro.confirmado = true;
  entrada.celdasAsignadas += 1;
  return carro;
}

/** A cell becomes free; the minute is kept for the wait estimate. */
export function liberarCelda(estado: Estado, celda: Celda): void {
  cambiarCelda(celda, "libre");
  celda.placa = null;
  estado.liberaciones = [...(estado.liberaciones ?? []), estado.minuto];
}

/**
 * The reserved cell turned out to be taken: it is marked occupied and the car gets another free
 * cell, staying linked to its plate. With no free cell left, it goes back to the front of its passage.
 */
export function reasignar(estado: Estado, carro: Carro): string {
  const anterior = estado.celdas.find((c) => c.id === carro.celda) as Celda;
  cambiarCelda(anterior, "ocupada");
  anterior.placa = null;
  const otra = estado.celdas.find((c) => c.estado === "libre");
  if (otra) {
    reservar(estado, carro, otra);
    carro.aviso = `La celda ${anterior.id} estaba ocupada. Tu nueva celda es ${otra.id}.`;
    return `${anterior.id} estaba ocupada; ${carro.placa} pasa a la celda ${otra.id}.`;
  }
  const entrada = estado.entradas.find((e) => e.id === carro.entrada);
  carro.celda = null;
  carro.confirmado = false;
  // The passage never goes over capacity: with room the car is first in it, otherwise first outside.
  if (entrada && entrada.fila.length < entrada.capacidadPasaje) {
    carro.estado = "en fila";
    entrada.fila.unshift(carro.placa);
    carro.aviso = `La celda ${anterior.id} estaba ocupada y no hay otra libre. Sigues primero en la fila.`;
    return `${anterior.id} estaba ocupada y no hay otra libre; ${carro.placa} vuelve al frente de su pasaje.`;
  }
  carro.estado = "en espera";
  if (entrada) entrada.espera = [carro.placa, ...esperaDe(entrada)];
  carro.aviso = `La celda ${anterior.id} estaba ocupada y no hay otra libre. Eres el primero en entrar cuando haya cupo.`;
  return `${anterior.id} estaba ocupada y no hay otra libre; ${carro.placa} queda primero en la fila de espera, sin pasar el cupo del pasaje.`;
}

/**
 * Automatic assignment: while a cell is free, the car whose turn it is gets it, as if its gate had
 * pressed "Asignar celda". Returns the next command to run, or null when nothing applies.
 */
export function asignacionAutomatica(estado: Estado): { tipo: "asignarCelda"; entrada: string } | null {
  if (!estado.celdas.some((c) => c.estado === "libre")) return null;
  const turno = siguienteEntrada(estado);
  if (!turno) return null;
  const primero = estado.carros[turno.fila[0]];
  if (!primero || primero.sinParquear) return null;
  return { tipo: "asignarCelda", entrada: turno.id };
}
