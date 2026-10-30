/** Read-only mockup data: the EAFIT lot beside Carrera 48, split into zones like stadium sections. */
export type Demanda = "libre" | "pocas" | "llena";

export interface Zona {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  libres: number;
  total: number;
  entrada: string;
}

const FILAS = [72, 132, 192, 252, 312, 372];
const IZQ = { x: 60, w: 98 };
const DER = { x: 192, w: 98 };
const LIBRES_IZQ = [4, 0, 5, 1, 0, 3];
const LIBRES_DER = [2, 4, 0, 5, 2, 0];

export const ZONAS: Zona[] = [
  ...FILAS.map((y, i) => ({
    id: `A${i + 1}`,
    ...IZQ,
    y,
    h: 48,
    libres: LIBRES_IZQ[i],
    total: 5,
    entrada: "Las Vegas",
  })),
  ...FILAS.map((y, i) => ({
    id: `B${i + 1}`,
    ...DER,
    y,
    h: 48,
    libres: LIBRES_DER[i],
    total: 5,
    entrada: "Regional",
  })),
];

export function demanda(zona: Zona): Demanda {
  if (zona.libres === 0) return "llena";
  return zona.libres <= 2 ? "pocas" : "libre";
}

export const ZONA_ELEGIDA = "B1";
export const CELDA_ELEGIDA = 3;
export const TARIFA = { minuto: 60, valet: 3000 };

export const peso = (valor: number) => `$${valor.toLocaleString("es-CO")}`;
