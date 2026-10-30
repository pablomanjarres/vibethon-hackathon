import { KeyRound } from "lucide-react";
import { tienda } from "../../parqueadero/tienda";
import { Boton } from "../../ui/Boton";
import type { Aviso } from "../../ui/useTienda";
import type { Servicio } from "./pasos";

/**
 * In the passage the driver shows the ficho they got when hiring; the valet checks it matches the one
 * on screen and confirms, which hands over the keys.
 */
export function ConfirmarFicho({ servicio: s, onResultado }: { servicio: Servicio; onResultado: (aviso: Aviso) => void }) {
  const confirmar = () => {
    if (s.estado === "pagado") {
      const recibido = tienda.ejecutar({ tipo: "entregarLlaves", placa: s.placa });
      if (!recibido.ok) return onResultado({ ok: false, texto: recibido.motivo });
    }
    const r = tienda.ejecutar({ tipo: "confirmarFicho", placa: s.placa, ficho: s.ficho });
    onResultado(r.ok ? { ok: true, texto: `Ficho ${s.ficho} confirmado: recibiste las llaves de ${s.placa}.` } : { ok: false, texto: r.motivo });
  };
  return (
    <div className="vl-ficho">
      <p className="vl-ficho-codigo">
        <span className="vl-rotulo">El conductor debe mostrarte este ficho</span>
        <strong className="num">{s.ficho}</strong>
      </p>
      <Boton variante="primario" Icono={KeyRound} ancho onClick={confirmar}>
        Confirmar ficho y recibir llaves
      </Boton>
    </div>
  );
}
