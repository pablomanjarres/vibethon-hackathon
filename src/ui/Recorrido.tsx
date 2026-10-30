import { ArrowLeft, ArrowRight, CheckCircle2, Circle, RotateCcw, Timer, X } from "lucide-react";
import { useEffect } from "react";
import { tienda } from "../parqueadero/tienda";
import type { Estado, EstadoServicio } from "../parqueadero/tipos";
import { href, useRoute } from "../shared/route";
import { useEstado } from "./useTienda";
import "./recorrido.css";

/** The car and valet the walkthrough follows (from the seed: first in Regional, and a Regional valet). */
const PLACA = "CXM540";
const VALET = "RG-V1";

const ORDEN: EstadoServicio[] = ["pago pendiente", "pagado", "ficho emitido", "en curso", "estacionado", "llaves en oficina", "entregado"];

function servicioDe(estado: Estado) {
  const id = estado.carros[PLACA]?.servicio;
  const s = id ? estado.servicios[id] : undefined;
  return s && !["rechazado", "vencido"].includes(s.estado) ? s : undefined;
}

/** True once the valet service of the followed car has reached `paso`. */
const llego = (estado: Estado, paso: EstadoServicio) => {
  const s = servicioDe(estado);
  return Boolean(s && ORDEN.indexOf(s.estado) >= ORDEN.indexOf(paso));
};

interface Paso {
  quien: string;
  vista: string;
  params: (estado: Estado) => Record<string, string>;
  texto: (estado: Estado) => string;
  hecho: (estado: Estado) => boolean;
}

const conductor = (estado: Estado) => ({ placa: PLACA, codigo: estado.carros[PLACA]?.codigo ?? "" });
const valet = (estado: Estado) => ({ valet: VALET, codigo: estado.valets.find((v) => v.id === VALET)?.codigo ?? "" });
const porteria = () => ({ entrada: "regional" });

/** One car from the line to its keys back, screen by screen. */
const PASOS: Paso[] = [
  { quien: "Conductor", vista: "conductor", params: conductor, texto: () => `Contrata a ${VALET} (Valet · 8000 COP).`, hecho: (e) => Boolean(servicioDe(e)) },
  { quien: "Conductor", vista: "conductor", params: conductor, texto: () => "Paga el valet (pago simulado aprobado).", hecho: (e) => llego(e, "pagado") },
  { quien: `Valet ${VALET}`, vista: "valet", params: valet, texto: () => "Ve al carro en el pasaje: pulsa el botón principal.", hecho: (e) => llego(e, "ficho emitido") },
  {
    quien: `Valet ${VALET}`,
    vista: "valet",
    params: valet,
    texto: (e) => `Confirma el ficho del conductor (${servicioDe(e)?.ficho ?? "F-…"}) y recibe las llaves. El conductor ya puede ir a clase.`,
    hecho: (e) => llego(e, "en curso"),
  },
  { quien: "Portería Regional", vista: "porteria", params: porteria, texto: (e) => (e.carros[PLACA]?.celda ? `La celda ${e.carros[PLACA]?.celda} se asignó sola: había una libre y era su turno.` : "La celda se asigna sola apenas haya una libre; si no hay, libera una desde las acciones rápidas."), hecho: (e) => Boolean(e.carros[PLACA]?.celda) },
  { quien: "Portería Regional", vista: "porteria", params: porteria, texto: () => `Confirma la entrada de ${PLACA} (placa y reserva).`, hecho: (e) => Boolean(e.carros[PLACA]?.confirmado) || llego(e, "estacionado") },
  { quien: `Valet ${VALET}`, vista: "valet", params: valet, texto: (e) => `Estaciona el carro en ${e.carros[PLACA]?.celda ?? "su celda"}.`, hecho: (e) => llego(e, "estacionado") },
  { quien: `Valet ${VALET}`, vista: "valet", params: valet, texto: () => "Deja las llaves en la oficina.", hecho: (e) => llego(e, "llaves en oficina") },
  { quien: "Oficina", vista: "oficina", params: () => ({}), texto: (e) => `Valida el ficho ${servicioDe(e)?.ficho ?? ""} y entrega las llaves.`, hecho: (e) => llego(e, "entregado") },
  { quien: "Conductor", vista: "conductor", params: conductor, texto: () => "Llaves de vuelta. Fin del recorrido.", hecho: (e) => llego(e, "entregado") },
];

/** The car the full-lot option shows: last in Regional, so it has the longest wait. */
const PLACA_ESPERA = "SVK088";

/**
 * Full-lot option: from the seed, the last free cell is handed out and three parked cars leave at
 * different minutes (each freed cell goes to the next car), so the lot ends full and the wait
 * estimate has real data. Returns the driver screen of a car at the back of the line.
 */
export function escenarioLoteLleno(): string {
  tienda.reiniciar();
  tienda.ejecutar({ tipo: "avanzarReloj", minutos: 1 });
  for (const [minutos, placa] of [[3, "HKM214"], [4, "JRT508"], [2, "DWN161"]] as const) {
    tienda.ejecutar({ tipo: "avanzarReloj", minutos });
    tienda.ejecutar({ tipo: "pagar", placa });
    tienda.ejecutar({ tipo: "salir", placa });
  }
  const estado = tienda.leer();
  return href("conductor", { placa: PLACA_ESPERA, codigo: estado.carros[PLACA_ESPERA]?.codigo ?? "", demo: "1" });
}

/** Link that starts the walkthrough at its first step. */
export function inicioRecorrido(estado: Estado): string {
  return href(PASOS[0].vista, { ...PASOS[0].params(estado), recorrido: "1" });
}

/**
 * Presenter bar for the guided walkthrough (only with ?recorrido=N): which step this is, who acts and
 * what to press, whether the engine already recorded it, and a link to the screen of the next step.
 */
export function Recorrido() {
  const estado = useEstado();
  const { path, params } = useRoute();
  const activo = params.has("recorrido");
  // The step shown is the first one the engine has not recorded yet, so the bar follows the real process.
  const pendiente = PASOS.findIndex((p) => !p.hecho(estado));
  const n = pendiente < 0 ? PASOS.length : pendiente + 1;
  const ir = (i: number) => href(PASOS[i - 1].vista, { ...PASOS[i - 1].params(estado), recorrido: String(i) });
  const destino = ir(n);
  // When the next step happens on another screen, go there on its own, a moment after the action.
  useEffect(() => {
    if (!activo || PASOS[n - 1].vista === path) return;
    const t = window.setTimeout(() => {
      window.location.hash = destino.replace(/^#/, "");
    }, 700);
    return () => window.clearTimeout(t);
  }, [activo, n, path, destino]);
  if (!activo) return null;
  const paso = PASOS[n - 1];
  const hecho = paso.hecho(estado);
  return (
    <aside className="ui-recorrido" aria-label="Recorrido guiado" data-hecho={hecho}>
      <p className="ui-recorrido-paso">
        Paso {n} de {PASOS.length} · <strong>{paso.quien}</strong>
      </p>
      <p className="ui-recorrido-texto">
        {hecho ? <CheckCircle2 size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}
        <span>{paso.texto(estado)}</span>
        <span className="ui-recorrido-estado">{hecho ? "Hecho" : "Pendiente"}</span>
      </p>
      <nav className="ui-recorrido-nav">
        {n > 1 && (
          <a href={ir(n - 1)}>
            <ArrowLeft size={16} aria-hidden="true" /> Anterior
          </a>
        )}
        {n < PASOS.length ? (
          <a href={ir(n + 1)} className="ui-recorrido-siguiente" aria-disabled={!hecho}>
            Siguiente: {PASOS[n].quien} <ArrowRight size={16} aria-hidden="true" />
          </a>
        ) : null}
        <button type="button" className="ui-recorrido-lleno" onClick={() => (window.location.hash = escenarioLoteLleno().replace(/^#/, ""))}>
          <Timer size={16} aria-hidden="true" /> Lote lleno y espera
        </button>
        <a href={inicioRecorrido(estado)} onClick={() => tienda.reiniciar()} aria-label="Empezar el recorrido de nuevo">
          <RotateCcw size={16} aria-hidden="true" /> De nuevo
        </a>
        <a href={href(paso.vista, paso.params(estado))} aria-label="Salir del recorrido">
          <X size={16} aria-hidden="true" />
        </a>
      </nav>
    </aside>
  );
}
