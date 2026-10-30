import type { VistaConductor } from "../../parqueadero/lecturas/conductor";
import type { Estado } from "../../parqueadero/tipos";
import { Datos, Vacio } from "../../ui/Datos";
import { motivoValet } from "../conductor/acciones";
import { Ficho } from "../conductor/Ficho";
import { ProgresoValet } from "../conductor/ProgresoValet";
import { Pronostico } from "../conductor/Pronostico";
import { Deslizable } from "./Deslizable";

/** The driver's details in three swipeable tabs: turn, valet and ficho, payment. */
export function PestanasConductor({ estado, v }: { estado: Estado; v: VistaConductor }) {
  const carro = estado.carros[v.placa];
  const servicio = carro.servicio ? estado.servicios[carro.servicio] : null;
  const libres = estado.celdas.filter((c) => c.estado === "libre").length;
  const minutosEstacionado = carro.estacionadoEn != null ? estado.minuto - carro.estacionadoEn : null;
  const valet = motivoValet(v);
  return (
    <Deslizable
      pestanas={[
        {
          id: "turno",
          titulo: "Turno",
          contenido: (
            <>
              {v.espera ? (
                <Pronostico espera={v.espera} entrada={v.entrada} inicio={estado.inicio} minuto={estado.minuto} llegoEn={carro.llegoEn} />
              ) : (
                <p className="ui-texto-suave">{v.mensaje}</p>
              )}
              <Datos filas={[{ etiqueta: "Celdas libres en el lote", valor: `${libres} de ${estado.celdas.length}` }]} />
            </>
          ),
        },
        {
          id: "valet",
          titulo: "Valet",
          contenido: v.ficho ? (
            <>
              {servicio && <ProgresoValet estado={servicio.estado} />}
              <Ficho ficho={v.ficho} placa={v.placa} celda={v.celda} valet={v.valet} />
            </>
          ) : (
            <Vacio>Sin ficho. {valet ? `Reservar valet: ${valet}` : "Puedes reservar un valet ahora."}</Vacio>
          ),
        },
        {
          id: "pago",
          titulo: "Pago",
          contenido: (
            <>
              <Datos
                filas={[
                  { etiqueta: "Pago", valor: v.pagado ? "Pagado" : "Pendiente" },
                  ...(minutosEstacionado !== null ? [{ etiqueta: "Estacionado hace", valor: `${minutosEstacionado} min` }] : []),
                ]}
              />
              <p className="ui-texto-suave">Pagas cuando tu carro ya está en la celda; luego sales.</p>
            </>
          ),
        },
      ]}
    />
  );
}
