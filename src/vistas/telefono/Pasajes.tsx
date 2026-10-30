import { CircleArrowRight, CircleDashed, Hourglass, KeyRound, ListOrdered } from "lucide-react";
import type { VistaPorteria } from "../../parqueadero/lecturas/porteria";
import { Pastilla, type Insignia } from "../../ui/Pastilla";
import { Vacio } from "../../ui/Datos";
import { TarjetaDatos } from "../../ui/TarjetaDatos";

const TURNO: Record<"turno" | "espera" | "vacio", Insignia> = {
  turno: { texto: "De turno", Icono: CircleArrowRight, tono: "libre" },
  espera: { texto: "Esperando", Icono: Hourglass, tono: "reservada" },
  vacio: { texto: "Vacío", Icono: CircleDashed, tono: "neutro" },
};

function turno(p: VistaPorteria): Insignia {
  if (p.fila.length === 0) return TURNO.vacio;
  return p.esMiTurno ? TURNO.turno : TURNO.espera;
}

/** Both passages side by side in one card: the cars waiting at each gate and whose turn it is. */
export function Pasajes({ porterias }: { porterias: VistaPorteria[] }) {
  const deTurno = porterias.find((p) => p.esMiTurno && p.fila.length > 0);
  return (
    <TarjetaDatos Icono={ListOrdered} titulo="Pasajes">
      <p className="tl-turno" aria-live="polite">
        {deTurno ? `Turno de ${deTurno.nombre}: pasa ${deTurno.fila[0].placa}.` : "No hay carros esperando en los pasajes."}
      </p>
      <div className="tl-pasajes">
        {porterias.map((p) => (
          <section key={p.entrada} className="tl-pasaje" aria-label={`Pasaje de ${p.nombre}`}>
            <header>
              <strong>{p.nombre}</strong>
              <span className="ui-texto-suave num">
                {p.pasaje.ocupados}/{p.pasaje.capacidad}
              </span>
            </header>
            <Pastilla {...turno(p)} />
            {p.fila.length === 0 ? (
              <Vacio>Sin carros.</Vacio>
            ) : (
              <ol className="tl-fila">
                {p.fila.map((carro, i) => (
                  <li key={carro.placa}>
                    <span className="tl-puesto num" aria-label={`Puesto ${i + 1}`}>
                      {i + 1}
                    </span>
                    <span>
                      <strong className="num">{carro.placa}</strong>
                      <span className="ui-texto-suave num tl-sub">
                        {carro.conValet && <KeyRound size={12} aria-label="Con valet" />} ~{carro.esperaMinutos} min
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>
    </TarjetaDatos>
  );
}
