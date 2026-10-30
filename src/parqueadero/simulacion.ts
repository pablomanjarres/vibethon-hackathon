import type { Escenario, EventoSimulado } from "./escenario.ts";
import { siguienteEntrada } from "./asignador.ts";
import { ejecutar, type Comando } from "./motor.ts";
import type { Estado } from "./tipos.ts";

/** Simulated arrivals and exits from the scenario file, as the commands a real camera and cashier would send. */
export function comandosDelEvento(evento: EventoSimulado): Comando[] {
  if (evento.tipo === "llegada") return [{ tipo: "registrarLlegada", placa: evento.placa, entrada: evento.entrada }];
  return [
    { tipo: "pagar", placa: evento.placa },
    { tipo: "salir", placa: evento.placa },
  ];
}

/**
 * Moves the clock up to `hasta`, stopping at each scenario event's minute to run it, so the log
 * gets one clock entry per jump instead of one per minute. Events the rules reject (a full
 * passage, an unknown plate) are returned with their reason.
 */
export function simularHasta(estado: Estado, escenario: Escenario, hasta: number): { estado: Estado; rechazos: string[] } {
  let actual = estado;
  const rechazos: string[] = [];
  while (actual.minuto < hasta) {
    const desde = actual.minuto;
    const proximo = Math.min(hasta, ...escenario.eventos.map((e) => e.minuto).filter((m) => m > desde));
    const paso = ejecutar(actual, { tipo: "avanzarReloj", minutos: proximo - desde });
    if (!paso.ok) break;
    actual = paso.estado;
    for (const evento of escenario.eventos.filter((e) => e.minuto === actual.minuto)) {
      for (const comando of comandosDelEvento(evento)) {
        const resultado = ejecutar(actual, comando);
        if (resultado.ok) actual = resultado.estado;
        else rechazos.push(`Minuto ${evento.minuto}: ${resultado.motivo}`);
      }
    }
  }
  return { estado: actual, rechazos };
}

/** What someone else in the lot does next so one car moves forward, and who does it. */
export interface PasoSimulado {
  quien: string;
  comandos: Comando[];
  /** Simulated minutes the action takes (the clock advances by this first). */
  minutos?: number;
}

const ACTIVOS = ["pago pendiente", "pagado", "ficho emitido", "en curso", "estacionado", "llaves en oficina"];

/**
 * The next action the gate, a valet, the office or another driver would take to move this car
 * along (the presenter's "next step" button). Null when the car has nothing left to wait for.
 */
export function pasoSimulado(estado: Estado, placa: string): PasoSimulado | null {
  const paso = siguienteAccion(estado, placa);
  if (!paso) return null;
  // Each simulated action takes time, so the clock moves and the wait estimate gets real data.
  const minutos = paso.quien.startsWith("Otro conductor") ? 3 : paso.comandos[0]?.tipo === "asignarCelda" ? 2 : 1;
  return { ...paso, minutos, comandos: [{ tipo: "avanzarReloj", minutos }, ...paso.comandos] };
}

function siguienteAccion(estado: Estado, placa: string): PasoSimulado | null {
  const carro = estado.carros[placa];
  if (!carro || carro.estado === "retirado") return null;
  const servicio = carro.servicio && ACTIVOS.includes(estado.servicios[carro.servicio]?.estado) ? estado.servicios[carro.servicio] : null;
  if (servicio?.estado === "pago pendiente") return { quien: "Pasarela de pago", comandos: [{ tipo: "pagarValet", servicio: servicio.id, aprobado: true }] };
  if (servicio?.estado === "pagado") return { quien: `Valet ${servicio.valet}`, comandos: [{ tipo: "entregarLlaves", placa }] };
  if (servicio?.estado === "ficho emitido") return { quien: "Conductor", comandos: [{ tipo: "confirmarFicho", placa, ficho: servicio.ficho }] };
  if (carro.estado === "con celda") {
    if (!carro.confirmado && carro.entrada) return { quien: "Portería", comandos: [{ tipo: "confirmarIngreso", entrada: carro.entrada, placa }] };
    return { quien: servicio ? `Valet ${servicio.valet}` : "Conductor", comandos: [{ tipo: "estacionar", placa }] };
  }
  if (carro.estado === "estacionado") {
    if (servicio?.estado === "estacionado") return { quien: `Valet ${servicio.valet}`, comandos: [{ tipo: "dejarLlaves", ficho: servicio.ficho }] };
    if (servicio?.estado === "llaves en oficina") return { quien: "Oficina", comandos: [{ tipo: "reclamarLlaves", ficho: servicio.ficho }] };
    return null;
  }
  // Waiting in a passage or outside it: move the line at the gate whose turn it is.
  const turno = siguienteEntrada(estado);
  if (!turno) return null;
  const primero = estado.carros[turno.fila[0]];
  if (primero.sinParquear) return { quien: `Portería ${turno.nombre}`, comandos: [{ tipo: "dejarSalir", entrada: turno.id }] };
  if (estado.celdas.some((c) => c.estado === "libre")) return { quien: `Portería ${turno.nombre}`, comandos: [{ tipo: "asignarCelda", entrada: turno.id }] };
  // Lot full: cars ahead that already have a cell finish parking first.
  const enCamino = Object.values(estado.carros).find((c) => c.estado === "con celda" && c.placa !== placa);
  if (enCamino) {
    const otro = siguienteAccion(estado, enCamino.placa);
    if (otro) return { quien: `${otro.quien} (${enCamino.placa})`, comandos: otro.comandos };
  }
  // Lot full: a parked car without a valet in progress pays and leaves, freeing its cell.
  const saliente = Object.values(estado.carros).find(
    (c) => c.estado === "estacionado" && (!c.servicio || !ACTIVOS.includes(estado.servicios[c.servicio]?.estado)),
  );
  if (!saliente) return null;
  return {
    quien: `Otro conductor (${saliente.placa})`,
    comandos: [...(saliente.pagado ? [] : [{ tipo: "pagar", placa: saliente.placa } as Comando]), { tipo: "salir", placa: saliente.placa }],
  };
}
