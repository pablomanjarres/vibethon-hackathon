import type { VistaConductor } from "../../parqueadero/lecturas/conductor";
import type { Estado } from "../../parqueadero/tipos";
import { Datos } from "../../ui/Datos";
import { Ficho } from "./Ficho";
import { ProgresoValet } from "./ProgresoValet";
import { Pronostico } from "./Pronostico";

/** The details behind the collapsed section: route, forecast, valet progress, ficho and payment. */
export function DetallesConductor({ estado, v }: { estado: Estado; v: VistaConductor }) {
  const carro = estado.carros[v.placa];
  if (!carro) return null;
  const servicio = carro.servicio ? estado.servicios[carro.servicio] : null;
  const minutosEstacionado = carro.estacionadoEn != null ? estado.minuto - carro.estacionadoEn : null;
  return (
    <div className="cd-detalles">
      {v.destino && <p className="ui-texto-suave">{v.destino.ruta}</p>}
      {v.espera && <Pronostico espera={v.espera} entrada={v.entrada} inicio={estado.inicio} minuto={estado.minuto} llegoEn={carro.llegoEn} />}
      {servicio && <ProgresoValet estado={servicio.estado} />}
      {v.ficho && <Ficho ficho={v.ficho} placa={v.placa} celda={v.celda} valet={v.valet} />}
      <Datos
        filas={[
          { etiqueta: "Celda", valor: v.celda ? `${v.celda}${v.confirmado ? " · confirmada" : ""}` : "Por asignar" },
          { etiqueta: "Pago", valor: v.pagado ? "Pagado" : "Pendiente" },
          ...(minutosEstacionado !== null ? [{ etiqueta: "Estacionado hace", valor: `${minutosEstacionado} min` }] : []),
        ]}
      />
    </div>
  );
}
