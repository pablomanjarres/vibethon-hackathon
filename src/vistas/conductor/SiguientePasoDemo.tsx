import { FastForward, StepForward } from "lucide-react";
import { pasoSimulado } from "../../parqueadero/simulacion";
import { hora } from "../../parqueadero/lecturas/formato";
import { tienda } from "../../parqueadero/tienda";
import type { Estado } from "../../parqueadero/tipos";
import { Boton } from "../../ui/Boton";
import type { Aviso } from "../../ui/useTienda";

/** Steps "Hasta tener celda" may run before it stops. */
const LIMITE = 120;

/** Runs one simulated step through the engine; returns the last message, or null if nothing ran. */
function avanzar(placa: string): Aviso | null {
  const paso = pasoSimulado(tienda.leer(), placa);
  if (!paso) return null;
  let ultimo = "";
  for (const comando of paso.comandos) {
    const r = tienda.ejecutar(comando);
    if (!r.ok) return { ok: false, texto: r.motivo };
    if (comando.tipo !== "avanzarReloj") ultimo = r.evento.detalle;
  }
  return { ok: true, texto: `${paso.quien} (+${paso.minutos} min): ${ultimo}` };
}

/**
 * Demo only (?demo): what the gate, a valet, the office or another driver does next for this car,
 * one press at a time, with the simulated clock moving so the wait estimate fills in.
 */
export function SiguientePasoDemo({ estado, placa, onResultado }: { estado: Estado; placa: string; onResultado: (aviso: Aviso) => void }) {
  const paso = pasoSimulado(estado, placa);
  if (!paso) return null;
  const esperando = ["en fila", "en espera"].includes(estado.carros[placa]?.estado ?? "");
  const hastaCelda = () => {
    let ultimo: Aviso | null = null;
    for (let i = 0; i < LIMITE && ["en fila", "en espera"].includes(tienda.leer().carros[placa]?.estado ?? ""); i += 1) {
      const r = avanzar(placa);
      if (!r) break;
      ultimo = r;
      if (!r.ok) break;
    }
    const ahora = tienda.leer();
    onResultado(ultimo?.ok === false ? ultimo : { ok: true, texto: `Son las ${hora(ahora.inicio, ahora.minuto)}. ${ultimo?.texto ?? ""}` });
  };
  return (
    <div className="cd-demo-paso">
      <Boton variante="secundario" Icono={StepForward} ancho onClick={() => onResultado(avanzar(placa) ?? { ok: true, texto: "Nada más que simular." })}>
        Siguiente paso: {paso.quien} (+{paso.minutos} min)
      </Boton>
      {esperando && (
        <Boton variante="contorno" Icono={FastForward} ancho onClick={hastaCelda}>
          Simular hasta tener celda
        </Boton>
      )}
    </div>
  );
}
