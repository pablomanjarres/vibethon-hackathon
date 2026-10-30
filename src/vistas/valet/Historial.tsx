import { Wallet } from "lucide-react";
import { hora } from "../../parqueadero/lecturas/formato";
import { Acordeon } from "../../ui/Acordeon";
import { Vacio } from "../../ui/Datos";
import { useEstado } from "../../ui/useTienda";

/** The valet's own services, each with the simulated income it credited. */
export function Historial({ valetId }: { valetId: string }) {
  const estado = useEstado();
  const dinero = (valor: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: estado.reglas.moneda, maximumFractionDigits: 0 }).format(valor);
  const propios = (estado.ingresos ?? []).filter((i) => i.valet === valetId).reverse();
  const total = propios.reduce((suma, i) => suma + i.monto, 0);
  return (
    <Acordeon Icono={Wallet} titulo="Mi historial" extra={`${propios.length} · ${dinero(total)}`}>
      {propios.length === 0 ? (
        <Vacio>Aún no tienes servicios con ingreso.</Vacio>
      ) : (
        <ul className="vl-historial">
          {propios.map((ingreso) => {
            const servicio = estado.servicios[ingreso.servicio];
            return (
              <li key={ingreso.id}>
                <span className="num">{hora(estado.inicio, ingreso.enMinuto)}</span>
                <strong className="num">{servicio?.placa ?? ingreso.servicio}</strong>
                <span className="num">Ficho {servicio?.ficho ?? "—"}</span>
                <span>{servicio?.estado ?? "Sin servicio"}</span>
                <strong className="num">{dinero(ingreso.monto)}</strong>
              </li>
            );
          })}
        </ul>
      )}
    </Acordeon>
  );
}
