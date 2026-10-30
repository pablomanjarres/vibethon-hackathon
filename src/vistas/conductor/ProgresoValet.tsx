import type { EstadoServicio } from "../../parqueadero/tipos";
import "./pasos.css";

const PASOS = ["Llaves entregadas", "Estacionado", "Pedido", "Entregado"] as const;

/** How far each service state has gone along the four steps; -1 before the keys are handed over. */
const AVANCE: Record<EstadoServicio, number> = {
  solicitado: -1,
  "en curso": 0,
  estacionado: 1,
  devolución: 2,
  entregado: 3,
};

/** One status line and four dots, from keys handed over to car returned. */
export function ProgresoValet({ estado }: { estado: EstadoServicio }) {
  const avance = AVANCE[estado];
  return (
    <div className="cd-progreso">
      <p className="cd-progreso-linea">
        {avance < 0 ? "El valet va hacia tu carro. Entrégale las llaves." : `Paso ${avance + 1} de ${PASOS.length}: ${PASOS[avance]}`}
      </p>
      <ol className="cd-progreso-pasos" aria-label={`Valet: paso ${avance + 1} de ${PASOS.length}`}>
        {PASOS.map((paso, i) => (
          <li key={paso} className={i <= avance ? "cd-hecho" : undefined} aria-current={i === avance ? "step" : undefined}>
            <span className="cd-punto" aria-hidden="true" />
            <span>{paso}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
