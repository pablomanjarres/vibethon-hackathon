import { CarFront, X } from "lucide-react";
import type { detalleCarro } from "../../parqueadero/lecturas/registro";
import { Boton } from "../../ui/Boton";
import { Datos } from "../../ui/Datos";
import { Pastilla } from "../../ui/Pastilla";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { Bitacora } from "./Bitacora";
import { dinero, ESTADO_CARRO, horasCarro } from "./carro";

interface Props {
  carro: NonNullable<ReturnType<typeof detalleCarro>>;
  inicio: string;
  moneda: string;
  onCerrar: () => void;
}

/** One car opened up: where it is, its times, its valet service, its payment and every log entry about it. */
export function DetalleCarro({ carro, inicio, moneda, onCerrar }: Props) {
  return (
    <TarjetaDatos Icono={CarFront} titulo={`Carro ${carro.placa}`}>
      <Pastilla {...ESTADO_CARRO[carro.estado]} />
      <p className="ui-texto-suave num">{horasCarro(carro)}</p>
      <Datos
        filas={[
          { etiqueta: "Entrada", valor: carro.entrada },
          { etiqueta: "Celda", valor: carro.celda ?? "Sin celda" },
          { etiqueta: "Valet", valor: carro.valet ?? "Sin valet" },
          { etiqueta: "Ficho", valor: carro.ficho ?? "Sin ficho" },
          { etiqueta: "Pago", valor: carro.pagado ? (carro.monto === null ? "Pagado" : dinero(carro.monto, moneda)) : "Pendiente" },
        ]}
      />
      <h3 className="of-sub">Historial</h3>
      <Bitacora eventos={carro.historial} inicio={inicio} />
      <Boton variante="contorno" Icono={X} onClick={onCerrar}>
        Cerrar detalle
      </Boton>
    </TarjetaDatos>
  );
}
