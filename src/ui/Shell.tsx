import { useEffect, type ReactNode } from "react";
import { Building2, Car, House, KeyRound, ShieldCheck, type LucideIcon } from "lucide-react";
import { href } from "../shared/route";
import { MapaLote } from "./MapaLote";
import { AccesoRapido } from "./AccesoRapido";
import { Recorrido } from "./Recorrido";
import { Reloj } from "./Reloj";
import { useEstado } from "./useTienda";
import "./tokens.css";
import "./shell.css";
import "./texto.css";

export type VistaId = "conductor" | "porteria" | "valet" | "oficina";

/** The four views, one shared state. Order here is the order in the top-right stack. */
export const VISTAS: { id: VistaId; nombre: string; Icono: LucideIcon }[] = [
  { id: "conductor", nombre: "Conductor", Icono: Car },
  { id: "porteria", nombre: "Portería", Icono: ShieldCheck },
  { id: "valet", nombre: "Valet", Icono: KeyRound },
  { id: "oficina", nombre: "Oficina", Icono: Building2 },
];

const PILA = [{ id: "", nombre: "Inicio", Icono: House }, ...VISTAS];

interface Props {
  /** The open view; none on the entry page. */
  vista?: VistaId;
  /** The pin selected on the map, which drives the panel. */
  seleccion?: string | null;
  onSeleccionar?: (celda: string) => void;
  /** A cell the map zooms into, such as the driver's own. */
  enfoque?: string | null;
  /** Driver views: the map never shows other people's plates. */
  privado?: boolean;
  /** Panel content: header, tiles, chips, card and sections. */
  children: ReactNode;
}

/** Map-first frame shared by every page: the lot behind, the floating panel, the view stack. */
export function Shell({ vista, seleccion = null, onSeleccionar, enfoque, privado = false, children }: Props) {
  const estado = useEstado();
  const nombre = VISTAS.find((item) => item.id === vista)?.nombre;
  useEffect(() => {
    document.title = nombre ? `${nombre} · Parqueadero EAFIT` : "Parqueadero EAFIT";
  }, [nombre]);
  const mapa = estado.mapas[0];
  return (
    <div className="ui-app" data-vista={vista}>
      <div className="ui-capa-mapa">
        {mapa && (
          <MapaLote
            nombre={mapa.nombre}
            celdas={estado.celdas.filter((c) => c.mapa === mapa.id).map((c) => (privado ? { ...c, placa: null } : c))}
            entradas={estado.entradas}
            seleccion={seleccion}
            onSeleccionar={onSeleccionar}
            enfoque={enfoque}
          />
        )}
      </div>
      <main className="ui-panel">
        <div className="ui-panel-contenido">{children}</div>
      </main>
      <nav className="ui-pila" aria-label="Vistas">
        <ul>
          {PILA.map(({ id, nombre: etiqueta, Icono }) => (
            <li key={id}>
              <a href={href(id)} aria-label={etiqueta} aria-current={id === (vista ?? "") ? "page" : undefined}>
                <Icono size={19} strokeWidth={2} aria-hidden="true" />
              </a>
              <span className="ui-pila-etiqueta" aria-hidden="true">
                {etiqueta}
              </span>
            </li>
          ))}
        </ul>
        <AccesoRapido vista={vista} />
        <Reloj />
      </nav>
      <Recorrido />
    </div>
  );
}
