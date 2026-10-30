import { useId, useState, type FormEvent } from "react";
import { FastForward, Play, RotateCcw } from "lucide-react";
import { tienda } from "../../parqueadero/tienda";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { FilaAcciones } from "../../ui/FilaAcciones";
import { useComando } from "../../ui/useTienda";

/** Presenter controls as the panel's action tiles: move the clock, play the scenario up to a minute, or start over. */
export function ControlesSimulacion({ minuto }: { minuto: number }) {
  const id = useId();
  const { aviso, enviar, informar } = useComando();
  const [hasta, setHasta] = useState(String(minuto + 30));
  const [rechazos, setRechazos] = useState<string[]>([]);
  const objetivo = Number(hasta);
  const valido = Number.isInteger(objetivo) && objetivo > minuto;

  const simular = (event?: FormEvent) => {
    event?.preventDefault();
    if (!valido) return;
    const motivos = tienda.simularHasta(objetivo);
    setRechazos(motivos);
    informar({
      ok: true,
      texto: motivos.length
        ? `Simulado hasta el minuto ${objetivo}. ${motivos.length === 1 ? "1 evento rechazado" : `${motivos.length} eventos rechazados`}.`
        : `Simulado hasta el minuto ${objetivo}. Ningún evento rechazado.`,
    });
  };
  const reiniciar = () => {
    tienda.reiniciar();
    setRechazos([]);
    setHasta("30");
    informar({ ok: true, texto: "Simulación reiniciada al minuto 0." });
  };

  return (
    <>
      <FilaAcciones
        acciones={[
          {
            texto: "Avanzar 1 min",
            Icono: Play,
            onClick: () => {
              setRechazos([]);
              enviar({ tipo: "avanzarReloj", minutos: 1 });
            },
          },
          { texto: "Simular", Icono: FastForward, onClick: () => simular(), motivo: valido ? null : `elige un minuto mayor que ${minuto}.` },
          { texto: "Reiniciar", Icono: RotateCcw, onClick: reiniciar },
        ]}
      />
      <form className="ui-campo of-hasta" onSubmit={simular}>
        <label htmlFor={id}>Simular eventos hasta el minuto</label>
        <input id={id} type="number" inputMode="numeric" min={minuto + 1} step={1} value={hasta} onChange={(event) => setHasta(event.target.value)} required />
      </form>
      <AvisoResultado aviso={aviso} />
      {rechazos.length > 0 && (
        <ul className="of-rechazos" aria-label="Eventos rechazados">
          {rechazos.map((motivo, i) => (
            <li key={i}>{motivo}</li>
          ))}
        </ul>
      )}
    </>
  );
}
