import { nombreEntrada, normalizarPlaca } from "../consultas.ts";
import { ordenDeAtencion } from "../equidad.ts";
import { estimarEspera, type Espera } from "../espera.ts";
import type { Carro, Estado, EstadoCarro, Servicio, UbicacionLlave } from "../tipos.ts";
import { carros } from "./formato.ts";

export interface VistaConductor {
  placa: string;
  encontrado: boolean;
  entrada: string | null;
  estado: EstadoCarro | null;
  /** What the driver should know or do now. */
  mensaje: string;
  espera: Espera | null;
  celda: string | null;
  ficho: string | null;
  valet: string | null;
  llave: UbicacionLlave | null;
  puedePedirValet: boolean;
  /** True when this car is next in the fairness order and a cell is free: it may pick one on the map. */
  puedeReservar: boolean;
  celdasLibres: string[];
  pagado: boolean;
}

function mensaje(carro: Carro, servicio: Servicio | null, espera: Espera | null): string {
  if (servicio?.estado === "solicitado") return `Un valet va hacia tu carro. Tu ficho es ${servicio.ficho}.`;
  if (servicio?.estado === "en curso") return `Tu carro quedó con el valet. Ve a clase y guarda el ficho ${servicio.ficho}.`;
  if (servicio?.estado === "estacionado") return `Tu carro está en la celda ${carro.celda}. Pide la devolución con el ficho ${servicio.ficho}.`;
  if (servicio?.estado === "devolución") return "Un valet está trayendo tu carro.";
  switch (carro.estado) {
    case "en fila":
      if (!espera || espera.minutos === 0) return "Hay una celda libre para ti. Espera la señal de la portería.";
      return `Hay ${carros(espera.carrosAdelante)} antes que tú. Espera estimada: ${espera.minutos} min.`;
    case "con celda":
      return `Ve a la celda ${carro.celda}.`;
    case "estacionado":
      return `Estás en la celda ${carro.celda}.`;
    case "en devolución":
      return "Tu carro va saliendo.";
    case "retirado":
      return "Ya saliste del parqueadero.";
  }
}

/** The driver's phone: place in line, wait, cell, valet and ficho for one plate. */
export function vistaConductor(estado: Estado, placaEscrita: string): VistaConductor {
  const placa = normalizarPlaca(placaEscrita);
  const carro = estado.carros[placa];
  if (!carro) {
    return {
      placa,
      encontrado: false,
      entrada: null,
      estado: null,
      mensaje: `No encontramos la placa ${placa}. Revisa que haya pasado por el registro.`,
      espera: null,
      celda: null,
      ficho: null,
      valet: null,
      llave: null,
      puedePedirValet: false,
      puedeReservar: false,
      celdasLibres: [],
      pagado: false,
    };
  }
  const servicio = carro.servicio ? estado.servicios[carro.servicio] : null;
  const espera = carro.estado === "en fila" ? estimarEspera(estado, placa) : null;
  const celdasLibres = estado.celdas.filter((c) => c.estado === "libre").map((c) => c.id);
  return {
    placa,
    encontrado: true,
    entrada: carro.entrada ? nombreEntrada(estado, carro.entrada) : null,
    estado: carro.estado,
    mensaje: mensaje(carro, servicio, espera),
    espera,
    celda: carro.celda,
    ficho: servicio?.ficho ?? null,
    valet: servicio?.valet ?? null,
    llave: carro.llave,
    puedePedirValet:
      carro.estado === "en fila" && !servicio && estado.valets.some((v) => v.entrada === carro.entrada && v.estado === "disponible"),
    puedeReservar: carro.estado === "en fila" && celdasLibres.length > 0 && ordenDeAtencion(estado)[0] === placa,
    celdasLibres,
    pagado: carro.pagado,
  };
}
