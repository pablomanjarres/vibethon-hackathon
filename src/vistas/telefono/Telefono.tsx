import { useEffect } from "react";
import { hora } from "../../parqueadero/lecturas/formato";
import type { EstadoCarro } from "../../parqueadero/tipos";
import { href, useRoute } from "../../shared/route";
import { Chips } from "../../ui/Chips";
import { useEstado } from "../../ui/useTienda";
import { Dispositivo } from "./Dispositivo";
import { Ingreso } from "./Ingreso";
import { PantallaConductor } from "./PantallaConductor";
import "../../ui/tokens.css";
import "../../ui/texto.css";
import "./telefono.css";
import "./hoja.css";

/** Plate groups for the presenter, in the order a car goes through the lot. */
const GRUPOS: { estado: EstadoCarro; nombre: string }[] = [
  { estado: "en espera", nombre: "En espera" },
  { estado: "en fila", nombre: "En fila" },
  { estado: "con celda", nombre: "Con celda" },
  { estado: "estacionado", nombre: "Estacionados" },
  { estado: "en devolución", nombre: "Saliendo" },
];

/**
 * The driver app as it looks on a phone (#/telefono?placa=CXM540&codigo=5975). It follows the lot
 * live, including what the gate, valet and office do in other tabs, and never sends a command.
 * Beside the phone, the presenter signs in as any car in the lot.
 */
export default function Telefono() {
  const estado = useEstado();
  const { params } = useRoute();
  const placa = params.get("placa")?.toUpperCase() ?? "";
  const codigo = params.get("codigo") ?? "";
  const enLote = Object.values(estado.carros).filter((c) => c.estado !== "retirado");

  useEffect(() => {
    document.title = "Teléfono del conductor · Parqueadero EAFIT";
  }, []);

  return (
    <div className="tl-escena">
      <Dispositivo hora={hora(estado.inicio, estado.minuto)}>
        {placa ? <PantallaConductor estado={estado} placa={placa} codigo={codigo} /> : <Ingreso />}
      </Dispositivo>
      <aside className="tl-presentador" aria-label="Entrar como otro conductor">
        <h1 className="tl-presentador-titulo">Teléfono del conductor</h1>
        <p className="ui-texto-suave">
          Así ve la app un conductor. Toca una placa para entrar con su código; la pantalla cambia sola cuando la portería, el valet o la oficina actúan.
        </p>
        {GRUPOS.map(({ estado: grupo, nombre }) => {
          const carros = enLote.filter((c) => c.estado === grupo);
          return (
            carros.length > 0 && (
              <section key={grupo} className="tl-grupo">
                <h2>
                  {nombre} <span className="num">{carros.length}</span>
                </h2>
                <Chips
                  etiqueta={`Entrar como: ${nombre}`}
                  chips={carros.map((c) => ({
                    id: c.placa,
                    texto: (
                      <span className="num">
                        {c.placa} <span className="tl-chip-codigo">{c.codigo}</span>
                      </span>
                    ),
                    href: href("telefono", { placa: c.placa, codigo: c.codigo }),
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
