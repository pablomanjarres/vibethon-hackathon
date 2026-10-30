import { MapPin } from "lucide-react";
import type { VistaOficina } from "../../parqueadero/lecturas/oficina";
import type { Celda } from "../../parqueadero/tipos";
import { ESTADO_CELDA } from "../../ui/estados";
import { Pastilla } from "../../ui/Pastilla";
import { Datos } from "../../ui/Datos";
import { TarjetaDatos } from "../../ui/TarjetaDatos";

interface Props {
  celda: Celda | null;
  fichos: VistaOficina["fichosActivos"];
}

/** The selected cell: its state, its plate and the valet service attached to that plate. */
export function DetalleCelda({ celda, fichos }: Props) {
  if (!celda) return <p className="ui-texto-suave">Toca un pin del mapa o una celda de la lista para ver su detalle.</p>;
  const servicio = celda.placa ? fichos.find((f) => f.placa === celda.placa) : undefined;
  const detalle = {
    libre: "Lista para el siguiente carro en la fila.",
    reservada: "Apartada para un carro que va en camino.",
    ocupada: "Hay un carro estacionado.",
  }[celda.estado];
  return (
    <TarjetaDatos Icono={MapPin} titulo={`Celda ${celda.id}`}>
      <Pastilla {...ESTADO_CELDA[celda.estado]} />
      <p className="ui-texto-suave">{detalle}</p>
      <Datos
        filas={[
          { etiqueta: "Zona", valor: celda.zona },
          { etiqueta: "Placa", valor: celda.placa ?? "Sin carro" },
          { etiqueta: "Ficho", valor: servicio ? `${servicio.ficho} · ${servicio.estado}` : "Sin ficho" },
          { etiqueta: "Valet", valor: servicio?.valet ?? "Sin valet" },
        ]}
      />
    </TarjetaDatos>
  );
}
