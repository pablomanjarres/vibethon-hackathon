import { Users } from "lucide-react";
import type { VistaValet } from "../../parqueadero/lecturas/valet";
import { ESTADO_VALET } from "../../ui/estados";
import { Pastilla } from "../../ui/Pastilla";
import { Vacio } from "../../ui/Datos";
import { TarjetaDatos } from "../../ui/TarjetaDatos";

/** The valets out on a job, with their gate, ficho and car; the free ones are only counted. */
export function Valets({ valets }: { valets: VistaValet[] }) {
  const activos = valets.filter((v) => v.estado !== "disponible");
  const libres = valets.length - activos.length;
  return (
    <TarjetaDatos Icono={Users} titulo="Valets activos" contador={{ valor: libres, etiqueta: "Disponibles" }}>
      {activos.length === 0 ? (
        <Vacio>Los {valets.length} valets están disponibles.</Vacio>
      ) : (
        <ul className="ui-lista">
          {activos.map((v) => (
            <li key={v.id}>
              <span>
                <strong>{v.id}</strong> · {v.entrada}
                <br />
                <span className="ui-texto-suave num">
                  {v.servicio ? `Ficho ${v.servicio.ficho} · ${v.servicio.placa}` : "Sin carro"}
                </span>
              </span>
              <Pastilla {...ESTADO_VALET[v.estado]} />
            </li>
          ))}
        </ul>
      )}
    </TarjetaDatos>
  );
}
