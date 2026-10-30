import type { EstadoCarro, Estado } from "../../parqueadero/tipos";
import { href } from "../../shared/route";
import { Chips } from "../../ui/Chips";
import "./selector.css";

/** Plate groups for the presenter, in the order a car goes through the lot. */
const GRUPOS: { estado: EstadoCarro; nombre: string }[] = [
  { estado: "en espera", nombre: "En espera" },
  { estado: "en fila", nombre: "En fila" },
  { estado: "con celda", nombre: "Con celda" },
  { estado: "estacionado", nombre: "Estacionados" },
  { estado: "en devolución", nombre: "Saliendo" },
];

interface Props {
  estado: Estado;
  /** Route each plate opens, e.g. "telefono" or "conductor". */
  vista: string;
  /** The plate signed in now, marked as current. */
  actual: string;
  /** Extra URL params kept on every link, e.g. the demo flag. */
  extra?: Record<string, string>;
}

/** Every car in the lot grouped by state, each a link that signs in with its plate and access code. */
export function SelectorPlacas({ estado, vista, actual, extra }: Props) {
  const enLote = Object.values(estado.carros).filter((c) => c.estado !== "retirado");
  return GRUPOS.map(({ estado: grupo, nombre }) => {
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
              href: href(vista, { ...extra, placa: c.placa, codigo: c.codigo }),
              actual: c.placa === actual,
            }))}
          />
        </section>
      )
    );
  });
}
