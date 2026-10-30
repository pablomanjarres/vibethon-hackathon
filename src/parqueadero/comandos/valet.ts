import { carroPorPlaca, celdaDe, codigoAcceso, nombreEntrada, servicioDe, servicioPorFicho, valetPorId } from "../consultas.ts";
import { cambiarValet, exigir } from "../transiciones.ts";
import type { Estado, Servicio } from "../tipos.ts";

/**
 * The valet service, one state per step:
 * pago pendiente → pagado → ficho emitido → en curso → estacionado → llaves en oficina → entregado
 * (or rechazado / vencido when the simulated payment fails or times out). Skipping or repeating a
 * step is rejected with the step the service is in.
 */

/** Minutes the chosen valet is held while the simulated payment runs. */
export function minutosDePago(estado: Estado): number {
  return estado.reglas.minutosPago ?? 2;
}

function exigirPaso(servicio: Servicio, esperado: Servicio["estado"], accion: string): void {
  exigir(servicio.estado === esperado, `No se puede ${accion}: el servicio ${servicio.ficho} está en "${servicio.estado}".`);
}

function valetDe(estado: Estado, servicio: Servicio) {
  return valetPorId(estado, servicio.valet);
}

/**
 * Hiring holds the chosen valet and creates the service in one command, so two drivers can never
 * get the same valet. Only a car already inside its passage, only a valet of its own entrance. It
 * gives no priority and frees no space: the car keeps its exact place in line.
 */
export function contratarValet(estado: Estado, placa: string, valetId: string): string {
  const carro = carroPorPlaca(estado, placa);
  exigir(carro.estado === "en fila" || carro.estado === "con celda", "Solo puedes contratar un valet cuando ya estás dentro del pasaje.");
  const activo = carro.servicio ? estado.servicios[carro.servicio] : null;
  exigir(!activo || activo.estado === "rechazado" || activo.estado === "vencido", `${carro.placa} ya tiene un servicio de valet.`);
  const valet = estado.valets.find((v) => v.id === valetId);
  exigir(valet, `No existe el valet ${valetId}.`);
  exigir(valet.entrada === carro.entrada, `${valet.id} trabaja en ${nombreEntrada(estado, valet.entrada)}; elige un valet de tu entrada.`);
  exigir(valet.estado === "disponible", `${valet.id} ya no está disponible. Elige otro.`);
  estado.consecutivos.servicio += 1;
  const n = estado.consecutivos.servicio;
  const servicio: Servicio = {
    id: `S-${n}`,
    placa: carro.placa,
    ficho: `F-${String(n).padStart(3, "0")}-${codigoAcceso(7000 + n)}`,
    valet: valet.id,
    estado: "pago pendiente",
    asignadoEn: estado.minuto,
    precio: estado.reglas.tarifaValet,
    pagoVence: estado.minuto + minutosDePago(estado),
  };
  estado.servicios[servicio.id] = servicio;
  cambiarValet(valet, "reservado");
  valet.servicio = servicio.id;
  carro.servicio = servicio.id;
  return `${valet.id} quedó apartado para ${carro.placa} mientras se paga ${servicio.precio} ${estado.reglas.moneda} (servicio ${servicio.id}).`;
}

/** Releases the held valet when the payment does not go through; the driver keeps their turn. */
function soltarValet(estado: Estado, servicio: Servicio, fin: "rechazado" | "vencido"): void {
  const valet = valetDe(estado, servicio);
  cambiarValet(valet, "disponible");
  valet.servicio = null;
  servicio.estado = fin;
  servicio.valet = null;
}

/** Simulated payment: approved confirms the service and credits the income to that valet; rejected frees the valet. */
export function pagarValet(estado: Estado, servicioId: string, aprobado: boolean): string {
  const servicio = estado.servicios[servicioId];
  exigir(servicio, `No existe el servicio ${servicioId}.`);
  exigirPaso(servicio, "pago pendiente", "pagar");
  if (!aprobado) {
    const valet = servicio.valet;
    soltarValet(estado, servicio, "rechazado");
    return `Pago rechazado para ${servicio.id}: ${valet} vuelve a estar disponible y ${servicio.placa} conserva su turno.`;
  }
  servicio.estado = "pagado";
  estado.consecutivos.ingreso = (estado.consecutivos.ingreso ?? 0) + 1;
  estado.ingresos = [
    ...(estado.ingresos ?? []),
    { id: `I-${estado.consecutivos.ingreso}`, servicio: servicio.id, valet: servicio.valet as string, monto: servicio.precio ?? 0, enMinuto: estado.minuto },
  ];
  return `Pago aprobado: ${servicio.precio} ${estado.reglas.moneda} para ${servicio.valet} (servicio ${servicio.id}).`;
}

/** Payments still pending when their time runs out free the valet. Called when the clock moves. */
export function vencerPagos(estado: Estado): string[] {
  return Object.values(estado.servicios)
    .filter((s) => s.estado === "pago pendiente" && estado.minuto >= (s.pagoVence ?? Infinity))
    .map((s) => {
      const valet = s.valet;
      soltarValet(estado, s, "vencido");
      return `El pago de ${s.id} venció: ${valet} vuelve a estar disponible y ${s.placa} conserva su turno.`;
    });
}

/** In the passage the valet takes the car and hands the driver the ficho. */
export function entregarLlaves(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  const servicio = servicioDe(estado, carro);
  exigirPaso(servicio, "pagado", "entregar las llaves");
  exigir(carro.estado === "en fila" || carro.estado === "con celda", `${carro.placa} ya no está esperando entrar.`);
  cambiarValet(valetDe(estado, servicio), "en servicio");
  servicio.estado = "ficho emitido";
  carro.llave = "valet";
  return `${servicio.valet} recibió el carro ${carro.placa} y entregó el ficho ${servicio.ficho}.`;
}

/** The driver confirms the ficho code before leaving; then they can walk to class. */
export function confirmarFicho(estado: Estado, placa: string, ficho: string): string {
  const carro = carroPorPlaca(estado, placa);
  const servicio = servicioDe(estado, carro);
  exigirPaso(servicio, "ficho emitido", "confirmar el ficho");
  exigir(servicio.ficho === ficho.trim().toUpperCase(), "El ficho no coincide con este servicio.");
  servicio.estado = "en curso";
  return `${carro.placa} confirmó el ficho ${servicio.ficho}. Puede ir a clase; el carro conserva su puesto con ${servicio.valet}.`;
}

/** Back at the office the valet leaves the keys; only now is the valet free again. */
export function dejarLlaves(estado: Estado, ficho: string): string {
  const servicio = servicioPorFicho(estado, ficho);
  exigirPaso(servicio, "estacionado", "dejar las llaves en la oficina");
  const valet = valetDe(estado, servicio);
  cambiarValet(valet, "disponible");
  valet.servicio = null;
  servicio.estado = "llaves en oficina";
  estado.carros[servicio.placa].llave = "tablero";
  return `${valet.id} dejó las llaves de ${servicio.placa} en la oficina (ficho ${servicio.ficho}) y queda disponible.`;
}

/** The driver shows the ficho; the office validates it and records the delivery. */
export function reclamarLlaves(estado: Estado, ficho: string): string {
  const buscado = ficho.trim().toUpperCase();
  const servicio = Object.values(estado.servicios).find((s) => s.ficho === buscado);
  exigir(servicio, "Ese ficho no existe. Revisa el código.");
  exigir(servicio.estado !== "entregado", `Las llaves del ficho ${servicio.ficho} ya se entregaron.`);
  exigirPaso(servicio, "llaves en oficina", "entregar las llaves");
  const carro = estado.carros[servicio.placa];
  servicio.estado = "entregado";
  servicio.entregadoEn = estado.minuto;
  carro.llave = "conductor";
  const celda = carro.celda ? celdaDe(estado, carro).id : "su celda";
  return `Oficina: llaves de ${carro.placa} entregadas con el ficho ${servicio.ficho}. El carro está en ${celda}.`;
}
