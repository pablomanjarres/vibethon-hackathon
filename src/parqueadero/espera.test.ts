import { describe, expect, it } from "vitest";
import { estimarEspera } from "./espera.ts";
import { vistaConductor } from "./lecturas/conductor.ts";
import { vistaLlegada } from "./lecturas/llegada.ts";
import { correr, liberar, semilla } from "./test/prueba.ts";

describe("estimación de espera", () => {
  it("muestra puesto y carros adelante, y dice que faltan datos al comienzo", () => {
    const espera = estimarEspera(semilla(), "SVK088");
    expect(espera).toMatchObject({ posicion: 10, carrosAdelante: 9, rango: null, suficientesDatos: false });
    expect(vistaConductor(semilla(), "SVK088").mensaje).toMatch(/Puesto 10: 9 carros antes que tú\. Aún no hay datos suficientes/);
  });

  it("con una celda libre para el puesto, la espera es cero", () => {
    expect(estimarEspera(semilla(), "CXM540")).toMatchObject({ posicion: 1, rango: { min: 0, max: 0 } });
  });

  it("se mueve con los eventos reales: asignaciones y liberaciones", () => {
    let estado = correr(semilla(), { tipo: "asignarCelda", entrada: "regional" });
    estado = correr(estado, { tipo: "avanzarReloj", minutos: 2 });
    estado = liberar(estado, "HKM214");
    estado = correr(estado, { tipo: "asignarCelda", entrada: "las-vegas" }, { tipo: "avanzarReloj", minutos: 4 });
    estado = liberar(estado, "JRT508");
    const primera = estimarEspera(estado, "SVK088");
    expect(primera).toMatchObject({ carrosAdelante: 7, suficientesDatos: true });
    expect(primera?.rango?.min).toBeGreaterThan(0);
    expect(primera?.rango?.max).toBeGreaterThanOrEqual(primera?.rango?.min ?? 0);
    expect(vistaConductor(estado, "SVK088").mensaje).toMatch(/Espera estimada: .*min\. Es una estimación/);

    estado = correr(estado, { tipo: "asignarCelda", entrada: "regional" }, { tipo: "avanzarReloj", minutos: 1 });
    estado = liberar(estado, "DWN161");
    const despues = estimarEspera(estado, "SVK088");
    expect(despues?.carrosAdelante).toBe(6);
    expect(despues).not.toEqual(primera);
  });

  it("con el lote lleno la estimación sigue cambiando sin inventar celdas", () => {
    let estado = correr(semilla(), { tipo: "reservarCelda", placa: "CXM540", celda: "A04" }, { tipo: "avanzarReloj", minutos: 3 });
    estado = liberar(estado, "HKM214");
    estado = correr(estado, { tipo: "reservarCelda", placa: "FRS112", celda: "A01" });
    expect(estado.celdas.filter((c) => c.estado === "libre")).toHaveLength(0);
    const espera = estimarEspera(estado, "NBD218");
    expect(espera?.rango?.min).toBeGreaterThan(0);
  });
});

describe("antes de registrarse", () => {
  it("el conductor ve ambas filas, adentro y afuera, la disponibilidad y la regla", () => {
    const estado = correr(semilla(), { tipo: "registrarLlegada", placa: "MAT471", entrada: "las-vegas" });
    const vista = vistaLlegada(estado);
    expect(vista.entradas.map((e) => [e.nombre, e.dentro, e.capacidad, e.afuera])).toEqual([
      ["Las Vegas", 4, 4, 1],
      ["Regional", 6, 6, 0],
    ]);
    expect([vista.celdasLibres, vista.celdasTotal]).toEqual([1, 12]);
    expect(vista.regla).toMatch(/orden de llegada.*llegó primero/);
    expect(JSON.stringify(vista)).not.toMatch(/MAT471|FRS112/);
  });
});
