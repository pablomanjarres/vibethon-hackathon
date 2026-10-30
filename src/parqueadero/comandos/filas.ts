import { darCelda, ordenDeAtencion, reasignar, salirPorLaPorteria, siguienteEntrada } from "../asignador.ts";
import { carroPorPlaca, celdaDe, codigoAcceso, entradaPorId, esperaDe, normalizarPlaca, servicioDe } from "../consultas.ts";
import { cambiarCelda, exigir } from "../transiciones.ts";
import type { Entrada, Estado } from "../tipos.ts";

/**
 * Plate registration (the camera, or the driver from the app): the car joins the passage, or the
 * waiting line outside it when the passage is full. It is never turned away for lack of room.
 */
export function registrarLlegada(estado: Estado, placaLeida: string, entradaId: string): string {
  const placa = normalizarPlaca(placaLeida);
  exigir(/^[A-Z0-9]{5,7}$/.test(placa), `La placa "${placaLeida}" no es válida.`);
  const entrada = entradaPorId(estado, entradaId);
  const previo = estado.carros[placa];
  exigir(!previo || previo.estado === "retirado", `La placa ${placa} ya está en el parqueadero.`);
  const lleno = entrada.fila.length >= entrada.capacidadPasaje;
  estado.consecutivos.codigo = (estado.consecutivos.codigo ?? 0) + 1;
  estado.carros[placa] = {
    placa,
    codigo: codigoAcceso(estado.consecutivos.codigo),
    entrada: entrada.id,
    estado: lleno ? "en espera" : "en fila",
    llegoEn: estado.minuto,
    celda: null,
    servicio: null,
    estacionadoEn: null,
    llave: "conductor",
    pagado: false,
  };
  if (lleno) {
    entrada.espera = [...esperaDe(entrada), placa];
    return `${placa} quedó registrado en la fila de espera de ${entrada.nombre} (puesto ${entrada.espera.length}); entra al pasaje apenas haya cupo.`;
  }
  entrada.fila.push(placa);
  return `${placa} entró al pasaje de ${entrada.nombre} (${entrada.fila.length} de ${entrada.capacidadPasaje}).`;
}

/** The car at the gate must leave before anyone behind it can be served. */
function exigirQueNoSalga(entrada: Entrada, estado: Estado): void {
  const primero = entrada.fila[0];
  exigir(!primero || !estado.carros[primero].sinParquear, `${primero} sale sin parquear: primero déjalo salir por la portería.`);
}

/** The gate of one entrance hands its first car the next free cell, only when the fairness rule says it is its turn. */
export function asignarCelda(estado: Estado, entradaId: string): string {
  const entrada = entradaPorId(estado, entradaId);
  exigir(entrada.fila.length > 0, `No hay carros en el pasaje de ${entrada.nombre}.`);
  exigirQueNoSalga(entrada, estado);
  const turno = siguienteEntrada(estado);
  exigir(turno?.id === entrada.id, `Es el turno de ${turno?.nombre}: su primer carro llegó antes.`);
  const celda = estado.celdas.find((c) => c.estado === "libre");
  exigir(celda, "No hay celdas libres. El carro sigue en el pasaje.");
  const carro = darCelda(estado, entrada, celda);
  return `${carro.placa} (${entrada.nombre}) va a la celda ${celda.id}.`;
}

/** From the map, the driver who is next in the fairness order reserves the free cell they choose. */
export function reservarCelda(estado: Estado, placa: string, celdaId: string): string {
  const carro = carroPorPlaca(estado, placa);
  exigir(carro.estado === "en fila" && carro.entrada, `${carro.placa} no está esperando en un pasaje.`);
  exigir(!carro.sinParquear, `${carro.placa} va a salir sin parquear.`);
  const adelante = ordenDeAtencion(estado).indexOf(carro.placa);
  exigir(adelante === 0, `Todavía no es tu turno: ${adelante === 1 ? "hay 1 carro" : `hay ${adelante} carros`} antes que tú.`);
  const celda = estado.celdas.find((c) => c.id === celdaId);
  exigir(celda, `No existe la celda ${celdaId}.`);
  exigir(celda.estado === "libre", `La celda ${celda.id} está ${celda.estado}. Elige una libre.`);
  darCelda(estado, entradaPorId(estado, carro.entrada), celda);
  return `${carro.placa} reservó la celda ${celda.id}.`;
}

/** The gate checks the plate against its reservation before the car drives in. */
export function confirmarIngreso(estado: Estado, entradaId: string, placaLeida: string): string {
  const entrada = entradaPorId(estado, entradaId);
  const carro = carroPorPlaca(estado, placaLeida);
  exigir(carro.estado === "con celda", `${carro.placa} no tiene una celda reservada: no puede entrar.`);
  exigir(carro.entrada === entrada.id, `${carro.placa} se registró en otra entrada.`);
  const celda = celdaDe(estado, carro);
  exigir(celda.estado === "reservada" && celda.placa === carro.placa, `La reserva de ${carro.placa} no coincide con la celda ${celda.id}.`);
  exigir(!carro.confirmado, `${carro.placa} ya fue confirmado.`);
  carro.confirmado = true;
  return `Portería ${entrada.nombre}: ${carro.placa} confirmado con reserva en la celda ${celda.id}. Puede entrar.`;
}

/** The driver decides not to park: the car keeps its place in the line until it reaches the gate. */
export function salirSinParquear(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  exigir(carro.estado === "en fila" || carro.estado === "en espera", `${carro.placa} ya no está en la fila.`);
  exigir(!carro.sinParquear, `${carro.placa} ya avisó que sale sin parquear.`);
  exigir(!carro.servicio, `${carro.placa} tiene un valet asignado.`);
  carro.sinParquear = true;
  return `${carro.placa} saldrá sin parquear; conserva su puesto hasta llegar a la portería.`;
}

/** At the gate, a car that is not parking leaves without taking a cell; the next car moves up. */
export function dejarSalir(estado: Estado, entradaId: string): string {
  const entrada = entradaPorId(estado, entradaId);
  const primero = entrada.fila[0];
  exigir(primero && estado.carros[primero].sinParquear, `El primer carro de ${entrada.nombre} no va a salir sin parquear.`);
  const carro = salirPorLaPorteria(estado, entrada);
  carro.estado = "retirado";
  carro.salioEn = estado.minuto;
  return `${carro.placa} salió por la portería de ${entrada.nombre} sin parquear.`;
}

/** The driver or valet finds the reserved cell taken: another one is reserved and the driver is told. */
export function reportarCeldaOcupada(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  exigir(carro.estado === "con celda", `${carro.placa} no tiene una celda reservada.`);
  return reasignar(estado, carro);
}

/** The car reaches its reserved cell after the gate confirmed it. A valet reports zone and cell and still holds the keys. */
export function estacionar(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  exigir(carro.estado === "con celda", `${carro.placa} no tiene una celda reservada.`);
  exigir(carro.confirmado, `La portería todavía no confirmó la placa y la reserva de ${carro.placa}.`);
  const servicio = carro.servicio ? servicioDe(estado, carro) : null;
  const conValet = servicio && !["rechazado", "vencido"].includes(servicio.estado) ? servicio : null;
  exigir(!conValet || conValet.estado === "en curso", `El servicio ${conValet?.ficho} aún no está en curso: primero el valet recibe el carro y el conductor confirma el ficho.`);
  const celda = celdaDe(estado, carro);
  cambiarCelda(celda, "ocupada");
  carro.estado = "estacionado";
  carro.estacionadoEn = estado.minuto;
  carro.aviso = null;
  if (!conValet) return `${carro.placa} se estacionó en ${celda.id}.`;
  conValet.estado = "estacionado";
  return `${conValet.valet} estacionó ${carro.placa} en la zona ${celda.zona}, celda ${celda.id}; ahora lleva las llaves a la oficina (ficho ${conValet.ficho}).`;
}
