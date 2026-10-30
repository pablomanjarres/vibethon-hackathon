import { useEffect, useRef } from "react";
import type { EstadoCarro } from "../../parqueadero/tipos";
import { href, useRoute } from "../../shared/route";
import { Chips } from "../../ui/Chips";
import { Reloj } from "../../ui/Reloj";
import { useEstado } from "../../ui/useTienda";
import { PantallaConductor } from "./PantallaConductor";
import "../../ui/tokens.css";
import "../../ui/texto.css";
import "./telefono.css";

/** Plate groups for the presenter, in the order a car goes through the lot. */
const GRUPOS: { estado: EstadoCarro; nombre: string }[] = [
  { estado: "en fila", nombre: "En fila" },
  { estado: "con celda", nombre: "Con celda" },
  { estado: "estacionado", nombre: "Estacionados" },
  { estado: "en devolución", nombre: "Saliendo" },
];

/**
 * How the driver app looks on a phone, for one plate (#/telefono?placa=SVK088). It follows the lot
 * live, including what the gate, valet and office do in other tabs, and never sends a command.
 */
export default function Telefono() {
  const estado = useEstado();
  const { params } = useRoute();
  const pedida = params.get("placa")?.toUpperCase() ?? "";
  const enLote = Object.values(estado.carros).filter((c) => c.estado !== "retirado");
  const placa = estado.carros[pedida] ? pedida : (estado.entradas.find((e) => e.fila.length > 0)?.fila[0] ?? enLote[0]?.placa ?? pedida);

  useEffect(() => {
    document.title = `Teléfono de ${placa} · Parqueadero EAFIT`;
  }, [placa]);

  // The map zooms to the driver's cell with scrollIntoView on the next frame, which would also
  // scroll the phone screen. Put the screen back where it was right after.
  const pantalla = useRef<HTMLDivElement>(null);
  const celda = estado.carros[placa]?.celda ?? null;
  useEffect(() => {
    const arriba = pantalla.current?.scrollTop ?? 0;
    const ventana = window.scrollY;
    const id = requestAnimationFrame(() => {
      if (pantalla.current) pantalla.current.scrollTop = arriba;
      window.scrollTo({ top: ventana });
    });
    return () => cancelAnimationFrame(id);
  }, [placa, celda]);

  return (
    <div className="tl-escena">
      <div className="tl-marco">
        <div className="tl-pantalla" ref={pantalla}>
          <div className="tl-estado">
            <span className="tl-vivo">
              <span className="tl-punto" aria-hidden="true" /> En vivo
            </span>
            <Reloj />
          </div>
          {placa ? <PantallaConductor estado={estado} placa={placa} /> : <p className="tl-seccion ui-texto-suave">No hay carros en el lote.</p>}
        </div>
      </div>
      <aside className="tl-presentador" aria-label="Elegir el teléfono de otro conductor">
        <h1 className="tl-presentador-titulo">Teléfono del conductor</h1>
        <p className="ui-texto-suave">Elige una placa. La pantalla cambia sola cuando la portería, el valet o la oficina actúan.</p>
        {GRUPOS.map(({ estado: grupo, nombre }) => {
          const placas = enLote.filter((c) => c.estado === grupo);
          return (
            placas.length > 0 && (
              <section key={grupo} className="tl-grupo">
                <h2>
                  {nombre} <span className="num">{placas.length}</span>
                </h2>
                <Chips
                  etiqueta={`Placas: ${nombre}`}
                  chips={placas.map((c) => ({
                    id: c.placa,
                    texto: <span className="num">{c.placa}</span>,
                    href: href("telefono", { placa: c.placa }),
                    actual: c.placa === placa,
                  }))}
                />
              </section>
            )
          );
        })}
      </aside>
    </div>
  );
}
