import { Minus, Plus } from "lucide-react";

/** The +/- pair that enlarges the lot inside its own frame, in half steps from 1 to max. */
export function ZoomMapa({ zoom, max, onCambiar }: { zoom: number; max: number; onCambiar: (zoom: number) => void }) {
  return (
    <div className="ui-mapa-zoom" role="group" aria-label="Zoom del mapa">
      <button type="button" aria-label="Acercar" disabled={zoom >= max} onClick={() => onCambiar(Math.min(max, zoom + 0.5))}>
        <Plus size={18} aria-hidden="true" />
      </button>
      <button type="button" aria-label="Alejar" disabled={zoom <= 1} onClick={() => onCambiar(Math.max(1, zoom - 0.5))}>
        <Minus size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
