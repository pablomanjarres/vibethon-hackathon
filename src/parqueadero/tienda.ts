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

/** Top-level keys every saved Estado must carry before it is trusted. */
const CLAVES_ESTADO: (keyof Estado)[] = [
  "escenario", "inicio", "minuto", "reglas", "mapas", "entradas", "celdas",
  "carros", "valets", "servicios", "pagos", "bitacora", "consecutivos",
];

/** localStorage when the browser allows it; null in Node or when storage is blocked. */
function almacen(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}

/** The saved state for this scenario, or null when it is missing, broken or from another scenario. */
function cargar(clave: string, escenario: Escenario): Estado | null {
  try {
    const texto = almacen()?.getItem(clave);
    if (!texto) return null;
    const guardado: unknown = JSON.parse(texto);
    if (typeof guardado !== "object" || guardado === null) return null;
    const registro = guardado as Record<string, unknown>;
    if (registro.escenario !== escenario.id) return null;
    return CLAVES_ESTADO.every((k) => k in registro) ? (guardado as Estado) : null;
  } catch {
    return null;
  }
}

function guardar(clave: string, estado: Estado): void {
  try {
    almacen()?.setItem(clave, JSON.stringify(estado));
  } catch {
    // Full or blocked storage: keep working in memory.
  }
}

function borrar(clave: string): void {
  try {
    almacen()?.removeItem(clave);
  } catch {
    // Blocked storage: nothing saved to remove.
  }
}

/**
 * Store around the engine, saved in this browser's localStorage so a refresh keeps the state.
 * Nothing leaves the browser: no database, no network.
 */
export function crearTienda(escenario: Escenario = ESCENARIO_INICIAL): Tienda {
  const clave = `parqueadero:${escenario.id}`;
  let estado = cargar(clave, escenario) ?? estadoInicial(escenario);
  const oyentes = new Set<() => void>();
  const avisar = () => {
    for (const oyente of oyentes) oyente();
  };
  const publicar = (siguiente: Estado) => {
    estado = siguiente;
    guardar(clave, estado);
    avisar();
  };
  escucharOtrasPestanas(clave, escenario, (siguiente) => {
    estado = siguiente;
    avisar();
  });
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
    reiniciar() {
      borrar(clave);
      estado = estadoInicial(escenario);
      avisar();
    },
    simularHasta(minuto) {
      const { estado: siguiente, rechazos } = simularHasta(estado, escenario, minuto);
      publicar(siguiente);
      return rechazos;
    },
  };
}

/**
 * Another tab of this browser saved or cleared the state: take it as ours. A removed key (or a
 * cleared storage) means a reset to the seed; a broken or foreign value is ignored.
 */
function escucharOtrasPestanas(clave: string, escenario: Escenario, aplicar: (estado: Estado) => void): void {
  if (typeof window === "undefined") return;
  window.addEventListener("storage", (evento) => {
    if (evento.key !== null && evento.key !== clave) return;
    if (evento.storageArea !== almacen()) return;
    if (evento.key === null || evento.newValue === null) return aplicar(estadoInicial(escenario));
    const guardado = cargar(clave, escenario);
    if (guardado) aplicar(guardado);
  });
}

/** The one store all four views share, so the driver, gate, valet and office screens never disagree. */
export const tienda = crearTienda();
