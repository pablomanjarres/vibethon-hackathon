import { useCallback, useEffect, useRef, useState } from "react";
import { useAnnounce } from "../../shared/Announcer";
import type { Servicio } from "./pasos";

/** One line with everything the valet needs: plate, cell, ficho, entrance and when it arrived. */
export function detalleAsignacion(s: Servicio): string {
  const lugar = s.celda ? `celda ${s.celda}` : "celda por asignar";
  const carro = s.estado === "llaves en oficina" ? `devolver ${s.placa} desde la ${lugar}` : `${s.placa} → ${lugar}`;
  return `${carro}, ficho ${s.ficho}, ${s.entrada}, ${s.asignado}`;
}

export interface Asignacion {
  servicio: Servicio;
  /** Same assignment, but the reserved cell changed (it was taken). */
  cambioCelda: boolean;
}

/** Title of the notice: a new assignment, or the same one sent to another cell. */
export function tituloAsignacion(a: Asignacion): string {
  return a.cambioCelda ? "Cambió tu celda" : "Nueva asignación";
}

const clave = (s: Servicio) => `${s.id}|${s.celda ?? ""}`;

/**
 * The assignment to announce: set when the open view first sees an assignment, whenever a new one
 * arrives (live from another tab too) and when its cell changes; cleared when dismissed or when it ends.
 */
export function useNuevaAsignacion(servicio: Servicio | null): [Asignacion | null, () => void] {
  const anunciar = useAnnounce();
  const visto = useRef<Servicio | null>(null);
  const [nueva, setNueva] = useState<Asignacion | null>(null);
  useEffect(() => {
    if (!servicio || (visto.current && clave(servicio) === clave(visto.current))) return;
    const asignacion = { servicio, cambioCelda: visto.current?.id === servicio.id };
    visto.current = servicio;
    setNueva(asignacion);
    anunciar(`${tituloAsignacion(asignacion)}: ${detalleAsignacion(servicio)}`);
  }, [servicio, anunciar]);
  const descartar = useCallback(() => setNueva(null), []);
  return [nueva && servicio && clave(servicio) === clave(nueva.servicio) ? nueva : null, descartar];
}
