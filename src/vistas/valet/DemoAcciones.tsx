import { BellPlus, StepForward } from "lucide-react";
import { vistaConductor } from "../../parqueadero/lecturas/conductor";
import { pasoSimulado } from "../../parqueadero/simulacion";
import { tienda } from "../../parqueadero/tienda";
import { useRoute } from "../../shared/route";
import { FilaAcciones } from "../../ui/FilaAcciones";
import { useEstado, type Aviso } from "../../ui/useTienda";

/** Runs a list of commands in order through the engine and reports the last event, or the first rejection. */
function correr(comandos: Parameters<typeof tienda.ejecutar>[0][], quien: string): Aviso {
  let ultimo = "";
  for (const comando of comandos) {
    const r = tienda.ejecutar(comando);
    if (!r.ok) return { ok: false, texto: r.motivo };
    if (comando.tipo !== "avanzarReloj") ultimo = r.evento.detalle;
  }
  return { ok: true, texto: `${quien}: ${ultimo}` };
}

/**
 * Demo only (?demo): a driver in this valet's line hires them and pays, or the gate and the driver
 * take their next step for the current car. Every press goes through the engine, so the office log sees it.
 */
export function DemoAcciones({ valetId, placa, onResultado }: { valetId: string; placa: string | null; onResultado: (aviso: Aviso) => void }) {
  const estado = useEstado();
  const { params } = useRoute();
  if (!params.has("demo")) return null;
  const cliente = placa
    ? null
    : Object.values(estado.carros).find((c) => vistaConductor(estado, c.placa, c.codigo).oferta?.disponibles.includes(valetId)) ?? null;
  const paso = placa ? pasoSimulado(estado, placa) : null;
  const contratar = () => {
    if (!cliente) return;
    const hecho = correr([{ tipo: "contratarValet", placa: cliente.placa, valet: valetId }], `Conductor ${cliente.placa}`);
    const servicio = tienda.leer().carros[cliente.placa]?.servicio;
    onResultado(hecho.ok && servicio ? correr([{ tipo: "pagarValet", servicio, aprobado: true }], `Conductor ${cliente.placa}`) : hecho);
  };
  return (
    <div className="vl-demo-acciones">
      <FilaAcciones
        acciones={
          placa
            ? [
                {
                  texto: paso ? `Simular: ${paso.quien}` : "Nada más que simular",
                  Icono: StepForward,
                  motivo: paso ? null : "Este servicio ya no espera a nadie más",
                  onClick: () => paso && onResultado(correr(paso.comandos, paso.quien)),
                },
              ]
            : [
                {
                  texto: cliente ? `Simular asignación: ${cliente.placa}` : "Simular asignación",
                  Icono: BellPlus,
                  motivo: cliente ? null : "No hay carros en la fila de tu entrada que puedan pedir valet",
                  onClick: contratar,
                },
              ]
        }
      />
    </div>
  );
}
