import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ESTADO_CELDA, type EstadoCeldaUi } from "./estados";
import { Pastilla } from "./Pastilla";
import { distribuir, H, LOTE, PASILLO, PUERTAS, W } from "./distribuirLote";
import { PuestoCelda } from "./PuestoCelda";
import { ZoomMapa } from "./ZoomMapa";
import "./mapa.css";

const ZOOM_MAX = 2;

export interface CeldaMapa {
  id: string;
  zona: string;
  x: number;
  y: number;
  estado: EstadoCeldaUi;
  placa: string | null;
}

export interface EntradaMapa {
  id: string;
  codigo: string;
  nombre: string;
  capacidadPasaje: number;
  fila: string[];
}

interface Props {
  nombre: string;
  celdas: CeldaMapa[];
  entradas: EntradaMapa[];
  seleccion?: string | null;
  onSeleccionar?: (id: string) => void;
  /** A cell to zoom into, e.g. the driver's reserved or assigned cell. */
  enfoque?: string | null;
}

const pct = (valor: number, total: number) => `${(valor / total) * 100}%`;

/**
 * The EAFIT lot drawn like a seat map from the state: streets with their names, the lot and its aisle,
 * one stall per cell grouped by zone, and each entrance with the cars waiting in its passage.
 */
export function MapaLote({ nombre, celdas, entradas, seleccion, onSeleccionar, enfoque }: Props) {
  const [zoom, setZoom] = useState(1);
  const vista = useRef<HTMLDivElement>(null);
  const { puestos, zonas } = distribuir(celdas);
  const elegido = puestos.find((p) => p.celda.id === seleccion) ?? null;

  useEffect(() => {
    if (!enfoque) return;
    setZoom(ZOOM_MAX);
    const id = requestAnimationFrame(() =>
      vista.current?.querySelector(`[data-celda="${CSS.escape(enfoque)}"]`)?.scrollIntoView({ block: "center", inline: "center" }),
    );
    return () => cancelAnimationFrame(id);
  }, [enfoque]);

  return (
    <div className="ui-mapa" role="region" aria-label={`Mapa de ${nombre}`}>
      <div className="ui-mapa-vista" ref={vista}>
        <div className="ui-mapa-lote" style={{ "--proporcion": W / H, "--zoom": zoom } as CSSProperties}>
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="ui-mapa-trazo">
            <path d="M0 0 L350 0 L350 34 Q200 52 0 30 Z" className="ui-mapa-via" />
            <rect x="0" y="0" width="34" height="470" className="ui-mapa-via" />
            <rect x="316" y="0" width="34" height="470" className="ui-mapa-via" />
            <path d="M0 448 L350 412 L350 470 L0 470 Z" className="ui-mapa-via" />
            <path d="M260 470 C 280 380, 330 320, 350 300" className="ui-mapa-quebrada" />
            <g className="ui-mapa-calle">
              <text x="110" y="20">Av. Regional</text>
              <text transform="translate(21 360) rotate(-90)">Avenida Las Vegas</text>
              <text transform="translate(333 200) rotate(90)">Carrera 48</text>
              <text transform="translate(175 452) rotate(-6)">Calle 5 Sur</text>
            </g>
            <rect x={LOTE.x} y={LOTE.y} width={LOTE.w} height={LOTE.h} rx="18" className="ui-mapa-borde" />
            <rect x={PASILLO.x} y={LOTE.y + 6} width={PASILLO.w} height={LOTE.h - 12} rx="6" className="ui-mapa-pasillo" />
            {zonas.map((z) => (
              <text key={z.id} x={z.x + 2} y={z.y + 11} className="ui-mapa-zona">
                Zona {z.id}
              </text>
            ))}
          </svg>
          {entradas.slice(0, PUERTAS.length).map((entrada, i) => (
            <div
              key={entrada.id}
              className="ui-mapa-entrada"
              style={{ left: pct(PUERTAS[i].x, W), top: pct(PUERTAS[i].y, H) }}
              role="img"
              aria-label={`Entrada ${entrada.nombre}: ${entrada.fila.length} de ${entrada.capacidadPasaje} carros esperando en el pasaje`}
            >
              <span className="ui-mapa-codigo">{entrada.codigo}</span>
              <span className="ui-mapa-cuenta num">{entrada.fila.length}</span>
            </div>
          ))}
          {puestos.map((puesto) => (
            <PuestoCelda key={puesto.celda.id} puesto={puesto} elegido={puesto.celda.id === seleccion} onSeleccionar={onSeleccionar} />
          ))}
          {elegido && (
            <div className="ui-mapa-globo" style={{ left: pct(elegido.x + elegido.w / 2, W), top: pct(elegido.y, H) }} role="status">
              <strong className="num">{elegido.celda.id}</strong> · {ESTADO_CELDA[elegido.celda.estado].texto}
              {elegido.celda.placa && <span className="num"> · {elegido.celda.placa}</span>}
            </div>
          )}
        </div>
      </div>
      <ul className="ui-mapa-leyenda" aria-label="Leyenda">
        {Object.values(ESTADO_CELDA).map((meta) => (
          <li key={meta.texto}>
            <Pastilla {...meta} />
          </li>
        ))}
      </ul>
      <ZoomMapa zoom={zoom} max={ZOOM_MAX} onCambiar={setZoom} />
    </div>
  );
}
