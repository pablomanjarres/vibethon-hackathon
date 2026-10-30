import type { Estado } from "../../parqueadero/tipos";
import { Vacio } from "../../ui/Datos";
import { dinero } from "./carro";

/** Each valet income with its service, valet and amount, and the total. */
export function IngresosValet({ estado }: { estado: Estado }) {
  const ingresos = estado.ingresos ?? [];
  const moneda = estado.reglas.moneda;
  if (ingresos.length === 0) return <Vacio>Aún no hay pagos de valet.</Vacio>;
  const total = ingresos.reduce((suma, i) => suma + i.monto, 0);
  return (
    <ul className="of-lineas">
      {ingresos.map((i) => (
        <li key={i.id}>
          <span className="num">{i.servicio}</span>
          <span className="num">{i.valet}</span>
          <strong className="num">{dinero(i.monto, moneda)}</strong>
        </li>
      ))}
      <li className="of-total">
        <span>Total</span>
        <strong className="num">{dinero(total, moneda)}</strong>
      </li>
    </ul>
  );
}
