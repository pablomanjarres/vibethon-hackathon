import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, Zap } from "lucide-react";
import { vistaPorteria } from "../parqueadero/lecturas/porteria";
import type { Comando } from "../parqueadero/motor";
import type { Estado, EstadoCarro } from "../parqueadero/tipos";
import { href } from "../shared/route";
import type { VistaId } from "./Shell";
import { useComando, useEstado } from "./useTienda";
import "./acceso.css";

const ORDEN: EstadoCarro[] = ["en espera", "en fila", "con celda", "estacionado", "en devolución"];

interface Fila {
  clave: string;
  titulo: string;
  dato?: string;
  nota: string;
  /** A link that opens a screen already signed in, or a command sent right here. */
  ir?: string;
  comando?: Comando;
}

/** The quick actions of each view: sign in fast on the driver and valet phones; act fast at the gate and the office. */
function filasDe(vista: VistaId, estado: Estado): { titulo: string; filas: Fila[] }[] {
  if (vista === "conductor") {
    const carros = Object.values(estado.carros)
      .filter((c) => c.estado !== "retirado")
      .sort((a, b) => ORDEN.indexOf(a.estado) - ORDEN.indexOf(b.estado));
    return [{ titulo: "Entrar como conductor", filas: carros.map((c) => ({ clave: c.placa, titulo: c.placa, dato: c.codigo, nota: c.estado, ir: href("conductor", { placa: c.placa, codigo: c.codigo, demo: "1" }) })) }];
  }
  if (vista === "valet") {
    return estado.entradas.map((e) => ({
      titulo: `Entrar como valet · ${e.nombre}`,
      filas: estado.valets
        .filter((v) => v.entrada === e.id)
        .map((v) => ({ clave: v.id, titulo: v.id, dato: v.codigo, nota: v.estado, ir: href("valet", { valet: v.id, codigo: v.codigo, demo: "1" }) })),
    }));
  }
  if (vista === "porteria") {
    return estado.entradas.map((e) => {
      const p = vistaPorteria(estado, e.id);
      const filas: Fila[] = p.porConfirmar.map((c) => ({
        clave: `c-${c.placa}`,
        titulo: `Confirmar ${c.placa}`,
        dato: c.celda,
        nota: "placa y reserva",
        comando: { tipo: "confirmarIngreso", entrada: e.id, placa: c.placa },
      }));
      if (p.puedeAsignar) filas.unshift({ clave: `a-${e.id}`, titulo: "Asignar celda", dato: p.celdasLibres[0], nota: p.turno, comando: { tipo: "asignarCelda", entrada: e.id } });
      if (p.puedeDejarSalir) filas.unshift({ clave: `s-${e.id}`, titulo: "Dejar salir", dato: p.fila[0]?.placa, nota: "sale sin parquear", comando: { tipo: "dejarSalir", entrada: e.id } });
      return { titulo: `Portería ${e.nombre}`, filas };
    });
  }
  if (vista === "oficina") {
    const servicios = Object.values(estado.servicios);
    return [
      {
        titulo: "Recibir llaves del valet",
        filas: servicios
          .filter((s) => s.estado === "estacionado")
          .map((s) => ({ clave: `r-${s.id}`, titulo: s.placa, dato: s.ficho, nota: `${s.valet} trae las llaves`, comando: { tipo: "dejarLlaves", ficho: s.ficho } })),
      },
      {
        titulo: "Entregar llaves con el ficho",
        filas: servicios
          .filter((s) => s.estado === "llaves en oficina")
          .map((s) => ({ clave: `e-${s.id}`, titulo: s.placa, dato: s.ficho, nota: "llaves en la oficina", comando: { tipo: "reclamarLlaves", ficho: s.ficho } })),
      },
    ];
  }
  return [];
}

/** Quick actions for the presenter, specific to the view on screen (hidden where a view has none). */
export function AccesoRapido({ vista }: { vista?: VistaId }) {
  const estado = useEstado();
  const { aviso, enviar } = useComando();
  const [abierto, setAbierto] = useState(false);
  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierto]);
  if (!vista) return null;
  const grupos = filasDe(vista, estado);
  const fila = (f: Fila): ReactNode => {
    const contenido = (
      <>
        <strong className="num">{f.titulo}</strong>
        {f.dato && <span className="num">{f.dato}</span>}
        <small>{f.nota}</small>
      </>
    );
    return f.ir ? (
      <a href={f.ir} onClick={() => setAbierto(false)}>
        {contenido}
      </a>
    ) : (
      <button type="button" onClick={() => f.comando && enviar(f.comando)}>
        {contenido}
      </button>
    );
  };
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
          </section>,
          document.body,
        )}
    </>
  );
}
