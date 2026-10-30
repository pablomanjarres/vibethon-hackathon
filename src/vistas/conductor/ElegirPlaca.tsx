import { Search } from "lucide-react";
import type { Estado } from "../../parqueadero/tipos";
import { href, setParams } from "../../shared/route";
import { CampoPlaca } from "../../ui/CampoPlaca";
import { Chips } from "../../ui/Chips";
import { Vacio } from "../../ui/Datos";

/** Plate entry plus the cars in line right now, one chip each. */
export function ElegirPlaca({ estado, actual }: { estado: Estado; actual: string | null }) {
  const placas = estado.entradas.flatMap((entrada) => entrada.fila.map((placa) => ({ placa, entrada: entrada.nombre })));
  return (
    <div className="cd-elegir">
      <CampoPlaca etiqueta="Placa del carro" accion="Ver mi lugar" Icono={Search} onEnviar={(valor) => setParams({ placa: valor }, { push: true })} />
      <p className="ui-texto-suave">Carros en los pasajes ahora</p>
      {placas.length === 0 ? (
        <Vacio>No hay carros en los pasajes.</Vacio>
      ) : (
        <Chips
          etiqueta="Carros en los pasajes"
          chips={placas.map((fila) => ({
            id: fila.placa,
            texto: <span className="num">{fila.placa}</span>,
            href: href("conductor", { placa: fila.placa }),
            actual: fila.placa === actual,
          }))}
        />
      )}
    </div>
  );
}
