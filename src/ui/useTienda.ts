import { useCallback, useState, useSyncExternalStore } from "react";
import type { Comando } from "../parqueadero/motor";
import { tienda } from "../parqueadero/tienda";
import type { Estado } from "../parqueadero/tipos";
import { useAnnounce } from "../shared/Announcer";

/** The one shared state every view reads, so no two screens can disagree. */
export function useEstado(): Estado {
  return useSyncExternalStore(tienda.suscribir, tienda.leer);
}

export interface Aviso {
  ok: boolean;
  texto: string;
}

/**
 * Sends a command to the engine and reports what happened: the event once it is accepted, or the
 * engine's reason when it is rejected. The text is shown inline and read by screen readers.
 */
export function useComando() {
  const anunciar = useAnnounce();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const informar = useCallback(
    (siguiente: Aviso) => {
      setAviso(siguiente);
      anunciar(siguiente.texto);
    },
    [anunciar],
  );
  const enviar = useCallback(
    (comando: Comando) => {
      const resultado = tienda.ejecutar(comando);
      informar(resultado.ok ? { ok: true, texto: resultado.evento.detalle } : { ok: false, texto: resultado.motivo });
      return resultado.ok;
    },
    [informar],
  );
  return { aviso, enviar, informar };
}
