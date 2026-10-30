import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

/** Share of the screen the sheet covers at each stop: peek, half, full. */
const PARADAS = [0.52, 0.72, 0.9] as const;
const ETIQUETAS = ["Ver más", "Ver todo", "Ver el mapa"];

interface Props {
  etiqueta: string;
  /** Always visible at the top of the sheet, above the scrolling body. */
  cabeza: ReactNode;
  /** Fixed at the bottom of the sheet, e.g. the main actions. */
  pie?: ReactNode;
  children: ReactNode;
}

/**
 * A bottom sheet over the map with three stops. Drag the handle (or the header) to resize it; a tap
 * or Enter on the handle moves to the next stop.
 */
export function HojaInferior({ etiqueta, cabeza, pie, children }: Props) {
  const hoja = useRef<HTMLElement>(null);
  const [parada, setParada] = useState(0);
  const [arrastre, setArrastre] = useState<number | null>(null);
  const inicio = useRef<{ y: number; movio: boolean } | null>(null);

  const visible = arrastre ?? PARADAS[parada];
  const fraccion = (y: number) => {
    const pantalla = hoja.current?.parentElement?.getBoundingClientRect();
    if (!pantalla) return PARADAS[parada];
    return Math.min(PARADAS[2], Math.max(0.25, (pantalla.bottom - y) / pantalla.height));
  };
  const bajar = (e: PointerEvent) => {
    inicio.current = { y: e.clientY, movio: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const mover = (e: PointerEvent) => {
    if (!inicio.current) return;
    if (Math.abs(e.clientY - inicio.current.y) > 4) inicio.current.movio = true;
    if (inicio.current.movio) setArrastre(fraccion(e.clientY));
  };
  const soltar = () => {
    if (inicio.current?.movio && arrastre !== null) {
      const cerca = PARADAS.reduce((mejor, p, i) => (Math.abs(p - arrastre) < Math.abs(PARADAS[mejor] - arrastre) ? i : mejor), 0);
      setParada(cerca);
    }
    inicio.current = null;
    setArrastre(null);
  };

  return (
    <section
      ref={hoja}
      className={arrastre === null ? "tl-hoja" : "tl-hoja tl-hoja-arrastre"}
      aria-label={etiqueta}
      style={{ "--visible": visible, "--alto": PARADAS[2] } as CSSProperties}
    >
      <div className="tl-hoja-agarre" onPointerDown={bajar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}>
        <button
          type="button"
          className="tl-hoja-asa"
          aria-label={ETIQUETAS[parada]}
          onClick={() => !inicio.current?.movio && setParada((parada + 1) % PARADAS.length)}
        >
          <span aria-hidden="true" />
        </button>
        {cabeza}
      </div>
      <div className="tl-hoja-cuerpo">{children}</div>
      {pie && <div className="tl-hoja-pie">{pie}</div>}
    </section>
  );
}
