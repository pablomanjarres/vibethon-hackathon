import { useId, useState, type FormEvent } from "react";
import { FastForward, Play, RotateCcw, SlidersHorizontal } from "lucide-react";
import { tienda } from "../../parqueadero/tienda";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { Tarjeta } from "../../ui/Tarjeta";
import { useComando } from "../../ui/useTienda";

/** Presenter controls: move the clock, play the scenario's events up to a minute, or start over. */
export function ControlesSimulacion({ minuto }: { minuto: number }) {
  const id = useId();
  const { aviso, enviar, informar } = useComando();
  const [hasta, setHasta] = useState(String(minuto + 30));
  const [rechazos, setRechazos] = useState<string[]>([]);

  const simular = (event: FormEvent) => {
    event.preventDefault();
    const objetivo = Number(hasta);
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
    <Tarjeta titulo="Simulación" Icono={SlidersHorizontal} extra={<span className="ui-texto-suave num">Minuto {minuto}</span>}>
      <div className="of-sim">
        <Boton
          variante="secundario"
          Icono={Play}
          onClick={() => {
            setRechazos([]);
            enviar({ tipo: "avanzarReloj", minutos: 1 });
          }}
        >
          Avanzar 1 min
        </Boton>
        <form className="ui-campo" onSubmit={simular}>
          <label htmlFor={id}>Simular eventos hasta el minuto</label>
          <div className="ui-campo-fila">
            <input
              id={id}
              type="number"
              inputMode="numeric"
              min={minuto + 1}
              step={1}
              value={hasta}
              onChange={(event) => setHasta(event.target.value)}
              required
            />
            <Boton type="submit" Icono={FastForward}>
              Simular
            </Boton>
          </div>
        </form>
        <Boton variante="contorno" Icono={RotateCcw} onClick={reiniciar}>
          Reiniciar
        </Boton>
      </div>
      <AvisoResultado aviso={aviso} />
      {rechazos.length > 0 && (
        <ul className="of-rechazos" aria-label="Eventos rechazados">
          {rechazos.map((motivo, i) => (
            <li key={i}>{motivo}</li>
          ))}
        </ul>
      )}
    </Tarjeta>
  );
}
