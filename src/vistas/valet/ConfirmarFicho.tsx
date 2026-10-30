import { useId, useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { tienda } from "../../parqueadero/tienda";
import { Boton } from "../../ui/Boton";
import type { Aviso } from "../../ui/useTienda";
import type { Servicio } from "./pasos";

/**
 * In the passage the driver shows the ficho they got when hiring; the valet types it and, when the
 * engine accepts it, the keys are handed over. A wrong ficho is rejected and the valet can retry.
 */
export function ConfirmarFicho({ servicio: s, onResultado }: { servicio: Servicio; onResultado: (aviso: Aviso) => void }) {
  const id = useId();
  const [ficho, setFicho] = useState("");
  const confirmar = (event: FormEvent) => {
    event.preventDefault();
    if (s.estado === "pagado") {
      const recibido = tienda.ejecutar({ tipo: "entregarLlaves", placa: s.placa });
      if (!recibido.ok) return onResultado({ ok: false, texto: recibido.motivo });
    }
    const r = tienda.ejecutar({ tipo: "confirmarFicho", placa: s.placa, ficho });
    onResultado(r.ok ? { ok: true, texto: `Ficho ${s.ficho} confirmado: recibiste las llaves de ${s.placa}.` } : { ok: false, texto: r.motivo });
  };
  return (
    <form className="vl-ficho" onSubmit={confirmar}>
      <div className="ui-campo">
        <label htmlFor={`${id}-ficho`}>Ficho que te muestra el conductor de {s.placa}</label>
        <input
          id={`${id}-ficho`}
          value={ficho}
          onChange={(event) => setFicho(event.target.value.toUpperCase())}
          placeholder="F-000-0000"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
        />
      </div>
      <Boton type="submit" variante="primario" Icono={KeyRound} ancho>
        Confirmar ficho y recibir llaves
      </Boton>
    </form>
  );
}
