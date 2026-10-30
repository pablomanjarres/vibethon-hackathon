import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Zap } from "lucide-react";
import type { EstadoCarro } from "../parqueadero/tipos";
import { href } from "../shared/route";
import { useEstado } from "./useTienda";
import "./acceso.css";

const ORDEN: EstadoCarro[] = ["en espera", "en fila", "con celda", "estacionado", "en devolución"];

/**
 * Presenter shortcut on every view: every plate and every valet with its access code, one click to
 * open that driver's or valet's screen already signed in (demo mode on).
 */
export function AccesoRapido() {
  const estado = useEstado();
  const [abierto, setAbierto] = useState(false);
  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierto]);
  const carros = Object.values(estado.carros)
    .filter((c) => c.estado !== "retirado")
    .sort((a, b) => ORDEN.indexOf(a.estado) - ORDEN.indexOf(b.estado));
  return (
    <>
      <button type="button" className="ui-acceso-boton" aria-expanded={abierto} aria-label="Acceso rápido a placas y valets" onClick={() => setAbierto(!abierto)}>
        <Zap size={19} strokeWidth={2} aria-hidden="true" />
      </button>
      {abierto &&
        createPortal(
        <section className="ui-acceso" aria-label="Acceso rápido">
          <header>
            <h2>Acceso rápido</h2>
            <button type="button" aria-label="Cerrar" onClick={() => setAbierto(false)}>
              <X size={18} aria-hidden="true" />
            </button>
          </header>
          <h3>Conductores</h3>
          <ul>
            {carros.map((c) => (
              <li key={c.placa}>
                <a href={href("conductor", { placa: c.placa, codigo: c.codigo, demo: "1" })} onClick={() => setAbierto(false)}>
                  <strong className="num">{c.placa}</strong>
                  <span className="num">{c.codigo}</span>
                  <small>{c.estado}</small>
                </a>
              </li>
            ))}
          </ul>
          {estado.entradas.map((entrada) => (
            <div key={entrada.id}>
              <h3>Valets · {entrada.nombre}</h3>
              <ul>
                {estado.valets
                  .filter((v) => v.entrada === entrada.id)
                  .map((v) => (
                    <li key={v.id}>
                      <a href={href("valet", { valet: v.id, codigo: v.codigo, demo: "1" })} onClick={() => setAbierto(false)}>
                        <strong>{v.id}</strong>
                        <span className="num">{v.codigo}</span>
                        <small>{v.estado}</small>
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>,
          document.body,
        )}
    </>
  );
}
