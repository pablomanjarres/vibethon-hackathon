import type { VistaConductor } from "../../parqueadero/lecturas/conductor";
import type { Estado, EstadoServicio } from "../../parqueadero/tipos";
import { Datos } from "../../ui/Datos";
import { Ficho } from "./Ficho";
import { ProgresoValet } from "./ProgresoValet";
import { Pronostico } from "./Pronostico";

/** The details behind the collapsed section: route, forecast, valet progress, ficho and payment. */
export function DetallesConductor({ estado, v }: { estado: Estado; v: VistaConductor }) {
  const carro = estado.carros[v.placa];
  if (!carro) return null;
  const minutosEstacionado = carro.estacionadoEn != null ? estado.minuto - carro.estacionadoEn : null;
  return (
    <div className="cd-detalles">
      {v.destino && <p className="ui-texto-suave">{v.destino.ruta}</p>}
      {v.espera && (
        <Pronostico espera={v.espera} entrada={v.entrada} enPasaje={v.estado === "en fila"} inicio={estado.inicio} minuto={estado.minuto} llegoEn={carro.llegoEn} />
      )}
      {v.servicio && <ProgresoValet estado={v.servicio.estado as EstadoServicio} />}
      {v.servicio && <Ficho ficho={v.servicio.ficho} placa={v.placa} celda={v.celda} valet={v.servicio.valet} estado={v.servicio.estado as EstadoServicio} />}
      <Datos
        filas={[
          { etiqueta: "Celda", valor: v.celda ? `${v.celda}${v.confirmado ? " · confirmada" : ""}` : "Por asignar" },
          ...(v.pagado || v.estado === "estacionado" ? [{ etiqueta: "Pago", valor: v.pagado ? "Pagado" : "Pendiente" }] : []),
          ...(minutosEstacionado !== null ? [{ etiqueta: "Estacionado hace", valor: `${minutosEstacionado} min` }] : []),
        ]}
      />
    </div>
  );
}
