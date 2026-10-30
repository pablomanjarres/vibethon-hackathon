import { ZONAS, demanda, type Zona } from "./datos";
import "./mapa-campus.css";

interface Props {
  elegida?: string | null;
  /** Hide the price-style pill and labels for the small thumbnail. */
  miniatura?: boolean;
  /** Zoom into the chosen zone and mark this stall (1-based). */
  celda?: number;
}

const PUESTOS = 5;

/**
 * The lot drawn like a stadium seat map: streets around it, one central aisle,
 * zones as sections with a dot for availability and a pill over the chosen zone.
 */
export function MapaCampus({ elegida = null, miniatura = false, celda }: Props) {
  const zona = ZONAS.find((z) => z.id === elegida);
  const vista = zona && celda ? `${zona.x - 40} ${zona.y - 60} ${zona.w + 80} ${(zona.w + 80) * (470 / 350)}` : "0 0 350 470";
  return (
    <svg viewBox={vista} className="mk-mapa" role="img" aria-label="Mapa del parqueadero EAFIT por zonas">
      <rect width="350" height="470" className="mk-suelo" />
      <path d="M0 0 L350 0 L350 34 Q200 52 0 30 Z" className="mk-via" />
      <rect x="0" y="0" width="34" height="470" className="mk-via" />
      <rect x="316" y="0" width="34" height="470" className="mk-via" />
      <path d="M0 448 L350 412 L350 470 L0 470 Z" className="mk-via" />
      <path d="M260 470 C 280 380, 330 320, 350 300" className="mk-quebrada" />
      {!miniatura && (
        <g className="mk-calle">
          <text x="175" y="20">Av. Regional</text>
          <text transform="translate(21 250) rotate(-90)">Avenida Las Vegas</text>
          <text transform="translate(333 200) rotate(90)">Carrera 48</text>
          <text transform="translate(175 452) rotate(-6)">Calle 5 Sur</text>
        </g>
      )}

      <rect x="48" y="58" width="254" height="374" rx="18" className="mk-lote" />
      <rect x="164" y="64" width="22" height="362" rx="6" className="mk-pasillo" />
      <Entrada x={34} y={238} texto="LV" miniatura={miniatura} />
      <Entrada x={162} y={40} texto="RG" miniatura={miniatura} />

      {ZONAS.map((z) => (
        <Seccion key={z.id} zona={z} elegida={z.id === elegida} miniatura={miniatura} />
      ))}

      {zona && celda && (
        <g className="mk-celda">
          <rect x={zona.x + (zona.w / PUESTOS) * (celda - 1) + 2} y={zona.y + 3} width={zona.w / PUESTOS - 4} height={zona.h - 6} rx="3" />
          <text x={zona.x + (zona.w / PUESTOS) * (celda - 0.5)} y={zona.y + zona.h / 2 + 3}>
            {String(celda).padStart(2, "0")}
          </text>
        </g>
      )}

      {zona && !miniatura && !celda && (
        <g className="mk-globo">
          <rect x={zona.x + zona.w / 2 - 44} y={zona.y - 30} width="88" height="26" rx="13" />
          <path d={`M${zona.x + zona.w / 2 - 6} ${zona.y - 5} l6 7 l6 -7 Z`} />
          <text x={zona.x + zona.w / 2} y={zona.y - 13}>
            {zona.libres} libres
          </text>
        </g>
      )}
    </svg>
  );
}

function Seccion({ zona, elegida, miniatura }: { zona: Zona; elegida: boolean; miniatura: boolean }) {
  const paso = zona.w / PUESTOS;
  return (
    <g className={`mk-seccion mk-${demanda(zona)}${elegida ? " mk-elegida" : ""}`}>
      <rect x={zona.x} y={zona.y} width={zona.w} height={zona.h} rx="6" />
      {Array.from({ length: PUESTOS - 1 }, (_, i) => (
        <line key={i} x1={zona.x + paso * (i + 1)} y1={zona.y + 4} x2={zona.x + paso * (i + 1)} y2={zona.y + zona.h - 4} />
      ))}
      {!miniatura && (
        <>
          <text x={zona.x + 8} y={zona.y + 14} className="mk-seccion-id">
            {zona.id}
          </text>
          {zona.libres > 0 && <circle cx={zona.x + zona.w / 2} cy={zona.y + zona.h / 2 + 4} r="7" className="mk-punto" />}
        </>
      )}
    </g>
  );
}

function Entrada({ x, y, texto, miniatura }: { x: number; y: number; texto: string; miniatura: boolean }) {
  return (
    <g className="mk-entrada">
      <rect x={x} y={y} width="26" height="18" rx="5" />
      {!miniatura && (
        <text x={x + 13} y={y + 13}>
          {texto}
        </text>
      )}
    </g>
  );
}
