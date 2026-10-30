import { Check } from "lucide-react";

export interface Paso {
  texto: string;
  /** Clock time when it happened, or null when it has not. */
  hora: string | null;
  hecho: boolean;
}

/** Order-status steps: done ones with their time, the current one highlighted, the rest muted. */
export function Progreso({ pasos }: { pasos: Paso[] }) {
  const actual = pasos.findIndex((p) => !p.hecho);
  return (
    <ol className="vl-pasos">
      {pasos.map((paso, i) => (
        <li key={paso.texto} className={paso.hecho ? "vl-hecho" : i === actual ? "vl-actual" : undefined} aria-current={i === actual ? "step" : undefined}>
          <span className="vl-punto" aria-hidden="true">
            {paso.hecho && <Check size={14} strokeWidth={3} />}
          </span>
          <span className="vl-paso-texto">{paso.texto}</span>
          <span className="vl-paso-hora num">{paso.hecho ? (paso.hora ?? "Hecho") : i === actual ? "Ahora" : ""}</span>
        </li>
      ))}
    </ol>
  );
}
