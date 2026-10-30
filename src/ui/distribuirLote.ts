import type { CeldaMapa } from "./MapaLote";

// Drawing units of the campus frame: streets around, the lot, one central aisle.
export const W = 350;
export const H = 470;
export const LOTE = { x: 48, y: 58, w: 254, h: 374 };
export const PASILLO = { x: 164, w: 22 };
const LADOS = [
  { x: 56, w: 102 },
  { x: 192, w: 102 },
];
const ARRIBA = 66;
const ABAJO = 424;
const ROTULO = 16;
const HUECO_ZONA = 10;
const FILAS_MAX = 8;
/** Where entrance n sits: the left street, the top street, then the right and bottom ones. */
export const PUERTAS = [
  { x: 34, y: 238 },
  { x: 175, y: 40 },
  { x: 316, y: 238 },
  { x: 175, y: 440 },
];

export interface Puesto {
  celda: CeldaMapa;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Zones alternate sides of the aisle; each zone's cells fill its block in x/y order, one stall per cell. */
export function distribuir(celdas: CeldaMapa[]): { puestos: Puesto[]; zonas: { id: string; x: number; y: number }[] } {
  const ids = [...new Set(celdas.map((c) => c.zona))].sort();
  const puestos: Puesto[] = [];
  const zonas: { id: string; x: number; y: number }[] = [];
  LADOS.forEach((lado, l) => {
    const propias = ids.filter((_, i) => i % LADOS.length === l);
    const grupos = propias.map((id) => celdas.filter((c) => c.zona === id).sort((a, b) => a.x - b.x || a.y - b.y));
    const filasDe = (n: number) => Math.min(n, FILAS_MAX);
    const totalFilas = grupos.reduce((s, g) => s + filasDe(g.length), 0) || 1;
    const alto = ABAJO - ARRIBA - propias.length * ROTULO - Math.max(0, propias.length - 1) * HUECO_ZONA;
    let y = ARRIBA;
    grupos.forEach((grupo, z) => {
      const filas = filasDe(grupo.length);
      const columnas = Math.ceil(grupo.length / filas);
      const bloque = (alto * filas) / totalFilas;
      zonas.push({ id: propias[z], x: lado.x, y });
      y += ROTULO;
      grupo.forEach((celda, i) => {
        const w = lado.w / columnas;
        const h = bloque / filas;
        puestos.push({ celda, x: lado.x + Math.floor(i / filas) * w, y: y + (i % filas) * h, w, h });
      });
      y += bloque + HUECO_ZONA;
    });
  });
  return { puestos, zonas };
}
