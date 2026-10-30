import type { VistaConductor } from "../../parqueadero/lecturas/conductor";
import type { EstadoServicio } from "../../parqueadero/tipos";
import { ProgresoValet } from "./ProgresoValet";

interface Props {
  servicio: NonNullable<VistaConductor["servicio"]>;
  /** Minutes left before the held valet is released, while the payment is pending. */
  restantes: number | null;
}

/** What the driver sees beside the valet step's action: the hold, the ficho in big type, or the progress. */
export function PasoValet({ servicio, restantes }: Props) {
  const estado = servicio.estado as EstadoServicio;
  if (estado === "pago pendiente")
    return (
      <p className="cd-valet-nota">
        Pago simulado de <span className="num">{servicio.precio}</span> COP. {servicio.valet} queda apartado
        {restantes !== null ? <> <span className="num">{restantes}</span> min más.</> : " 2 min."}
      </p>
    );
  if (estado === "pagado") return <p className="cd-valet-titulo">El valet va hacia ti</p>;
  if (estado === "ficho emitido")
    return (
      <div className="cd-valet-ficho">
        <span className="ui-texto-suave">Tu ficho</span>
        <strong className="num">{servicio.ficho}</strong>
      </div>
    );
  return (
    <>
      {estado !== "llaves en oficina" && <p className="cd-valet-titulo">Ve a clase</p>}
      <ProgresoValet estado={estado} />
    </>
  );
}
