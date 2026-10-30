import { useState } from "react";
import { CircleAlert, MapPin } from "lucide-react";
import type { Estado } from "../../parqueadero/tipos";
import { Boton } from "../../ui/Boton";
import { MapaLote } from "../../ui/MapaLote";

interface Props {
  estado: Estado;
  /** Free cells this driver may take; only used when `puedeReservar`. */
  celdasLibres: string[];
  puedeReservar: boolean;
  /** Why the driver cannot reserve yet, from the read model. */
  motivo: string;
  /** The cell already held for this car, if any. */
  celda: string | null;
  onReservar: (celda: string) => void;
}

/** The lot plan first: tap a free cell, then one clear action reserves it. */
export function ReservaCelda({ estado, celdasLibres, puedeReservar, motivo, celda, onReservar }: Props) {
  const [elegida, setElegida] = useState<string | null>(null);
  const mapa = estado.mapas[0];
  if (!mapa) return null;
  const libres = new Set(celdasLibres);
  const seleccion = puedeReservar && elegida && libres.has(elegida) ? elegida : null;
  return (
    <div className="cd-reserva">
      <MapaLote
        nombre={mapa.nombre}
        columnas={mapa.columnas}
        filas={mapa.filas}
        celdas={estado.celdas.filter((c) => c.mapa === mapa.id)}
        entradas={estado.entradas}
        seleccion={seleccion ?? celda}
        onSeleccionar={puedeReservar ? (id) => libres.has(id) && setElegida(id) : undefined}
      />
      {puedeReservar ? (
        <div className="cd-reserva-hoja">
          <p className="ui-texto-suave">
            <MapPin size={16} aria-hidden="true" />{" "}
            {seleccion ? `Celda ${seleccion}, libre.` : `Toca una de las ${celdasLibres.length} celdas libres en el mapa.`}
          </p>
          <Boton variante="primario" Icono={MapPin} ancho disabled={!seleccion} onClick={() => seleccion && onReservar(seleccion)}>
            {seleccion ? `Reservar celda ${seleccion}` : "Elige una celda"}
          </Boton>
        </div>
      ) : (
        !celda && (
          <p className="cd-reserva-motivo">
            <CircleAlert size={16} aria-hidden="true" /> {motivo}
          </p>
        )
      )}
    </div>
  );
}
