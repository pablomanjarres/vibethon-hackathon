import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, Zap } from "lucide-react";
import { vistaPorteria } from "../parqueadero/lecturas/porteria";
import type { Comando } from "../parqueadero/motor";
import type { Estado, EstadoCarro } from "../parqueadero/tipos";
import { href } from "../shared/route";
import type { VistaId } from "./Shell";
import { useComando, useEstado } from "./useTienda";
import { tienda } from "../parqueadero/tienda";
import { ESCENARIO_INICIAL } from "../parqueadero/escenarios/index.ts";
import { escenarioLoteLleno, inicioRecorrido } from "./Recorrido";
import "./acceso.css";

/** What "start over" brings back, read from the scenario file so it never drifts from it. */
const SEMILLA = (() => {
  const esc = ESCENARIO_INICIAL;
  const celdas = esc.mapas.flatMap((m) => m.celdas);
  const libres = celdas.filter((c) => c.estado === "libre").map((c) => c.id);
  const filas = esc.entradas.map((e) => `${e.fila.length} en ${e.nombre}`).join(" y ");
  const valets = esc.entradas.reduce((n, e) => n + e.valets, 0);
  return `reloj ${esc.inicio}, ${filas}, libre ${libres.join(", ") || "ninguna"}, ${valets} valets disponibles; en todas las pestañas`;
})();

const ORDEN: EstadoCarro[] = ["en espera", "en fila", "con celda", "estacionado", "en devolución"];

interface Fila {
  clave: string;
  titulo: string;
  dato?: string;
  nota: string;
  /** A link that opens a screen already signed in, or a command sent right here. */
  ir?: string;
  /** Runs before following the link or sending the commands, e.g. resetting the lot. */
  antes?: () => void;
  /** After the commands succeed, go here (read from the updated state). */
  luego?: (estado: Estado) => string;
  /** Commands sent in order; stops at the first rejection. */
  comandos?: Comando[];
}

/** The quick actions of each view: sign in fast on the driver and valet phones; act fast at the gate and the office. */
function filasDe(vista: VistaId, estado: Estado, ruta: string): { titulo: string; filas: Fila[] }[] {
  if (vista === "conductor") {
    // Every car that came in through a gate (the cars already in the lot at the start are left out).
    const carros = Object.values(estado.carros)
      .filter((c) => c.estado !== "retirado" && c.entrada)
      .sort((a, b) => ORDEN.indexOf(a.estado) - ORDEN.indexOf(b.estado));
    const usadas = new Set(Object.keys(estado.carros));
    let n = 1;
    const nuevas: Fila[] = estado.entradas.map((e) => {
      while (usadas.has(`PRU${String(n).padStart(3, "0")}`)) n += 1;
      const placa = `PRU${String(n).padStart(3, "0")}`;
      usadas.add(placa);
      return {
        clave: `nueva-${e.id}`,
        titulo: `Nueva placa de prueba: ${placa}`,
        nota: `se registra en ${e.nombre} y entras con ella`,
        comandos: [{ tipo: "registrarLlegada", placa, entrada: e.id }],
        luego: (actual: Estado) => href(ruta, { placa, codigo: actual.carros[placa]?.codigo ?? "", demo: "1" }),
      };
    });
    return [
      { titulo: "Registrar un carro nuevo", filas: nuevas },
      { titulo: "Entrar como conductor", filas: carros.map((c) => ({ clave: c.placa, titulo: c.placa, dato: c.codigo, nota: c.estado, ir: href(ruta, { placa: c.placa, codigo: c.codigo, demo: "1" }) })) },
    ];
  }
  if (vista === "valet") {
    // Demo: when the lot is full, a parked car without a valet in progress leaves so a cell frees up.
    const activosValet = ["pago pendiente", "pagado", "ficho emitido", "en curso", "estacionado", "llaves en oficina"];
    const sale = Object.values(estado.carros).find(
      (c) => c.estado === "estacionado" && (!c.servicio || !activosValet.includes(estado.servicios[c.servicio]?.estado)),
    );
    const liberar: Fila[] =
      sale && !estado.celdas.some((c) => c.estado === "libre")
        ? [
            {
              clave: "valet-liberar",
              titulo: `Liberar ${sale.celda}`,
              dato: sale.placa,
              nota: "lote lleno: sale un carro y la celda se asigna sola",
              comandos: [...(sale.pagado ? [] : [{ tipo: "pagar", placa: sale.placa } as Comando]), { tipo: "salir", placa: sale.placa }],
            },
          ]
        : [];
    // Demo: give a free valet the first car of their entrance that has no valet, already paid.
    const asignar: Fila[] = estado.entradas.flatMap((e) => {
      const valet = estado.valets.find((v) => v.entrada === e.id && v.estado === "disponible");
      const placa = e.fila.find((p) => {
        const s = estado.carros[p].servicio;
        return !s || ["rechazado", "vencido"].includes(estado.servicios[s]?.estado);
      });
      if (!valet || !placa) return [];
      const servicio = `S-${estado.consecutivos.servicio + 1}`;
      return [
        {
          clave: `asignar-${e.id}`,
          titulo: `Asignar ${placa} a ${valet.id}`,
          dato: `${estado.reglas.tarifaValet}`,
          nota: `${e.nombre} · pago aprobado`,
          comandos: [
            { tipo: "contratarValet", placa, valet: valet.id },
            { tipo: "pagarValet", servicio, aprobado: true },
          ],
        },
      ];
    });
    return [{ titulo: "Lote", filas: liberar }, { titulo: "Asignar un carro a un valet", filas: asignar }, ...estado.entradas.map((e) => ({
      titulo: `Entrar como valet · ${e.nombre}`,
      // Valets at work, plus the first free one of the entrance.
      filas: estado.valets
        .filter((v) => v.entrada === e.id)
        .filter((v, _, todos) => v.estado !== "disponible" || v === todos.find((x) => x.estado === "disponible"))
        .map((v) => ({ clave: v.id, titulo: v.id, dato: v.codigo, nota: v.estado, ir: href(ruta === "telefono" ? "telefono" : "valet", { valet: v.id, codigo: v.codigo, demo: "1" }) })),
    }))];
  }
  if (vista === "porteria") {
    // Free a cell on demand: a parked car with no valet service in progress pays and leaves.
    const activos = ["pago pendiente", "pagado", "ficho emitido", "en curso", "estacionado", "llaves en oficina"];
    const saliente = Object.values(estado.carros).find(
      (c) => c.estado === "estacionado" && (!c.servicio || !activos.includes(estado.servicios[c.servicio]?.estado)),
    );
    const libres = estado.celdas.filter((c) => c.estado === "libre").length;
    const lote: Fila[] = saliente
      ? [
          {
            clave: "liberar",
            titulo: `Liberar ${saliente.celda}`,
            dato: saliente.placa,
            nota: `${saliente.placa} paga y sale · libres ahora: ${libres}`,
            comandos: [...(saliente.pagado ? [] : [{ tipo: "pagar", placa: saliente.placa } as Comando]), { tipo: "salir", placa: saliente.placa }],
          },
        ]
      : [];
    return [{ titulo: "Lote", filas: lote }, ...estado.entradas.map((e) => {
      const p = vistaPorteria(estado, e.id);
      const filas: Fila[] = p.porConfirmar.map((c) => ({
        clave: `c-${c.placa}`,
        titulo: `Confirmar ${c.placa}`,
        dato: c.celda,
        nota: "placa y reserva",
        comandos: [{ tipo: "confirmarIngreso", entrada: e.id, placa: c.placa }],
      }));
      if (p.puedeAsignar) filas.unshift({ clave: `a-${e.id}`, titulo: "Asignar celda", dato: p.celdasLibres[0], nota: p.turno, comandos: [{ tipo: "asignarCelda", entrada: e.id }] });
      if (p.puedeDejarSalir) filas.unshift({ clave: `s-${e.id}`, titulo: "Dejar salir", dato: p.fila[0]?.placa, nota: "sale sin parquear", comandos: [{ tipo: "dejarSalir", entrada: e.id }] });
      return { titulo: `Portería ${e.nombre}`, filas };
    })];
  }
  if (vista === "oficina") {
    const servicios = Object.values(estado.servicios);
    return [
      {
        titulo: "Recibir llaves del valet",
        filas: servicios
          .filter((s) => s.estado === "estacionado")
          .map((s) => ({ clave: `r-${s.id}`, titulo: s.placa, dato: s.ficho, nota: `${s.valet} trae las llaves`, comandos: [{ tipo: "dejarLlaves", ficho: s.ficho }] })),
      },
      {
        titulo: "Entregar llaves con el ficho",
        filas: servicios
          .filter((s) => s.estado === "llaves en oficina")
          .map((s) => ({ clave: `e-${s.id}`, titulo: s.placa, dato: s.ficho, nota: "llaves en la oficina", comandos: [{ tipo: "reclamarLlaves", ficho: s.ficho }] })),
      },
    ];
  }
  return [];
}

/** Quick actions for the presenter, specific to the view on screen (hidden where a view has none). */
export function AccesoRapido({ vista }: { vista?: VistaId }) {
  const [abierto, setAbierto] = useState(false);
  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierto]);
  if (!vista) return null;
  return (
    <>
      <button type="button" className="ui-acceso-boton" aria-expanded={abierto} aria-label="Acciones rápidas de esta vista" onClick={() => setAbierto(!abierto)}>
        <Zap size={19} strokeWidth={2} aria-hidden="true" />
      </button>
      {abierto &&
        createPortal(
          <section className="ui-acceso" aria-label="Acciones rápidas">
            <header>
              <h2>Acciones rápidas</h2>
              <button type="button" aria-label="Cerrar" onClick={() => setAbierto(false)}>
                <X size={18} aria-hidden="true" />
              </button>
            </header>
            <ListaAccesos vista={vista} onIr={() => setAbierto(false)} />
          </section>,
          document.body,
        )}
    </>
  );
}

/** The quick-action groups of a view (`comunes`: with the walkthrough group); `ruta` is the screen the sign-in links open (the phone opens its own). */
export function ListaAccesos({ vista, ruta = vista, comunes = true, onIr }: { vista: VistaId; ruta?: string; comunes?: boolean; onIr?: () => void }) {
  const estado = useEstado();
  const { aviso, enviar } = useComando();
  const grupos = [
    {
      titulo: "Empezar de cero",
      filas: [
        {
          clave: "semilla",
          titulo: "Volver al estado fijo de prueba",
          nota: SEMILLA,
          antes: () => tienda.reiniciar(),
          comandos: [],
        },
      ],
    },
    ...(comunes ? [{ titulo: "Recorrido guiado", filas: [{ clave: "recorrido", titulo: "Seguir un carro de la fila a las llaves", nota: "empieza desde la semilla: conductor → valet → portería → oficina", ir: inicioRecorrido(estado, ruta === "telefono"), antes: () => tienda.reiniciar() }, { clave: "lleno", titulo: "Lote lleno y tiempo estimado", nota: "llena el lote, salen 3 carros y abre a SVK088 con su espera", comandos: [], luego: () => escenarioLoteLleno(ruta === "telefono") }] }] : []),
    ...filasDe(vista, estado, ruta),
  ];
  const fila = (f: Fila): ReactNode => {
    const contenido = (
      <>
        <strong className="num">{f.titulo}</strong>
        {f.dato && <span className="num">{f.dato}</span>}
        <small>{f.nota}</small>
      </>
    );
    return f.ir ? (
      <a
        href={f.ir}
        onClick={() => {
          f.antes?.();
          onIr?.();
        }}
      >
        {contenido}
      </a>
    ) : (
      <button
        type="button"
        onClick={() => {
          f.antes?.();
          if (!(f.comandos ?? []).every((c) => enviar(c))) return;
          if (f.luego) window.location.hash = f.luego(tienda.leer()).replace(/^#/, "");
          // Close after a jump, or after a plain reset; command rows stay open to send the next one.
          if (f.luego || !f.comandos?.length) onIr?.();
        }}
      >
        {contenido}
      </button>
    );
  };
  return (
    <>
      {aviso && (
        <p className={aviso.ok ? "ui-acceso-ok" : "ui-acceso-error"} role="status">
          {aviso.texto}
        </p>
      )}
      {grupos.map((g) => (
        <div key={g.titulo}>
          <h3>{g.titulo}</h3>
          {g.filas.length ? (
            <ul>
              {g.filas.map((f) => (
                <li key={f.clave}>{fila(f)}</li>
              ))}
            </ul>
          ) : (
            <p className="ui-acceso-vacio">Nada por hacer ahora.</p>
          )}
        </div>
      ))}
    </>
  );
}
