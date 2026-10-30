import { useState, type KeyboardEvent } from "react";
import { DoorOpen, Minus, Plus } from "lucide-react";
import { ESTADO_CELDA, type EstadoCeldaUi } from "./estados";
import { Pastilla } from "./Pastilla";
import "./mapa.css";

export interface CeldaMapa {
  id: string;
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
  columnas: number;
  filas: number;
  celdas: CeldaMapa[];
  entradas: EntradaMapa[];
  seleccion?: string | null;
  onSeleccionar?: (id: string) => void;
}

// Drawing units; the SVG scales to its container through the viewBox.
const CELDA_W = 72;
const CELDA_H = 96;
const HUECO = 8;
const CARRIL = 56;
const MARGEN = 24;
const PUESTO_W = 52;
const PUESTO_H = 40;
const PASAJE_H = 132;

/**
 * The EAFIT lot drawn from the scenario: cells at their (x, y), and below them each entrance with
 * its passage slots. Nothing outside the lot is drawn and zoom stays inside this frame.
 */
export function MapaLote({ nombre, columnas, filas, celdas, entradas, seleccion, onSeleccionar }: Props) {
  const [zoom, setZoom] = useState(1);
  const loteW = columnas * (CELDA_W + HUECO) - HUECO;
  const loteH = filas * CELDA_H + (filas - 1) * CARRIL;
  const pasajes = entradas.map((e) => e.capacidadPasaje * (PUESTO_W + 6) - 6);
  const pasajesW = pasajes.reduce((a, b) => a + b, 0) + Math.max(0, entradas.length - 1) * 48;
  const ancho = Math.max(loteW, pasajesW) + MARGEN * 2;
  const alto = MARGEN * 2 + loteH + CARRIL + PASAJE_H;
  const loteX = (ancho - loteW) / 2;
  const sueloY = MARGEN + loteH + CARRIL;

  const xCelda = (c: CeldaMapa) => loteX + (c.x - 1) * (CELDA_W + HUECO);
  const yCelda = (c: CeldaMapa) => MARGEN + (c.y - 1) * (CELDA_H + CARRIL);

  let cursor = (ancho - pasajesW) / 2;
  const posiciones = entradas.map((entrada, i) => {
    const x = cursor;
    cursor += pasajes[i] + 48;
    return { entrada, x, w: pasajes[i] };
  });

  const teclado = (id: string) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSeleccionar?.(id);
    }
  };

  return (
    <div className="ui-mapa">
      <div className="ui-mapa-lienzo">
        <svg
          viewBox={`0 0 ${ancho} ${alto}`}
          style={{ width: `${zoom * 100}%` }}
          role="group"
          aria-label={`Mapa de ${nombre}`}
        >
          <rect x={4} y={4} width={ancho - 8} height={alto - 8} rx={20} className="ui-mapa-lote" />
          {Array.from({ length: filas }, (_, i) => (
            <rect
              key={i}
              x={loteX - 10}
              y={MARGEN + i * (CELDA_H + CARRIL) + CELDA_H + 10}
              width={loteW + 20}
              height={CARRIL - 20}
              rx={8}
              className="ui-mapa-carril"
            />
          ))}
          {celdas.map((celda) => {
            const meta = ESTADO_CELDA[celda.estado];
            const elegida = celda.id === seleccion;
            const x = xCelda(celda);
            const y = yCelda(celda);
            return (
              <g
                key={celda.id}
                className={`ui-celda ui-tono-${meta.tono}${elegida ? " ui-celda-elegida" : ""}`}
                role={onSeleccionar ? "button" : "img"}
                tabIndex={onSeleccionar ? 0 : undefined}
                aria-pressed={onSeleccionar ? elegida : undefined}
                aria-label={`Celda ${celda.id}, ${meta.texto}${celda.placa ? `, ${celda.placa}` : ""}`}
                onClick={onSeleccionar ? () => onSeleccionar(celda.id) : undefined}
                onKeyDown={onSeleccionar ? teclado(celda.id) : undefined}
              >
                <rect x={x} y={y} width={CELDA_W} height={CELDA_H} rx={10} className="ui-celda-fondo" />
                <text x={x + CELDA_W / 2} y={y + 22} className="ui-celda-id">
                  {celda.id}
                </text>
                <meta.Icono x={x + CELDA_W / 2 - 11} y={y + 32} width={22} height={22} strokeWidth={2.2} aria-hidden="true" />
                <text x={x + CELDA_W / 2} y={y + 74} className="ui-celda-estado">
                  {meta.texto}
                </text>
                {celda.placa && (
                  <text x={x + CELDA_W / 2} y={y + 88} className="ui-celda-placa">
                    {celda.placa}
                  </text>
                )}
              </g>
            );
          })}
          {posiciones.map(({ entrada, x, w }) => (
            <g key={entrada.id} aria-label={`Entrada ${entrada.nombre}: ${entrada.fila.length} de ${entrada.capacidadPasaje} puestos en el pasaje`} role="img">
              <rect x={x - 8} y={sueloY - 8} width={w + 16} height={PASAJE_H - 8} rx={12} className="ui-mapa-pasaje" />
              <DoorOpen x={x} y={sueloY} width={18} height={18} aria-hidden="true" className="ui-mapa-puerta" />
              <text x={x + 24} y={sueloY + 14} className="ui-mapa-entrada">
                {entrada.nombre}
              </text>
              {Array.from({ length: entrada.capacidadPasaje }, (_, i) => {
                const placa = entrada.fila[i];
                const px = x + i * (PUESTO_W + 6);
                return (
                  <g key={i} className={placa ? "ui-puesto ui-puesto-lleno" : "ui-puesto"}>
                    <rect x={px} y={sueloY + 30} width={PUESTO_W} height={PUESTO_H} rx={6} />
                    <text x={px + PUESTO_W / 2} y={sueloY + 54}>
                      {placa ? placa.slice(0, 3) : i + 1}
                    </text>
                    {placa && (
                      <text x={px + PUESTO_W / 2} y={sueloY + 66} className="ui-puesto-sub">
                        {placa.slice(3)}
                      </text>
                    )}
                  </g>
                );
              })}
              <text x={x} y={sueloY + 94} className="ui-mapa-nota">
                Pasaje {entrada.fila.length}/{entrada.capacidadPasaje}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="ui-mapa-controles" role="group" aria-label="Zoom del mapa">
        <button type="button" aria-label="Acercar" disabled={zoom >= 2} onClick={() => setZoom((z) => Math.min(2, z + 0.5))}>
          <Plus size={18} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Alejar" disabled={zoom <= 1} onClick={() => setZoom((z) => Math.max(1, z - 0.5))}>
          <Minus size={18} aria-hidden="true" />
        </button>
      </div>
      <ul className="ui-mapa-leyenda" aria-label="Leyenda">
        {Object.values(ESTADO_CELDA).map((meta) => (
          <li key={meta.texto}>
            <Pastilla {...meta} />
          </li>
        ))}
      </ul>
    </div>
  );
}
