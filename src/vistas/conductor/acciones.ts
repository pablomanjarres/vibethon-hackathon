import { Banknote, CarFront, CircleAlert, KeyRound, LogOut, MapPin, ParkingSquare, type LucideIcon } from "lucide-react";
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
  switch (v.estado) {
    case "en fila":
    case "en espera": {
      const celda = v.puedeReservar ? (elegida && v.celdasLibres.includes(elegida) ? elegida : v.celdasLibres[0]) : null;
      return {
        principal: celda ? { texto: `Reservar celda ${celda}`, Icono: MapPin, comando: { tipo: "reservarCelda", placa, celda } } : null,
        instruccion: null,
        secundario: v.puedeSalirSinParquear ? { texto: "Salir sin parquear", Icono: LogOut, comando: { tipo: "salirSinParquear", placa } } : null,
      };
    }
    case "con celda": {
      if (v.ficho)
        return v.llave === "conductor"
          ? { ...NADA, principal: { texto: "Ya entregué las llaves", Icono: KeyRound, comando: { tipo: "entregarLlaves", placa } } }
          : NADA;
      const ocupada: Paso = { texto: "Mi celda está ocupada", Icono: CircleAlert, comando: { tipo: "reportarCeldaOcupada", placa } };
      if (!v.confirmado) {
        const valet: Paso = { texto: "Reservar valet", Icono: KeyRound, comando: { tipo: "pedirValet", placa } };
        return { principal: null, instruccion: "Muestra tu placa en la portería", secundario: v.puedePedirValet ? valet : ocupada };
      }
      return { principal: { texto: "Ya estacioné", Icono: ParkingSquare, comando: { tipo: "estacionar", placa } }, instruccion: null, secundario: ocupada };
    }
    case "estacionado":
      if (v.ficho)
        return {
          principal: { texto: "Pedir mi carro", Icono: CarFront, comando: { tipo: "pedirDevolucion", ficho: v.ficho } },
          instruccion: null,
          secundario: v.pagado ? null : pagar,
        };
      return { ...NADA, principal: v.pagado ? { texto: "Salir", Icono: LogOut, comando: { tipo: "salir", placa } } : pagar };
    case "en devolución":
      return v.pagado ? NADA : { ...NADA, principal: pagar };
    default:
      return NADA;
  }
}
