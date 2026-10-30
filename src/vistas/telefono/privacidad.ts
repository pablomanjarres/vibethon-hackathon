import type { Estado } from "../../parqueadero/tipos";

/** The phone shows only its own driver's plate: any other car in a message becomes "otro carro". */
export function sinOtrasPlacas(texto: string, estado: Estado, propia: string): string {
  return Object.keys(estado.carros)
    .filter((placa) => placa !== propia && texto.includes(placa))
    .reduce((t, placa) => t.split(placa).join("otro carro"), texto);
}
