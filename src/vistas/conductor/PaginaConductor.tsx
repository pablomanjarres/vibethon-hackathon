import { useState } from "react";
import { Banknote, Car, KeyRound, ListOrdered, MapPin, ParkingSquare, Ticket, Timer } from "lucide-react";
import { vistaConductor } from "../../parqueadero/lecturas/conductor";
import { carros } from "../../parqueadero/lecturas/formato";
import { href } from "../../shared/route";
import { Acordeon } from "../../ui/Acordeon";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { Datos, Vacio } from "../../ui/Datos";
import { FilaAcciones, type AccionPanel } from "../../ui/FilaAcciones";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Shell } from "../../ui/Shell";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { useComando, useEstado } from "../../ui/useTienda";
import { motivoValet, pasos, type Seccion } from "./acciones";
import { ElegirPlaca } from "./ElegirPlaca";
import { Ficho } from "./Ficho";
import { ProgresoValet } from "./ProgresoValet";
import { Pronostico } from "./Pronostico";
import "./conductor.css";

/** The driver panel for one plate, or the plate picker when there is none. */
export function PaginaConductor({ placa }: { placa: string | null }) {
  const estado = useEstado();
  const { aviso, enviar } = useComando();
  const [elegida, setElegida] = useState<string | null>(null);
  const v = placa ? vistaConductor(estado, placa) : null;
  const [fichoAbierto, setFichoAbierto] = useState(() => Boolean(v && pasos(v).some((paso) => paso.seccion === "ficho")));
  const libres = estado.celdas.filter((c) => c.estado === "libre").length;
  const contador = { valor: `${libres}/${estado.celdas.length}`, etiqueta: "Libres" };

  if (!v) {
    return (
      <Shell vista="conductor" seleccion={elegida} onSeleccionar={setElegida}>
        <PanelCabecera Icono={Car} titulo="Conductor" subtitulo="Reserva tu celda o tu valet en EAFIT" cerrar={{ href: href(""), etiqueta: "Volver al inicio" }} />
        <ElegirPlaca estado={estado} actual={null} />
        <TarjetaDatos Icono={ParkingSquare} titulo="Lote EAFIT ahora" contador={contador}>
          <p className="ui-texto-suave">Escribe tu placa para ver tu turno, reservar una celda o pedir un valet.</p>
        </TarjetaDatos>
      </Shell>
    );
  }

  const carro = estado.carros[v.placa];
  const servicio = carro?.servicio ? estado.servicios[carro.servicio] : null;
  const siguientes = pasos(v);
  const libresSet = new Set(v.celdasLibres);
  const reservable = v.puedeReservar && elegida && libresSet.has(elegida) ? elegida : null;
  const minutosEstacionado = carro?.estacionadoEn != null ? estado.minuto - carro.estacionadoEn : null;

  const acciones: AccionPanel[] = [
    {
      texto: reservable ? `Reservar ${reservable}` : "Reservar celda",
      Icono: MapPin,
      onClick: () => reservable && enviar({ tipo: "reservarCelda", placa: v.placa, celda: reservable }),
      motivo: !v.puedeReservar
        ? v.celda
          ? `ya tienes la celda ${v.celda}.`
          : v.estado === "en fila"
            ? "aún no es tu turno de reservar."
            : "solo se reserva desde la fila."
        : reservable
          ? null
          : "toca una celda libre (verde) en el mapa.",
    },
    { texto: "Reservar valet", Icono: KeyRound, onClick: () => enviar({ tipo: "pedirValet", placa: v.placa }) && setFichoAbierto(true), motivo: motivoValet(v) },
    {
      texto: "Mi ficho",
      Icono: Ticket,
      activa: v.ficho ? fichoAbierto : undefined,
      onClick: () => {
        setFichoAbierto(!fichoAbierto);
        if (!fichoAbierto) requestAnimationFrame(() => document.getElementById("cd-ficho")?.scrollIntoView({ block: "nearest" }));
      },
      motivo: v.ficho ? null : "aún no tienes ficho; llega al pedir un valet.",
    },
  ];

  const botones = (seccion: Seccion) => {
    const lista = siguientes.filter((paso) => paso.seccion === seccion);
    return (
      lista.length > 0 && (
        <div className="cd-botones">
          {lista.map((paso) => (
            <Boton key={paso.texto} Icono={paso.Icono} ancho onClick={() => enviar(paso.comando)}>
              {paso.texto}
            </Boton>
          ))}
        </div>
      )
    );
  };
  const tiene = (seccion: Seccion) => siguientes.some((paso) => paso.seccion === seccion);

  return (
    <Shell vista="conductor" seleccion={reservable ?? elegida ?? v.celda} onSeleccionar={setElegida} enfoque={v.celda}>
      <PanelCabecera
        Icono={Car}
        titulo={v.placa}
        subtitulo={v.entrada ? `Entrada ${v.entrada}` : "Conductor"}
        cerrar={{ href: href("conductor"), etiqueta: "Cambiar de placa" }}
      />
      <FilaAcciones acciones={acciones} />
      <AvisoResultado aviso={aviso} />
      {!v.encontrado && <ElegirPlaca estado={estado} actual={v.placa} />}
      <TarjetaDatos Icono={Timer} titulo={v.espera ? "Tu espera" : "Tu carro"} contador={contador}>
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
        {v.encontrado && (
          <Datos
            filas={[
              { etiqueta: "Celda", valor: v.celda ?? "Por asignar" },
              ...(minutosEstacionado !== null ? [{ etiqueta: "Estacionado hace", valor: `${minutosEstacionado} min` }] : []),
            ]}
          />
        )}
      </TarjetaDatos>
      {v.encontrado && (
        <div>
          <Acordeon Icono={ListOrdered} titulo="Turno y pasos" inicial={tiene("turno") || Boolean(v.espera)}>
            {v.espera && carro ? (
              <Pronostico espera={v.espera} entrada={v.entrada} inicio={estado.inicio} minuto={estado.minuto} llegoEn={carro.llegoEn} />
            ) : (
              <p className="ui-texto-suave">{v.mensaje}</p>
            )}
            {servicio && <ProgresoValet estado={servicio.estado} />}
            {botones("turno")}
          </Acordeon>
          <Acordeon
            id="cd-ficho"
            Icono={Ticket}
            titulo="Ficho y llaves"
            extra={v.ficho ?? undefined}
            abierto={fichoAbierto}
            onCambiar={setFichoAbierto}
          >
            {v.ficho ? <Ficho ficho={v.ficho} placa={v.placa} celda={v.celda} valet={v.valet} /> : <Vacio>Sin ficho. Pide un valet y tu ficho aparece aquí.</Vacio>}
            {botones("ficho")}
          </Acordeon>
          <Acordeon Icono={Banknote} titulo="Pago y salida" extra={v.pagado ? "Pagado" : "Pendiente"} inicial={tiene("pago")}>
            <Datos filas={[{ etiqueta: "Pago", valor: v.pagado ? "Pagado" : "Pendiente" }]} />
            {botones("pago")}
            {!tiene("pago") && <p className="ui-texto-suave">Pagas cuando tu carro ya está en la celda; luego sales.</p>}
          </Acordeon>
        </div>
      )}
    </Shell>
  );
}
