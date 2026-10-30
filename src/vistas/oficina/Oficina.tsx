import { useState } from "react";
import { vistaOficina } from "../../parqueadero/lecturas/oficina";
import { MapaLote } from "../../ui/MapaLote";
import { Shell } from "../../ui/Shell";
import { useEstado } from "../../ui/useTienda";
import { CeldasPorEstado } from "./CeldasPorEstado";
import { ControlesSimulacion } from "./ControlesSimulacion";
import { DetalleCelda } from "./DetalleCelda";
import { Bitacora, FichosActivos, LlavesYPagos } from "./Registros";
import { TableroEntradas } from "./TableroEntradas";
import "../../ui/panel.css";
import "./oficina.css";

/** The office desk: live entrances, every cell, fichos, keys, payments and the log, beside the lot map. */
export default function Oficina() {
  const estado = useEstado();
  const v = vistaOficina(estado);
  const celdas = v.mapas.flatMap((m) => m.celdas);
  const [elegida, setElegida] = useState<string | null>(null);
  const seleccion = celdas.find((c) => c.id === elegida) ?? celdas.find((c) => c.estado === "ocupada") ?? celdas[0] ?? null;

  return (
    <Shell vista="oficina" ancho>
      <div className="of-pila">
        <div className="of-cabeza">
          <div>
            <p className="ui-ceja">Oficina</p>
            <h1 className="ui-titulo">Parqueadero en vivo</h1>
          </div>
          <p className="ui-texto-suave num">
            {v.hora} · minuto {v.minuto}
          </p>
        </div>
        <ControlesSimulacion minuto={v.minuto} />
        <TableroEntradas entradas={v.entradas} />
        <div className="ui-mapa-panel of-rejilla">
          <div className="ui-panel-lateral">
            <CeldasPorEstado celdas={celdas} seleccion={seleccion?.id ?? null} onSeleccionar={setElegida} />
            <FichosActivos fichos={v.fichosActivos} />
            <LlavesYPagos llaves={v.llavesEnTablero} pagos={v.pagos} />
            <Bitacora eventos={v.bitacora} inicio={estado.inicio} />
          </div>
          <div className="of-mapa">
            <DetalleCelda celda={seleccion} fichos={v.fichosActivos} />
            {v.mapas.map((mapa) => (
              <MapaLote
                key={mapa.id}
                nombre={mapa.nombre}
                columnas={mapa.columnas}
                filas={mapa.filas}
                celdas={mapa.celdas}
                entradas={estado.entradas}
                seleccion={seleccion?.id ?? null}
                onSeleccionar={setElegida}
              />
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
