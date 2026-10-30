import type { Entrada, Estado } from "./tipos.ts";

/**
 * Fairness rule between entrances: the next free cell goes to the car that arrived first,
 * whatever its entrance (each passage is first in, first out). On a tie, the entrance that has
 * received fewer cells goes first, then the order in the scenario file.
 */
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

/** The entrance whose gate may hand out the next free cell, or null when both passages are empty. */
export function siguienteEntrada(estado: Estado): Entrada | null {
  const primero = ordenDeAtencion(estado)[0];
  if (primero === undefined) return null;
  return estado.entradas.find((e) => e.id === estado.carros[primero].entrada) ?? null;
}
