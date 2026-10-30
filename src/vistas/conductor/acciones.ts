import { Banknote, CircleAlert, LogOut, MapPin, ParkingSquare, Ticket, type LucideIcon } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import type { VistaConductor } from "../../parqueadero/lecturas/conductor";

export interface Paso {
  texto: string;
  Icono: LucideIcon;
  comando: Comando;
}

/** The one step that applies now: a primary action or something done off the phone, plus at most one quiet link. */
export interface PasoActual {
  principal: Paso | null;
  /** What the driver does in person, e.g. at the gate; shown in the primary slot without a button. */
  instruccion: string | null;
  secundario: Paso | null;
}

const NADA: PasoActual = { principal: null, instruccion: null, secundario: null };

/**
 * The driver's current step, from registration to leaving. Only actions that can act now appear;
 * `elegida` is the free cell picked on the map, if any.
 */
export function pasoActual(v: VistaConductor, elegida: string | null): PasoActual {
  if (!v.encontrado) return NADA;
  const placa = v.placa;
  const pagar: Paso = { texto: "Pagar", Icono: Banknote, comando: { tipo: "pagar", placa } };
  const s = v.servicio;
  if (s && s.estado !== "entregado") {
    switch (s.estado) {
      case "pago pendiente":
        return {
          principal: { texto: "Pagar (aprobado)", Icono: Banknote, comando: { tipo: "pagarValet", servicio: s.id, aprobado: true } },
          instruccion: null,
          secundario: { texto: "Simular rechazo", Icono: CircleAlert, comando: { tipo: "pagarValet", servicio: s.id, aprobado: false } },
        };
      case "pagado":
        return { ...NADA, instruccion: `${s.valet} llega a tu carro en el pasaje: entrégale las llaves` };
      case "ficho emitido":
        return { ...NADA, principal: { texto: "Confirmar ficho", Icono: Ticket, comando: { tipo: "confirmarFicho", placa, ficho: s.ficho } } };
      case "llaves en oficina":
        return { ...NADA, instruccion: `Reclama tus llaves en la oficina con el ficho ${s.ficho}` };
      default:
        return { ...NADA, instruccion: "El valet se encarga de tu carro" };
    }
  }
  switch (v.estado) {
    case "en fila":
    case "en espera": {
      const celda = v.puedeReservar ? (elegida && v.celdasLibres.includes(elegida) ? elegida : v.celdasLibres[0]) : null;
      const salir: Paso | null = v.puedeSalirSinParquear ? { texto: "Salir sin parquear", Icono: LogOut, comando: { tipo: "salirSinParquear", placa } } : null;
      return {
        principal: celda ? { texto: `Reservar celda ${celda}`, Icono: MapPin, comando: { tipo: "reservarCelda", placa, celda } } : null,
        instruccion: null,
        // Hiring a valet is offered beside this step (OfertaValet).
        secundario: salir,
      };
    }
    case "con celda": {
      const ocupada: Paso = { texto: "Mi celda está ocupada", Icono: CircleAlert, comando: { tipo: "reportarCeldaOcupada", placa } };
      if (!v.confirmado) return { principal: null, instruccion: "Muestra tu placa en la portería", secundario: ocupada };
      return { principal: { texto: "Ya estacioné", Icono: ParkingSquare, comando: { tipo: "estacionar", placa } }, instruccion: null, secundario: ocupada };
    }
    case "estacionado":
      return { ...NADA, principal: v.pagado ? { texto: "Salir", Icono: LogOut, comando: { tipo: "salir", placa } } : pagar };
    default:
      return NADA;
  }
}
