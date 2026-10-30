// Prints the starting snapshot of the active scenario: the lot, both passages, whose turn it is, valets.
// usage: npm run foto
import { estadoInicial } from "../src/parqueadero/escenario.ts";
import { ESCENARIO_INICIAL } from "../src/parqueadero/escenarios/index.ts";
import { vistaOficina } from "../src/parqueadero/lecturas/oficina.ts";
import { vistaPorteria } from "../src/parqueadero/lecturas/porteria.ts";

const estado = estadoInicial(ESCENARIO_INICIAL);
const oficina = vistaOficina(estado);

console.log(`Escenario "${ESCENARIO_INICIAL.nombre}" (${estado.escenario}), ${oficina.hora}, minuto ${estado.minuto}`);
for (const mapa of oficina.mapas) {
  const { libre, reservada, ocupada } = oficina.celdas;
  console.log(`\n${mapa.nombre}: ${libre} libre, ${reservada} reservadas, ${ocupada} ocupadas`);
  for (let y = 1; y <= mapa.filas; y++) {
    const fila = mapa.celdas.filter((c) => c.y === y).sort((a, b) => a.x - b.x);
    console.log("  " + fila.map((c) => `${c.id} ${c.estado.padEnd(9)}`).join(" "));
  }
}
for (const entrada of estado.entradas) {
  const p = vistaPorteria(estado, entrada.id);
  console.log(`\nPortería ${p.nombre}: pasaje ${p.pasaje.ocupados}/${p.pasaje.capacidad}, ${p.valetsDisponibles} valets disponibles`);
  console.log(`  ${p.turno}`);
  console.log("  " + p.fila.map((c) => `${c.placa} (llegó ${c.llego}, espera ~${c.esperaMinutos} min)`).join("\n  "));
}
console.log("\nCódigos de acceso de los carros en los pasajes (solo para la demo):");
for (const entrada of estado.entradas) console.log("  " + entrada.fila.map((p) => `${p} ${estado.carros[p].codigo}`).join(", "));
console.log("\nCódigos de los valets (solo para la demo):");
for (const entrada of estado.entradas) console.log("  " + estado.valets.filter((v) => v.entrada === entrada.id).map((v) => `${v.id} ${v.codigo}`).join(", "));
console.log(`\nPagos: ${oficina.pagos.cantidad}. Fichos activos: ${oficina.fichosActivos.length}. Eventos simulados: ${ESCENARIO_INICIAL.eventos.length}.`);
