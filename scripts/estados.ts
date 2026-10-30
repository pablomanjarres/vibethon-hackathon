// Runs the allocator and the wait estimate through each state from the seed and prints what every view would read.
// usage: npm run estados
import { reglaDeReparto } from "../src/parqueadero/asignador.ts";
import { estadoInicial } from "../src/parqueadero/escenario.ts";
import { ESCENARIO_INICIAL } from "../src/parqueadero/escenarios/index.ts";
import { textoEspera, vistaConductor } from "../src/parqueadero/lecturas/conductor.ts";
import { vistaLlegada } from "../src/parqueadero/lecturas/llegada.ts";
import { ejecutar, type Comando } from "../src/parqueadero/motor.ts";
import { estimarEspera } from "../src/parqueadero/espera.ts";
import type { Estado } from "../src/parqueadero/tipos.ts";

let estado: Estado = estadoInicial(ESCENARIO_INICIAL);
const paso = (comando: Comando) => {
  const r = ejecutar(estado, comando);
  console.log(`  ${r.ok ? "ok" : "NO"}  ${r.ok ? r.evento.detalle : r.motivo}`);
  if (r.ok) estado = r.estado;
};
const titulo = (t: string) => console.log(`\n== ${t}`);
const lineas = () => {
  const v = vistaLlegada(estado);
  console.log("  " + v.entradas.map((e) => `${e.nombre}: ${e.dentro}/${e.capacidad} adentro, ${e.afuera} afuera`).join(" | ") + ` | libres ${v.celdasLibres}/${v.celdasTotal}`);
};

titulo("Antes de registrarse (sin placas)");
lineas();
console.log(`  Regla: ${reglaDeReparto(estado)}`);
titulo("Cupos: ambos pasajes llenos, el siguiente espera afuera");
paso({ tipo: "registrarLlegada", placa: "MAT471", entrada: "las-vegas" });
lineas();
titulo("Estimación sin datos todavía");
console.log("  SVK088: " + textoEspera(estimarEspera(estado, "SVK088")));
titulo("Asignación: reserva en el mismo paso; otra entrada no puede tomarla");
paso({ tipo: "asignarCelda", entrada: "regional" });
paso({ tipo: "asignarCelda", entrada: "las-vegas" });
console.log("  CXM540: " + vistaConductor(estado, "CXM540").destino?.ruta);
titulo("Portería confirma placa y reserva antes de entrar");
paso({ tipo: "estacionar", placa: "CXM540" });
paso({ tipo: "confirmarIngreso", entrada: "regional", placa: "CXM540" });
paso({ tipo: "estacionar", placa: "CXM540" });
titulo("Liberación y el de afuera entra al pasaje");
paso({ tipo: "avanzarReloj", minutos: 3 });
paso({ tipo: "pagar", placa: "HKM214" });
paso({ tipo: "salir", placa: "HKM214" });
paso({ tipo: "asignarCelda", entrada: "las-vegas" });
lineas();
titulo("Reasignación: la celda asignada estaba ocupada");
paso({ tipo: "reportarCeldaOcupada", placa: "FRS112" });
console.log("  FRS112: " + vistaConductor(estado, "FRS112").aviso);
titulo("Salir sin parquear: conserva el puesto hasta la portería");
paso({ tipo: "salirSinParquear", placa: "NBD218" });
paso({ tipo: "asignarCelda", entrada: "regional" });
paso({ tipo: "dejarSalir", entrada: "regional" });
lineas();
titulo("Lote lleno: las filas se quedan y la estimación se mueve con los eventos");
paso({ tipo: "avanzarReloj", minutos: 4 });
paso({ tipo: "pagar", placa: "JRT508" });
paso({ tipo: "salir", placa: "JRT508" });
console.log("  SVK088: " + textoEspera(estimarEspera(estado, "SVK088")));
paso({ tipo: "asignarCelda", entrada: "las-vegas" });
console.log("  SVK088: " + textoEspera(estimarEspera(estado, "SVK088")));
lineas();
