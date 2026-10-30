import { describe, expect, it } from "vitest";
import { ordenDeAtencion } from "./asignador.ts";
import { estadoInicial, validarEscenario } from "./escenario.ts";
import demo from "./escenarios/demo.json" with { type: "json" };
import { vistaConductor } from "./lecturas/conductor.ts";
import type { Comando } from "./motor.ts";
import { correr, rechazo, semilla } from "./test/prueba.ts";
import type { Estado } from "./tipos.ts";

const valet = (e: Estado, id: string) => e.valets.find((v) => v.id === id);
const contratar = (placa: string, id: string): Comando => ({ tipo: "contratarValet", placa, valet: id });
const pagar = (aprobado: boolean): Comando => ({ tipo: "pagarValet", servicio: "S-1", aprobado });

/** CXM540 (first in Regional) through the whole service, up to the keys waiting at the office. */
function hastaLaOficina(): { estado: Estado; ficho: string } {
  let estado = correr(semilla(), contratar("CXM540", "RG-V1"), pagar(true), { tipo: "entregarLlaves", placa: "CXM540" });
  const ficho = estado.servicios["S-1"].ficho;
  estado = correr(
    estado,
    { tipo: "confirmarFicho", placa: "CXM540", ficho },
    { tipo: "asignarCelda", entrada: "regional" },
    { tipo: "estacionar", placa: "CXM540" },
  );
  expect(valet(estado, "RG-V1")?.estado).toBe("en servicio");
  return { estado: correr(estado, { tipo: "dejarLlaves", ficho }), ficho };
}

describe("valet: contratar y pagar", () => {
  it("aprobado: aparta al valet, confirma el servicio y le abona el ingreso ligado al servicio", () => {
    let estado = correr(semilla(), contratar("CXM540", "RG-V1"));
    expect(valet(estado, "RG-V1")?.estado).toBe("reservado");
    expect(estado.servicios["S-1"]).toMatchObject({ estado: "pago pendiente", precio: 8000 });
    estado = correr(estado, pagar(true));
    expect(estado.servicios["S-1"].estado).toBe("pagado");
    expect(estado.ingresos).toEqual([{ id: "I-1", servicio: "S-1", valet: "RG-V1", monto: 8000, enMinuto: 0 }]);
  });

  it("rechazado: libera al valet y el conductor conserva su turno", () => {
    const estado = correr(semilla(), contratar("CXM540", "RG-V1"), pagar(false));
    expect(valet(estado, "RG-V1")?.estado).toBe("disponible");
    expect(estado.servicios["S-1"].estado).toBe("rechazado");
    expect(ordenDeAtencion(estado)[0]).toBe("CXM540");
    expect(estado.ingresos ?? []).toEqual([]);
  });

  it("vencido: si el pago no llega a tiempo, el valet queda libre", () => {
    const estado = correr(semilla(), contratar("CXM540", "RG-V1"), { tipo: "avanzarReloj", minutos: 2 });
    expect(estado.servicios["S-1"].estado).toBe("vencido");
    expect(valet(estado, "RG-V1")?.estado).toBe("disponible");
    expect(rechazo(estado, pagar(true))).toMatch(/está en "vencido"/);
  });

  it("contratar no da prioridad ni libera espacio en el pasaje", () => {
    const antes = semilla();
    const estado = correr(antes, contratar("SVK088", "RG-V1"), { tipo: "pagarValet", servicio: "S-1", aprobado: true });
    expect(ordenDeAtencion(estado)).toEqual(ordenDeAtencion(antes));
    expect(estado.entradas[1].fila).toEqual(antes.entradas[1].fila);
  });
});

describe("valet: reglas de contratación", () => {
  it("solo dentro del pasaje y solo un valet de la propia entrada", () => {
    const afuera = correr(semilla(), { tipo: "registrarLlegada", placa: "MAT471", entrada: "las-vegas" });
    expect(rechazo(afuera, contratar("MAT471", "LV-V1"))).toMatch(/dentro del pasaje/);
    expect(rechazo(semilla(), contratar("CXM540", "LV-V1"))).toMatch(/trabaja en Las Vegas; elige un valet de tu entrada/);
  });

  it("sin valets disponibles no se puede contratar", () => {
    const copia = structuredClone(demo);
    copia.entradas[1].valets = 1;
    const estado = correr(estadoInicial(validarEscenario(copia)), contratar("NBD218", "RG-V1"));
    expect(vistaConductor(estado, "CXM540").puedePedirValet).toBe(false);
    expect(rechazo(estado, contratar("CXM540", "RG-V1"))).toMatch(/ya no está disponible/);
  });

  it("dos conductores compiten por el mismo valet: solo uno gana", () => {
    const estado = correr(semilla(), contratar("NBD218", "RG-V1"));
    expect(rechazo(estado, contratar("CXM540", "RG-V1"))).toMatch(/RG-V1 ya no está disponible/);
    expect(estado.servicios["S-1"].placa).toBe("NBD218");
  });

  it("dos carros por la misma celda: solo uno la reserva", () => {
    const estado = correr(semilla(), { tipo: "reservarCelda", placa: "CXM540", celda: "A04" });
    expect(rechazo(estado, { tipo: "reservarCelda", placa: "FRS112", celda: "A04" })).toMatch(/A04 está reservada/);
  });
});

describe("valet: entrega, estacionamiento y llaves", () => {
  it("pasos saltados o repetidos se rechazan con un mensaje claro", () => {
    const estado = correr(semilla(), contratar("CXM540", "RG-V1"));
    expect(rechazo(estado, { tipo: "entregarLlaves", placa: "CXM540" })).toMatch(/No se puede entregar las llaves: el servicio .* está en "pago pendiente"/);
    const pagado = correr(estado, pagar(true));
    expect(rechazo(pagado, pagar(true))).toMatch(/está en "pagado"/);
    const conFicho = correr(pagado, { tipo: "entregarLlaves", placa: "CXM540" });
    expect(rechazo(conFicho, { tipo: "confirmarFicho", placa: "CXM540", ficho: "F-000-0000" })).toMatch(/no coincide/);
    expect(rechazo(conFicho, { tipo: "dejarLlaves", ficho: conFicho.servicios["S-1"].ficho })).toMatch(/está en "ficho emitido"/);
  });

  it("el valet vuelve a disponible solo después de dejar las llaves en la oficina", () => {
    const { estado } = hastaLaOficina();
    expect(valet(estado, "RG-V1")?.estado).toBe("disponible");
    expect(estado.carros.CXM540.llave).toBe("tablero");
  });

  it("un ficho equivocado se rechaza y un segundo reclamo también", () => {
    const { estado, ficho } = hastaLaOficina();
    expect(rechazo(estado, { tipo: "reclamarLlaves", ficho: "F-999-1234" })).toMatch(/Ese ficho no existe/);
    const entregado = correr(estado, { tipo: "reclamarLlaves", ficho });
    expect(entregado.servicios["S-1"]).toMatchObject({ estado: "entregado", entregadoEn: 0 });
    expect(entregado.carros.CXM540.llave).toBe("conductor");
    expect(rechazo(entregado, { tipo: "reclamarLlaves", ficho })).toMatch(/ya se entregaron/);
  });
});
