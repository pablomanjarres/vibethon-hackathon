import { Ticket } from "lucide-react";
import { estimarEspera } from "../../parqueadero/espera";
import { Datos } from "../../ui/Datos";
import { useEstado } from "../../ui/useTienda";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import type { Servicio } from "./pasos";

/** The valet's job at a glance: the cell biggest, then the plate, then ficho and entrance. */
export function TarjetaAsignacion({ servicio: s }: { servicio: Servicio }) {
  const estado = useEstado();
  const turno = estimarEspera(estado, s.placa)?.posicion ?? null;
  const sinCelda = !s.celda && s.estado !== "llaves en oficina";
  return (
    <TarjetaDatos Icono={Ticket} titulo={s.estado === "llaves en oficina" ? "Devuelve este carro" : "Tu asignación"} contador={{ valor: s.asignado, etiqueta: "Llegó" }}>
      <div className="vl-asignacion">
        <p className={sinCelda ? "vl-celda vl-sin-celda" : "vl-celda"}>
          <span className="vl-rotulo">Celda</span>
          <strong className="num">{s.celda ?? (sinCelda ? "Esperando celda" : "—")}</strong>
        </p>
        <p className="vl-placa">
          <span className="vl-rotulo">Placa</span>
          <strong className="num">{s.placa}</strong>
        </p>
      </div>
      <Datos
        filas={[
          { etiqueta: "Ficho", valor: s.ficho },
          { etiqueta: "Entrada", valor: s.entrada },
          { etiqueta: "Turno", valor: turno === null ? "Ya pasó la fila" : `Puesto ${turno}` },
          { etiqueta: "Pago", valor: s.estado === "pago pendiente" ? "Pendiente" : "Aprobado" },
        ]}
      />
    </TarjetaDatos>
  );
}
