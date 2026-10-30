/**
 * Every shape the shared parking state holds. Only motor.ts and the commands it runs change it;
 * the driver, gate, valet and office views read it through lecturas/.
 */

export type EstadoCelda = "libre" | "reservada" | "ocupada";
export type EstadoValet = "disponible" | "reservado" | "en servicio";
export type EstadoCarro = "en espera" | "en fila" | "con celda" | "estacionado" | "en devolución" | "retirado";
export type EstadoServicio = "solicitado" | "en curso" | "estacionado" | "devolución" | "entregado";
export type UbicacionLlave = "conductor" | "valet" | "tablero";

export interface Reglas {
  /** Average minutes between two cells freeing up at rush hour; drives the wait estimate. */
  minutosPorLiberacion: number;
  tarifaPorMinuto: number;
  tarifaValet: number;
  moneda: string;
}

export interface Mapa {
  id: string;
  nombre: string;
  columnas: number;
  filas: number;
}

export interface Entrada {
  id: string;
  codigo: string;
  nombre: string;
  /** Cars that fit in the passage between plate registration and the gate. */
  capacidadPasaje: number;
  /** Plates in the passage, first one is at the gate. */
  fila: string[];
  /** Plates registered while the passage was full; each enters the passage, in order, when a car leaves it. */
  espera?: string[];
  celdasAsignadas: number;
}

export interface Carro {
  placa: string;
  /** Private access code: with the plate, it is the only way to see this car's details in the driver app. */
  codigo: string;
  /** null for cars that were already in the lot when the scenario starts. */
  entrada: string | null;
  estado: EstadoCarro;
  llegoEn: number;
  celda: string | null;
  servicio: string | null;
  estacionadoEn: number | null;
  llave: UbicacionLlave;
  pagado: boolean;
}

export interface Celda {
  id: string;
  mapa: string;
  zona: string;
  x: number;
  y: number;
  estado: EstadoCelda;
  placa: string | null;
}

export interface Valet {
  id: string;
  entrada: string;
  estado: EstadoValet;
  servicio: string | null;
}

/** One valet handoff, from the request in line to the car handed back. The ficho is its claim ticket. */
export interface Servicio {
  id: string;
  placa: string;
  ficho: string;
  valet: string | null;
  estado: EstadoServicio;
}

export interface Pago {
  id: string;
  placa: string;
  minutos: number;
  monto: number;
  enMinuto: number;
}

export interface Evento {
  minuto: number;
  tipo: string;
  detalle: string;
}

export interface Estado {
  escenario: string;
  inicio: string;
  minuto: number;
  reglas: Reglas;
  mapas: Mapa[];
  entradas: Entrada[];
  celdas: Celda[];
  carros: Record<string, Carro>;
  valets: Valet[];
  servicios: Record<string, Servicio>;
  pagos: Pago[];
  bitacora: Evento[];
  consecutivos: { servicio: number; pago: number; codigo: number };
}
