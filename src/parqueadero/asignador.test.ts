import { describe, expect, it } from "vitest";
import { ordenDeAtencion } from "./asignador.ts";
import { celda, correr, liberar, rechazo, semilla } from "./test/prueba.ts";

describe("pasajes y fila de espera", () => {
  it("respeta los dos cupos: 4 en Las Vegas y 6 en Regional; el siguiente espera afuera", () => {
    const estado = correr(
      semilla(),
      { tipo: "registrarLlegada", placa: "MAT471", entrada: "las-vegas" },
      { tipo: "registrarLlegada", placa: "OLP350", entrada: "regional" },
    );
    expect(estado.entradas.map((e) => [e.fila.length, e.capacidadPasaje, e.espera])).toEqual([
      [4, 4, ["MAT471"]],
      [6, 6, ["OLP350"]],
    ]);
    expect(estado.carros.MAT471).toMatchObject({ estado: "en espera", entrada: "las-vegas", llegoEn: 0 });
  });

  it("cuando un carro avanza y deja un hueco, entra el siguiente de afuera", () => {
    let estado = correr(semilla(), { tipo: "registrarLlegada", placa: "MAT471", entrada: "las-vegas" });
    estado = correr(estado, { tipo: "asignarCelda", entrada: "regional" });
    estado = liberar(estado, "HKM214");
    estado = correr(estado, { tipo: "asignarCelda", entrada: "las-vegas" });
    expect(estado.entradas[0].fila).toEqual(["HUO845", "KPA391", "ZTE627", "MAT471"]);
    expect(estado.carros.MAT471.estado).toBe("en fila");
  });

  it("dentro del pasaje solo se avanza: nadie se adelanta ni se registra dos veces", () => {
    const estado = semilla();
    expect(rechazo(estado, { tipo: "reservarCelda", placa: "SVK088", celda: "A04" })).toMatch(/Todavía no es tu turno/);
    expect(rechazo(estado, { tipo: "registrarLlegada", placa: "FRS112", entrada: "regional" })).toMatch(/ya está en el parqueadero/);
  });
});

describe("salir sin parquear", () => {
  it("conserva el puesto hasta la portería, sale sin celda y nunca desaparece antes", () => {
    let estado = correr(semilla(), { tipo: "salirSinParquear", placa: "CXM540" });
    expect(estado.entradas[1].fila[0]).toBe("CXM540");
    expect(ordenDeAtencion(estado)[0]).toBe("CXM540");
    expect(rechazo(estado, { tipo: "asignarCelda", entrada: "regional" })).toMatch(/sale sin parquear/);
    expect(rechazo(estado, { tipo: "dejarSalir", entrada: "las-vegas" })).toMatch(/no va a salir sin parquear/);
    estado = correr(estado, { tipo: "dejarSalir", entrada: "regional" });
    expect(estado.carros.CXM540).toMatchObject({ estado: "retirado", celda: null, salioEn: 0 });
    expect(celda(estado, "A04")?.estado).toBe("libre");
    expect(estado.entradas[1].fila).not.toContain("CXM540");
  });
});

describe("asignación, portería y salida", () => {
  it("asignar reserva la celda en el mismo paso: nadie más la recibe", () => {
    const estado = correr(semilla(), { tipo: "asignarCelda", entrada: "regional" });
    expect(celda(estado, "A04")).toMatchObject({ estado: "reservada", placa: "CXM540" });
    expect(rechazo(estado, { tipo: "asignarCelda", entrada: "las-vegas" })).toMatch(/No hay celdas libres/);
  });

  it("la cámara de la portería confirma la placa al asignar; reservada pasa a ocupada al estacionar", () => {
    let estado = correr(semilla(), { tipo: "asignarCelda", entrada: "regional" });
    expect(estado.carros.CXM540.confirmado).toBe(true);
    expect(rechazo(estado, { tipo: "confirmarIngreso", entrada: "regional", placa: "CXM540" })).toMatch(/ya fue confirmado/);
    expect(rechazo(estado, { tipo: "confirmarIngreso", entrada: "regional", placa: "NBD218" })).toMatch(/no tiene una celda reservada/);
    estado = correr(estado, { tipo: "estacionar", placa: "CXM540" });
    expect(celda(estado, "A04")?.estado).toBe("ocupada");
  });

  it("libera la celda cuando el carro sale y guarda el momento", () => {
    let estado = correr(semilla(), { tipo: "avanzarReloj", minutos: 5 });
    estado = liberar(estado, "HKM214");
    expect(celda(estado, "A01")).toMatchObject({ estado: "libre", placa: null });
    expect(estado.liberaciones).toEqual([5]);
  });

  it("con el lote lleno las filas se quedan y no se inventan celdas", () => {
    let estado = correr(semilla(), { tipo: "reservarCelda", placa: "CXM540", celda: "A04" });
    expect(estado.celdas.filter((c) => c.estado === "libre")).toHaveLength(0);
    expect(rechazo(estado, { tipo: "asignarCelda", entrada: "las-vegas" })).toMatch(/No hay celdas libres/);
    estado = correr(estado, { tipo: "registrarLlegada", placa: "MAT471", entrada: "las-vegas" });
    expect(estado.entradas.map((e) => e.fila.length)).toEqual([4, 5]);
    expect(estado.celdas).toHaveLength(12);
  });
});

describe("reasignación", () => {
  it("si la celda asignada está ocupada, reasigna otra, avisa y mantiene el carro", () => {
    let estado = correr(semilla(), { tipo: "asignarCelda", entrada: "regional" });
    estado = liberar(estado, "HKM214");
    estado = correr(estado, { tipo: "reportarCeldaOcupada", placa: "CXM540" });
    expect(celda(estado, "A04")?.estado).toBe("ocupada");
    expect(estado.carros.CXM540).toMatchObject({ estado: "con celda", celda: "A01", aviso: "La celda A04 estaba ocupada. Tu nueva celda es A01." });
    expect(celda(estado, "A01")).toMatchObject({ estado: "reservada", placa: "CXM540" });
  });

  it("sin otra libre, el carro vuelve al frente de su pasaje y sigue vinculado", () => {
    let estado = correr(semilla(), { tipo: "asignarCelda", entrada: "regional" });
    estado = correr(estado, { tipo: "reportarCeldaOcupada", placa: "CXM540" });
    expect(estado.entradas[1].fila[0]).toBe("CXM540");
    expect(estado.carros.CXM540).toMatchObject({ estado: "en fila", celda: null });
    expect(estado.carros.CXM540.aviso).toMatch(/no hay otra libre/);
  });

  it("sin otra libre y con el pasaje lleno, espera primero afuera sin pasar el cupo", () => {
    let estado = correr(semilla(), { tipo: "asignarCelda", entrada: "regional" }, { tipo: "registrarLlegada", placa: "OLP350", entrada: "regional" });
    expect(estado.entradas[1].fila).toHaveLength(6);
    estado = correr(estado, { tipo: "reportarCeldaOcupada", placa: "CXM540" });
    expect(estado.entradas[1].fila).toHaveLength(6);
    expect(estado.entradas[1].espera?.[0]).toBe("CXM540");
    expect(estado.carros.CXM540).toMatchObject({ estado: "en espera", celda: null });
  });
});
