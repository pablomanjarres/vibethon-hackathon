import { LayoutDashboard } from "lucide-react";
import { Cifra } from "../../ui/Datos";
import { ESTADO_VALET, type EstadoValetUi } from "../../ui/estados";
import { Pastilla } from "../../ui/Pastilla";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { dinero } from "./carro";
import type { ResumenOficina as Resumen } from "./resumen";

interface Props {
  resumen: Resumen;
  moneda: string;
  celdas: { libres: number; total: number };
}

/** The general picture for one office: passage, waiting line, cells, parked cars, exits, valets and payments. */
export function ResumenOficina({ resumen: r, moneda, celdas }: Props) {
  const lleno = r.capacidad > 0 && r.enPasaje >= r.capacidad;
  return (
    <TarjetaDatos Icono={LayoutDashboard} titulo="Ahora" contador={{ valor: `${celdas.libres}/${celdas.total}`, etiqueta: "Celdas libres" }}>
      <div className="ui-cifras of-cifras">
        <Cifra valor={`${r.enPasaje}/${r.capacidad}`} etiqueta="En el pasaje" detalle={lleno ? "Pasaje lleno" : undefined} />
        <Cifra valor={r.afuera} etiqueta="Esperando afuera" />
        <Cifra valor={r.estacionados} etiqueta="Estacionados" />
      </div>
      <div className="ui-cifras of-cifras">
        <Cifra valor={r.celdasEntregadas} etiqueta="Celdas entregadas" />
        <Cifra valor={r.salidas} etiqueta="Salidas hoy" />
        <Cifra valor={dinero(r.pagos.total, moneda)} etiqueta={r.pagos.cantidad === 1 ? "1 pago" : `${r.pagos.cantidad} pagos`} />
      </div>
      <ul className="of-pastillas" aria-label="Valets por estado">
        {(Object.keys(ESTADO_VALET) as EstadoValetUi[]).map((estado) => (
          <li key={estado}>
            <Pastilla {...ESTADO_VALET[estado]} texto={`${r.valets[estado] ?? 0} ${ESTADO_VALET[estado].texto.toLowerCase()}`} />
          </li>
        ))}
      </ul>
      <p className="ui-texto-suave">Toca un carro de la lista o una celda del mapa para ver su detalle.</p>
    </TarjetaDatos>
  );
}
