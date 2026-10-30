import { carroPorPlaca, celdaDe, codigoAcceso, entradaPorId, esperaDe, normalizarPlaca, servicioDe, valetPorId } from "../consultas.ts";
import { ordenDeAtencion, siguienteEntrada } from "../equidad.ts";
import { cambiarCelda, cambiarValet, exigir } from "../transiciones.ts";
import type { Carro, Celda, Entrada, Estado } from "../tipos.ts";

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

/** Moves the first car of an entrance out of its passage and reserves the cell for it. */
function darCelda(estado: Estado, entrada: Entrada, celda: Celda): Carro {
  const carro = estado.carros[entrada.fila.shift() as string];
  cambiarCelda(celda, "reservada");
  celda.placa = carro.placa;
  carro.estado = "con celda";
  carro.celda = celda.id;
  entrada.celdasAsignadas += 1;
  const [siguiente, ...resto] = esperaDe(entrada);
  if (siguiente) {
    entrada.espera = resto;
    entrada.fila.push(siguiente);
    estado.carros[siguiente].estado = "en fila";
  }
  return carro;
}

/** The gate of one entrance hands its first car the next free cell, only when the fairness rule says it is its turn. */
export function asignarCelda(estado: Estado, entradaId: string): string {
  const entrada = entradaPorId(estado, entradaId);
  exigir(entrada.fila.length > 0, `No hay carros en el pasaje de ${entrada.nombre}.`);
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
  const adelante = ordenDeAtencion(estado).indexOf(carro.placa);
  exigir(adelante === 0, `Todavía no es tu turno: ${adelante === 1 ? "hay 1 carro" : `hay ${adelante} carros`} antes que tú.`);
  const celda = estado.celdas.find((c) => c.id === celdaId);
  exigir(celda, `No existe la celda ${celdaId}.`);
  exigir(celda.estado === "libre", `La celda ${celda.id} está ${celda.estado}. Elige una libre.`);
  darCelda(estado, entradaPorId(estado, carro.entrada), celda);
  return `${carro.placa} reservó la celda ${celda.id}.`;
}

/** The car reaches its reserved cell. A valet who drove it goes back to available and the keys go to the board. */
export function estacionar(estado: Estado, placa: string): string {
  const carro = carroPorPlaca(estado, placa);
  exigir(carro.estado === "con celda", `${carro.placa} no tiene una celda reservada.`);
  const servicio = carro.servicio ? servicioDe(estado, carro) : null;
  exigir(!servicio || servicio.estado === "en curso", `El valet todavía no recibió las llaves de ${carro.placa}.`);
  const celda = celdaDe(estado, carro);
  cambiarCelda(celda, "ocupada");
  carro.estado = "estacionado";
  carro.estacionadoEn = estado.minuto;
  if (!servicio) return `${carro.placa} se estacionó en ${celda.id}.`;
  const valet = valetPorId(estado, servicio.valet);
  cambiarValet(valet, "disponible");
  valet.servicio = null;
  servicio.valet = null;
  servicio.estado = "estacionado";
  carro.llave = "tablero";
  return `${valet.id} estacionó ${carro.placa} en ${celda.id}; las llaves quedaron en el tablero con el ficho ${servicio.ficho}.`;
}
