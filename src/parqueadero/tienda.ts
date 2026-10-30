import { estadoInicial, type Escenario } from "./escenario.ts";
import { ESCENARIO_INICIAL } from "./escenarios/index.ts";
import { ejecutar, type Comando, type Resultado } from "./motor.ts";
import { simularHasta } from "./simulacion.ts";
import type { Estado } from "./tipos.ts";

export interface Tienda {
  leer(): Estado;
  ejecutar(comando: Comando): Resultado;
  /** For React: useSyncExternalStore(tienda.suscribir, tienda.leer). */
  suscribir(oyente: () => void): () => void;
  /** Back to the scenario's starting state. */
  reiniciar(): void;
  /** Runs the scenario's simulated events up to a minute; returns the reasons for any it rejected. */
  simularHasta(minuto: number): string[];
}

/** In-memory store around the engine. Nothing leaves the browser: no database, no network. */
export function crearTienda(escenario: Escenario = ESCENARIO_INICIAL): Tienda {
  let estado = estadoInicial(escenario);
  const oyentes = new Set<() => void>();
  const publicar = (siguiente: Estado) => {
    estado = siguiente;
    for (const oyente of oyentes) oyente();
  };
  return {
    leer: () => estado,
    ejecutar(comando) {
      const resultado = ejecutar(estado, comando);
      if (resultado.ok) publicar(resultado.estado);
      return resultado;
    },
    suscribir(oyente) {
      oyentes.add(oyente);
      return () => {
        oyentes.delete(oyente);
      };
    },
    reiniciar: () => publicar(estadoInicial(escenario)),
    simularHasta(minuto) {
      const { estado: siguiente, rechazos } = simularHasta(estado, escenario, minuto);
      publicar(siguiente);
      return rechazos;
    },
  };
}

/** The one store all four views share, so the driver, gate, valet and office screens never disagree. */
export const tienda = crearTienda();
