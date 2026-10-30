import { Banknote, Car, Eye, KeyRound, ListOrdered, MapPin, Ticket, Timer } from "lucide-react";
import { vistaConductor } from "../../parqueadero/lecturas/conductor";
import { carros } from "../../parqueadero/lecturas/formato";
import type { Estado } from "../../parqueadero/tipos";
import { Boton } from "../../ui/Boton";
import { Datos, Vacio } from "../../ui/Datos";
import { FilaAcciones } from "../../ui/FilaAcciones";
import { MapaLote } from "../../ui/MapaLote";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { motivoValet, pasos } from "../conductor/acciones";
import { Ficho } from "../conductor/Ficho";
import { ProgresoValet } from "../conductor/ProgresoValet";
import { Pronostico } from "../conductor/Pronostico";
import "../conductor/conductor.css";

/**
 * What one driver sees on their phone, drawn from the same read model as the driver view. It is a
 * preview: the actions the driver has right now are shown, but none of them sends a command.
 */
export function PantallaConductor({ estado, placa }: { estado: Estado; placa: string }) {
  const v = vistaConductor(estado, placa);
  const carro = estado.carros[v.placa];
  const servicio = carro?.servicio ? estado.servicios[carro.servicio] : null;
  const mapa = estado.mapas[0];
  const libres = estado.celdas.filter((c) => c.estado === "libre").length;
  const minutosEstacionado = carro?.estacionadoEn != null ? estado.minuto - carro.estacionadoEn : null;
  const siguientes = pasos(v);

  if (!v.encontrado)
    return (
      <div className="tl-seccion">
        <PanelCabecera Icono={Car} titulo={v.placa} subtitulo="Conductor" />
        <Vacio>{v.mensaje}</Vacio>
      </div>
    );

  return (
    <>
      <div className="tl-seccion">
        <PanelCabecera Icono={Car} titulo={v.placa} subtitulo={v.entrada ? `Entrada ${v.entrada}` : "Conductor"} />
        <FilaAcciones
          acciones={[
            {
              texto: "Reservar celda",
              Icono: MapPin,
              motivo: v.puedeReservar ? null : v.celda ? `ya tienes la celda ${v.celda}.` : "aún no es tu turno de reservar.",
            },
            { texto: "Reservar valet", Icono: KeyRound, motivo: motivoValet(v) },
            { texto: "Mi ficho", Icono: Ticket, motivo: v.ficho ? null : "aún no tienes ficho; llega al pedir un valet." },
          ]}
        />
        <TarjetaDatos Icono={Timer} titulo={v.espera ? "Tu espera" : "Tu carro"} contador={{ valor: `${libres}/${estado.celdas.length}`, etiqueta: "Libres" }}>
          {v.espera && (
            <p className="cd-espera num">
              {v.espera.minutos}
              <span> min</span>
            </p>
          )}
          <p className="cd-mensaje">{v.mensaje}</p>
          {v.espera && (
            <p className="ui-texto-suave">
              {v.espera.carrosAdelante === 0 ? "Eres el siguiente en la fila." : `${carros(v.espera.carrosAdelante)} antes que tú, contando ambas entradas.`}
            </p>
          )}
          <Datos
            filas={[
              { etiqueta: "Celda", valor: v.celda ?? "Por asignar" },
              ...(minutosEstacionado !== null ? [{ etiqueta: "Estacionado hace", valor: `${minutosEstacionado} min` }] : []),
            ]}
          />
        </TarjetaDatos>
      </div>
      {mapa && (
        <div className="tl-mapa">
          <MapaLote
            nombre={mapa.nombre}
            celdas={estado.celdas.filter((c) => c.mapa === mapa.id)}
            entradas={estado.entradas}
            seleccion={v.celda}
            enfoque={v.celda}
          />
        </div>
      )}
      <div className="tl-seccion">
        <h2 className="tl-titulo">
          <ListOrdered size={18} aria-hidden="true" /> Turno y pasos
        </h2>
        {v.espera && carro ? (
          <Pronostico espera={v.espera} entrada={v.entrada} inicio={estado.inicio} minuto={estado.minuto} llegoEn={carro.llegoEn} />
        ) : (
          <p className="ui-texto-suave">{v.mensaje}</p>
        )}
        {servicio && <ProgresoValet estado={servicio.estado} />}
        <h2 className="tl-titulo">
          <Ticket size={18} aria-hidden="true" /> Ficho y llaves
        </h2>
        {v.ficho ? <Ficho ficho={v.ficho} placa={v.placa} celda={v.celda} valet={v.valet} /> : <Vacio>Sin ficho. Pide un valet y tu ficho aparece aquí.</Vacio>}
        <h2 className="tl-titulo">
          <Banknote size={18} aria-hidden="true" /> Pago y salida
        </h2>
        <Datos filas={[{ etiqueta: "Pago", valor: v.pagado ? "Pagado" : "Pendiente" }]} />
        {siguientes.length > 0 && (
          <div className="cd-botones">
            {siguientes.map((paso) => (
              <Boton key={paso.texto} Icono={paso.Icono} ancho aria-describedby="tl-vista-previa">
                {paso.texto}
              </Boton>
            ))}
          </div>
        )}
        <p className="tl-nota" id="tl-vista-previa">
          <Eye size={16} aria-hidden="true" /> Vista previa: los botones muestran lo que puede hacer el conductor, pero no envían nada.
        </p>
      </div>
    </>
  );
}
