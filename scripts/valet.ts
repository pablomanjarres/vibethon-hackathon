// One valet service from payment to delivered keys, with the clock running, as the log records it.
// usage: npm run valet
import { estadoInicial } from "../src/parqueadero/escenario.ts";
import { ESCENARIO_INICIAL } from "../src/parqueadero/escenarios/index.ts";
import { hora } from "../src/parqueadero/lecturas/formato.ts";
import { ejecutar, type Comando } from "../src/parqueadero/motor.ts";
import type { Estado } from "../src/parqueadero/tipos.ts";

let estado: Estado = estadoInicial(ESCENARIO_INICIAL);
const paso = (comando: Comando, minutos = 0) => {
  if (minutos) estado = ejecutar(estado, { tipo: "avanzarReloj", minutos }).estado;
  const r = ejecutar(estado, comando);
  console.log(`${hora(estado.inicio, estado.minuto)}  ${r.ok ? "ok" : "NO"}  ${r.ok ? r.evento.detalle : r.motivo}`);
  if (r.ok) estado = r.estado;
};
const ficho = () => estado.servicios["S-1"]?.ficho ?? "";

console.log(`Servicio de valet de CXM540 (Regional), precio ${estado.reglas.tarifaValet} ${estado.reglas.moneda}\n`);
paso({ tipo: "contratarValet", placa: "CXM540", valet: "RG-V1" });
paso({ tipo: "contratarValet", placa: "NBD218", valet: "RG-V1" });
paso({ tipo: "pagarValet", servicio: "S-1", aprobado: true }, 1);
paso({ tipo: "entregarLlaves", placa: "CXM540" }, 1);
paso({ tipo: "confirmarFicho", placa: "CXM540", ficho: ficho() });
paso({ tipo: "asignarCelda", entrada: "regional" }, 2);
paso({ tipo: "dejarLlaves", ficho: ficho() });
paso({ tipo: "confirmarIngreso", entrada: "regional", placa: "CXM540" }, 1);
paso({ tipo: "estacionar", placa: "CXM540" }, 2);
paso({ tipo: "dejarLlaves", ficho: ficho() }, 3);
paso({ tipo: "reclamarLlaves", ficho: "F-999-0000" }, 90);
paso({ tipo: "reclamarLlaves", ficho: ficho() });
paso({ tipo: "reclamarLlaves", ficho: ficho() });

console.log("\nIngresos:", JSON.stringify(estado.ingresos));
console.log("Valet RG-V1:", estado.valets.find((v) => v.id === "RG-V1")?.estado);
