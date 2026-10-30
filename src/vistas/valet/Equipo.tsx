import { Users } from "lucide-react";
import { listaValets } from "../../parqueadero/lecturas/valet";
import { Acordeon } from "../../ui/Acordeon";
import { ESTADO_VALET } from "../../ui/estados";
import { Pastilla } from "../../ui/Pastilla";
import { useEstado } from "../../ui/useTienda";

/** Every valet grouped by entrance with their state, so the valet sees who else is free. */
export function Equipo({ actual }: { actual: string }) {
  const valets = listaValets(useEstado());
  const entradas = [...new Set(valets.map((v) => v.entrada))];
  const libres = valets.filter((v) => v.estado === "disponible").length;
  return (
    <Acordeon Icono={Users} titulo="Valets por entrada" extra={`${libres} de ${valets.length} disponibles`}>
      {entradas.map((entrada) => (
        <div key={entrada} className="vl-equipo">
          <h3 className="vl-equipo-entrada">{entrada}</h3>
          <ul>
            {valets
              .filter((v) => v.entrada === entrada)
              .map((v) => (
                <li key={v.id} aria-current={v.id === actual ? "true" : undefined}>
                  <strong className="num">{v.id}</strong>
                  {v.id === actual && <span className="vl-tu">(tú)</span>}
                  <Pastilla {...ESTADO_VALET[v.estado]} />
                </li>
              ))}
          </ul>
        </div>
      ))}
    </Acordeon>
  );
}
