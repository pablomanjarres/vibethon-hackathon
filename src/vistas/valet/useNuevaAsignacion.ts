import { useCallback, useEffect, useRef, useState } from "react";
import { useAnnounce } from "../../shared/Announcer";
import type { Servicio } from "./pasos";

/** One line with everything the valet needs: plate, cell, ficho, entrance and when it arrived. */
export function detalleAsignacion(s: Servicio): string {
  const lugar = s.celda ? `celda ${s.celda}` : "celda por asignar";
  const carro = s.estado === "devolución" ? `devolver ${s.placa} desde la ${lugar}` : `${s.placa} → ${lugar}`;
  return `${carro}, ficho ${s.ficho}, ${s.entrada}, ${s.asignado}`;
}

/**
 * The assignment to announce: set when the open view first sees an assignment and whenever a new one
 * arrives (live from another tab too), cleared when dismissed or when that assignment ends.
 */
export function useNuevaAsignacion(servicio: Servicio | null): [Servicio | null, () => void] {
  const anunciar = useAnnounce();
  const visto = useRef<string | null>(null);
  const [nueva, setNueva] = useState<Servicio | null>(null);
  useEffect(() => {
    if (!servicio || servicio.id === visto.current) return;
    visto.current = servicio.id;
    setNueva(servicio);
    anunciar(`Nueva asignación: ${detalleAsignacion(servicio)}`);
  }, [servicio, anunciar]);
  const descartar = useCallback(() => setNueva(null), []);
  return [nueva && servicio?.id === nueva.id ? nueva : null, descartar];
}
