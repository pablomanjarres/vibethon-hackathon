import { ChevronRight, Search } from "lucide-react";
import type { Estado } from "../../parqueadero/tipos";
import { href, setParams } from "../../shared/route";
import { CampoPlaca } from "../../ui/CampoPlaca";
import { Tarjeta, Vacio } from "../../ui/Tarjeta";

/** Plate entry plus the cars in line right now, one row each like a guest list. */
export function ElegirPlaca({ estado, actual }: { estado: Estado; actual: string | null }) {
  const filas = estado.entradas.flatMap((entrada) => entrada.fila.map((placa, i) => ({ placa, entrada: entrada.nombre, puesto: i + 1 })));
  return (
    <Tarjeta titulo="¿Cuál es tu placa?" Icono={Search}>
      <CampoPlaca etiqueta="Placa del carro" accion="Ver mi lugar" Icono={Search} onEnviar={(valor) => setParams({ placa: valor }, { push: true })} />
      <div className="cd-lista">
        <p className="ui-texto-suave">Carros en los pasajes ahora</p>
        {filas.length === 0 ? (
          <Vacio>No hay carros en los pasajes.</Vacio>
        ) : (
          <ul>
            {filas.map((fila) => (
              <li key={fila.placa}>
                <a href={href("conductor", { placa: fila.placa })} aria-current={fila.placa === actual ? "true" : undefined}>
                  <span className="cd-lista-placa num">{fila.placa}</span>
                  <span className="ui-texto-suave">
                    {fila.entrada} · puesto {fila.puesto}
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Tarjeta>
  );
}
