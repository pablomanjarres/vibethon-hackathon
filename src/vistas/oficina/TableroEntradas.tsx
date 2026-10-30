import { DoorOpen } from "lucide-react";
import type { VistaOficina } from "../../parqueadero/lecturas/oficina";
import { ESTADO_VALET, type EstadoValetUi } from "../../ui/estados";
import { Pastilla } from "../../ui/Pastilla";
import { Cifra } from "../../ui/Tarjeta";

type Entrada = VistaOficina["entradas"][number];

/** Live queue tiles: one per entrance with its passage, its share of the cells and its valets. */
export function TableroEntradas({ entradas }: { entradas: Entrada[] }) {
  const totalAsignadas = entradas.reduce((suma, e) => suma + e.celdasAsignadas, 0);
  return (
    <ul className="of-tiles" aria-label="Entradas en vivo">
      {entradas.map((entrada) => (
        <TileEntrada key={entrada.id} entrada={entrada} totalAsignadas={totalAsignadas} />
      ))}
    </ul>
  );
}

function TileEntrada({ entrada, totalAsignadas }: { entrada: Entrada; totalAsignadas: number }) {
  const lleno = entrada.enPasaje >= entrada.capacidad;
  const porcentaje = entrada.capacidad ? Math.min(100, Math.round((entrada.enPasaje / entrada.capacidad) * 100)) : 0;
  const parte = totalAsignadas ? Math.round((entrada.celdasAsignadas / totalAsignadas) * 100) : 0;
  return (
    <li className="of-tile">
      <h2>
        <DoorOpen size={18} strokeWidth={2} aria-hidden="true" /> Entrada {entrada.nombre}
      </h2>
      <div className="ui-cifras">
        <Cifra valor={`${entrada.enPasaje}/${entrada.capacidad}`} etiqueta="En el pasaje" detalle={lleno ? "Pasaje lleno" : undefined} />
        <Cifra valor={entrada.celdasAsignadas} etiqueta="Celdas entregadas" detalle={`${parte} % del total`} />
      </div>
      <div
        className={lleno ? "of-medidor of-medidor-lleno" : "of-medidor"}
        role="meter"
        aria-label={`Pasaje de ${entrada.nombre}`}
        aria-valuemin={0}
        aria-valuemax={entrada.capacidad}
        aria-valuenow={entrada.enPasaje}
      >
        <span style={{ width: `${porcentaje}%` }} />
      </div>
      <ul className="of-pastillas" aria-label={`Valets de ${entrada.nombre}`}>
        {(Object.keys(ESTADO_VALET) as EstadoValetUi[]).map((estado) => (
          <li key={estado}>
            <Pastilla {...ESTADO_VALET[estado]} texto={`${entrada.valets[estado] ?? 0} ${ESTADO_VALET[estado].texto.toLowerCase()}`} />
          </li>
        ))}
      </ul>
    </li>
  );
}
