import { CarFront, MapPin, X } from "lucide-react";
import { hora } from "../../parqueadero/lecturas/formato";
import type { VistaPorteria } from "../../parqueadero/lecturas/porteria";
import { detalleCarro, detalleCelda, type RegistroCarro } from "../../parqueadero/lecturas/registro";
import type { Estado } from "../../parqueadero/tipos";
import { Datos, Vacio } from "../../ui/Datos";
import { ESTADO_CELDA } from "../../ui/estados";
import { Pastilla } from "../../ui/Pastilla";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { ESTADO_CARRO } from "./estadoCarro";

/** What the gate has open: one plate from the search, or one cell from the map. */
export type SeleccionPorteria = { tipo: "carro"; placa: string } | { tipo: "celda"; id: string };

const HISTORIAL = 6;

interface Props {
  estado: Estado;
  v: VistaPorteria;
  seleccion: SeleccionPorteria;
  onCerrar: () => void;
}

/** Where a car is and why, in the words the operator says to its driver. */
function explicacion(carro: RegistroCarro, v: VistaPorteria): string {
  switch (carro.estado) {
    case "en espera": {
      const puesto = v.enEspera.indexOf(carro.placa) + 1;
      return `Espera afuera, puesto ${puesto} de ${v.enEspera.length}: el pasaje está lleno (${v.pasaje.ocupados} de ${v.pasaje.capacidad}).`;
    }
    case "en fila": {
      const puesto = v.fila.findIndex((c) => c.placa === carro.placa) + 1;
      return puesto === 1 ? `Primero en el pasaje. ${v.turno}` : `Puesto ${puesto} en el pasaje; entra cuando pasen los ${puesto - 1} de adelante.`;
    }
    case "con celda":
      return `Tiene la celda ${carro.celda} y va en camino.`;
    case "estacionado":
      return `Está estacionado en la celda ${carro.celda}.`;
    case "en devolución":
      return "El valet lo está devolviendo a su conductor.";
    case "retirado":
      return "Ya salió del lote.";
  }
}

/** The one open detail: a car (state, cell, valet, ficho, payment, history) or an empty or foreign cell. */
export function DetallePorteria({ estado, v, seleccion, onCerrar }: Props) {
  const celda = seleccion.tipo === "celda" ? detalleCelda(estado, seleccion.id) : null;
  const propio = (c: RegistroCarro | null) => c !== null && (c.entradaId === v.entrada || c.entradaId === null);
  const placa = seleccion.tipo === "carro" ? seleccion.placa : propio(celda?.carro ?? null) ? celda!.carro!.placa : null;
  const carro = placa ? detalleCarro(estado, placa) : null;
  const cerrar = (
    <button type="button" className="pt-cerrar" onClick={onCerrar} aria-label="Cerrar detalle" title="Cerrar detalle">
      <X size={18} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );

  if (carro)
    return (
      <div className="pt-detalle" role="region" aria-label={`Detalle de ${carro.placa}`}>
        <TarjetaDatos Icono={CarFront} titulo={celda ? `Celda ${celda.celda.id} · ${carro.placa}` : `Placa ${carro.placa}`}>
          <Pastilla {...ESTADO_CARRO[carro.estado]} />
          <p className="pt-turno">{explicacion(carro, v)}</p>
          <Datos
            filas={[
              { etiqueta: "Celda", valor: carro.celda ?? "Sin celda" },
              { etiqueta: "Entrada", valor: carro.entrada },
              { etiqueta: "Llegó", valor: carro.llego },
              { etiqueta: "Estacionó", valor: carro.estacionado ?? "—" },
              { etiqueta: "Salió", valor: carro.salio ?? "—" },
              { etiqueta: "Valet", valor: carro.valet ?? "Sin valet" },
              { etiqueta: "Ficho", valor: carro.ficho ?? "Sin ficho" },
              { etiqueta: "Pago", valor: carro.pagado ? "Pagado" : "Pendiente" },
            ]}
          />
          <h3 className="pt-seccion">Historial</h3>
          {carro.historial.length === 0 ? (
            <Vacio>Sin movimientos registrados.</Vacio>
          ) : (
            <ol className="ui-lista pt-historial">
              {carro.historial.slice(0, HISTORIAL).map((evento, i) => (
                <li key={i}>
                  <span className="num pt-hora">{hora(estado.inicio, evento.minuto)}</span>
                  <span>{evento.detalle}</span>
                </li>
              ))}
            </ol>
          )}
        </TarjetaDatos>
        {cerrar}
      </div>
    );

  if (!celda) return null;
  const ocupante = celda.carro;
  const texto = ocupante
    ? `Apartada u ocupada por un carro de la entrada ${ocupante.entrada}; esa portería tiene su detalle.`
    : celda.celda.estado === "libre"
      ? "Libre: lista para el siguiente carro con turno."
      : "Apartada, sin placa registrada todavía.";
  return (
    <div className="pt-detalle" role="region" aria-label={`Detalle de la celda ${celda.celda.id}`}>
      <TarjetaDatos Icono={MapPin} titulo={`Celda ${celda.celda.id}`}>
        <Pastilla {...ESTADO_CELDA[celda.celda.estado]} />
        <p className="ui-texto-suave">{texto}</p>
        <Datos filas={[{ etiqueta: "Zona", valor: celda.celda.zona }]} />
      </TarjetaDatos>
      {cerrar}
    </div>
  );
}
