import { nombreEntrada, normalizarPlaca } from "../consultas.ts";
import { ordenDeAtencion } from "../asignador.ts";
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
  /** Inside the passage with no active service: may hire a valet of their own entrance. */
  puedePedirValet: boolean;
  /** Valet offer for this driver: free valets of their entrance, price, and whether the wait makes it worth it. */
  oferta: { disponibles: string[]; precio: number; moneda: string; sugerido: boolean } | null;
  /** The active valet service, if any. */
  servicio: { id: string; ficho: string; estado: string; valet: string | null; precio: number } | null;
  /** True when this car is next in the fairness order and a cell is free: it may pick one on the map. */
  puedeReservar: boolean;
  /** The driver may still say they leave without parking. */
  puedeSalirSinParquear: boolean;
  sinParquear: boolean;
  /** The gate already checked plate and reservation. */
  confirmado: boolean;
  /** Zone, number and route to the reserved or parked cell. */
  destino: { zona: string; numero: string; ruta: string } | null;
  /** A notice such as a reassigned cell, or null. */
  aviso: string | null;
  celdasLibres: string[];
  pagado: boolean;
}

/** Position, cars ahead and the minute range, or why there is no range yet. */
export function textoEspera(espera: Espera | null): string {
  if (!espera) return "";
  const puesto = `Puesto ${espera.posicion}: ${espera.carrosAdelante === 0 ? "nadie" : carros(espera.carrosAdelante)} antes que tú.`;
  if (!espera.rango) return `${puesto} ${espera.nota}`;
  if (espera.rango.max === 0) return `${puesto} Hay una celda libre para ti; espera la señal de la portería.`;
  const minutos = espera.rango.min === espera.rango.max ? `${espera.rango.max} min` : `entre ${espera.rango.min} y ${espera.rango.max} min`;
  return `${puesto} Espera estimada: ${minutos}. ${espera.nota}`;
}

function mensaje(carro: Carro, servicio: Servicio | null, espera: Espera | null): string {
  if (servicio?.estado === "pago pendiente") return `Valet ${servicio.valet} apartado. Confirma el pago de ${servicio.precio}.`;
  if (servicio?.estado === "pagado") return `Pago aprobado. ${servicio.valet} va hacia tu carro en el pasaje.`;
  if (servicio?.estado === "ficho emitido") return `Confirma tu ficho ${servicio.ficho} antes de irte.`;
  if (servicio?.estado === "en curso") return `Tu carro quedó con ${servicio.valet} y conserva su puesto. Ve a clase con el ficho ${servicio.ficho}.`;
  if (servicio?.estado === "estacionado") return `Tu carro está en la celda ${carro.celda}. El valet lleva las llaves a la oficina.`;
  if (servicio?.estado === "llaves en oficina") return `Tus llaves están en la oficina. Muestra el ficho ${servicio.ficho} para reclamarlas.`;
  switch (carro.estado) {
    case "en espera":
      return `Quedaste en la fila de espera, afuera del pasaje. ${textoEspera(espera)} Entras al pasaje apenas haya cupo.`;
    case "en fila":
      if (carro.sinParquear) return `Saldrás sin parquear. Conservas tu puesto hasta llegar a la portería. ${textoEspera(espera)}`;
      return textoEspera(espera);
    case "con celda":
      return carro.confirmado ? `La portería confirmó tu reserva. Ve a la celda ${carro.celda}.` : `Tu celda es ${carro.celda}. Muestra tu placa en la portería para entrar.`;
    case "estacionado":
      return `Estás en la celda ${carro.celda}.`;
    case "en devolución":
      return "Tu carro va saliendo.";
    case "retirado":
      return "Ya saliste del parqueadero.";
  }
}

/**
 * The driver's phone: place in line, wait, cell, valet and ficho for one plate. With `codigo`, the
 * details appear only when it matches the car's access code; a wrong plate or code gives the same answer.
 */
export function vistaConductor(estado: Estado, placaEscrita: string, codigo?: string): VistaConductor {
  const placa = normalizarPlaca(placaEscrita);
  const encontrado = estado.carros[placa];
  const carro = codigo === undefined || encontrado?.codigo === codigo.trim() ? encontrado : undefined;
  if (!carro) {
    return {
      placa,
      encontrado: false,
      entrada: null,
      estado: null,
      mensaje: codigo === undefined ? `No encontramos la placa ${placa}. Revisa que haya pasado por el registro.` : "Placa o código incorrectos.",
      espera: null,
      celda: null,
      ficho: null,
      valet: null,
      llave: null,
      puedePedirValet: false,
      oferta: null,
      servicio: null,
      puedeReservar: false,
      puedeSalirSinParquear: false,
      sinParquear: false,
      confirmado: false,
      destino: null,
      aviso: null,
      celdasLibres: [],
      pagado: false,
    };
  }
  const servicio = carro.servicio ? estado.servicios[carro.servicio] : null;
  const activo = Boolean(servicio && !["rechazado", "vencido"].includes(servicio.estado));
  const puedeContratar = carro.estado === "en fila" && !activo && estado.valets.some((v) => v.entrada === carro.entrada && v.estado === "disponible");
  const espera = carro.estado === "en fila" || carro.estado === "en espera" ? estimarEspera(estado, placa) : null;
  const celdasLibres = estado.celdas.filter((c) => c.estado === "libre").map((c) => c.id);
  return {
    placa,
    encontrado: true,
    entrada: carro.entrada ? nombreEntrada(estado, carro.entrada) : null,
    estado: carro.estado,
    mensaje: mensaje(carro, activo ? servicio : null, espera),
    espera,
    celda: carro.celda,
    ficho: servicio?.ficho ?? null,
    valet: servicio?.valet ?? null,
    llave: carro.llave,
    puedePedirValet: puedeContratar,
    oferta: puedeContratar
      ? {
          disponibles: estado.valets.filter((v) => v.entrada === carro.entrada && v.estado === "disponible").map((v) => v.id),
          precio: estado.reglas.tarifaValet,
          moneda: estado.reglas.moneda,
          // Suggested when the estimate is over 15 minutes; hiring is allowed below that too.
          sugerido: Boolean(espera?.rango && espera.rango.max > 15),
        }
      : null,
    servicio: servicio && activo ? { id: servicio.id, ficho: servicio.ficho, estado: servicio.estado, valet: servicio.valet, precio: servicio.precio ?? 0 } : null,
    puedeReservar: carro.estado === "en fila" && celdasLibres.length > 0 && ordenDeAtencion(estado)[0] === placa,
    puedeSalirSinParquear: (carro.estado === "en fila" || carro.estado === "en espera") && !carro.sinParquear && !servicio,
    sinParquear: Boolean(carro.sinParquear),
    confirmado: Boolean(carro.confirmado),
    destino: carro.celda ? destinoDe(estado, carro.celda, carro.entrada) : null,
    aviso: carro.aviso ?? null,
    celdasLibres,
    pagado: carro.pagado,
  };
}

/**
 * The access code to show the driver right after registering from the app: only for a car that is
 * still waiting and was registered at the current minute; null otherwise.
 */
export function codigoDeRegistro(estado: Estado, placaEscrita: string): string | null {
  const carro = estado.carros[normalizarPlaca(placaEscrita)];
  if (!carro || (carro.estado !== "en fila" && carro.estado !== "en espera") || carro.llegoEn !== estado.minuto) return null;
  return carro.codigo;
}

/** Zone, stall number and a short route from the car's entrance, read from the scenario's map. */
export function destinoDe(estado: Estado, celdaId: string, entradaId: string | null): { zona: string; numero: string; ruta: string } | null {
  const celda = estado.celdas.find((c) => c.id === celdaId);
  if (!celda) return null;
  const numero = celda.id.replace(/^\D+/, "") || celda.id;
  const lado = celda.x === 1 ? "al comienzo" : `en el puesto ${celda.x}`;
  const entrada = entradaId ? `Entra por la portería de ${nombreEntrada(estado, entradaId)}, ` : "";
  return { zona: celda.zona, numero, ruta: `${entrada}sigue el pasillo central hasta la zona ${celda.zona} y busca la celda ${celda.id} (fila ${celda.y}, ${lado}).` };
}
