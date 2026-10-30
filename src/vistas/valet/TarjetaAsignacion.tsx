import { Ticket } from "lucide-react";
import { Datos } from "../../ui/Datos";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import type { Servicio } from "./pasos";

/** The valet's job at a glance: the cell biggest, then the plate, then ficho and entrance. */
export function TarjetaAsignacion({ servicio: s }: { servicio: Servicio }) {
  return (
    <TarjetaDatos Icono={Ticket} titulo={s.estado === "llaves en oficina" ? "Devuelve este carro" : "Tu asignación"} contador={{ valor: s.asignado, etiqueta: "Llegó" }}>
      <div className="vl-asignacion">
        <p className="vl-celda">
          <span className="vl-rotulo">Celda</span>
          <strong className="num">{s.celda ?? "Por asignar"}</strong>
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
        ]}
      />
    </TarjetaDatos>
  );
}
