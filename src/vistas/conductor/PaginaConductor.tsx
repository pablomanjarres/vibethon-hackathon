import { useState } from "react";
import { Banknote, Car, KeyRound, ListOrdered, LogIn, MapPin, ParkingSquare, Ticket, Timer } from "lucide-react";
import { vistaConductor } from "../../parqueadero/lecturas/conductor";
import { carros } from "../../parqueadero/lecturas/formato";
import type { Estado } from "../../parqueadero/tipos";
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
import { IngresoConductor } from "./IngresoConductor";
import { RegistroLlegada } from "./RegistroLlegada";
import { Ficho } from "./Ficho";
import { ProgresoValet } from "./ProgresoValet";
import { Pronostico } from "./Pronostico";
import "./conductor.css";

/** The driver panel for one plate, or the plate picker when there is none. */
interface Props {
  placa: string | null;
  /** The access code; without the right one the driver sees nothing about the car. */
  codigo: string;
  /** Carried over from check-in: the new code and the engine's confirmation. */
  registro: { codigo: string; texto: string } | null;
  onRegistrada: (placa: string, codigo: string, texto: string) => void;
}

export function PaginaConductor({ placa, codigo, registro, onRegistrada }: Props) {
  const estado = useEstado();
  const { aviso, enviar } = useComando();
  const [elegida, setElegida] = useState<string | null>(null);
  const v = placa ? vistaConductor(estado, placa, codigo) : null;
  const [fichoAbierto, setFichoAbierto] = useState(() => Boolean(v && pasos(v).some((paso) => paso.seccion === "ficho")));
  const libres = estado.celdas.filter((c) => c.estado === "libre").length;
  const contador = { valor: `${libres}/${estado.celdas.length}`, etiqueta: "Libres" };

  if (!v) {
    return (
      <Shell vista="conductor" seleccion={elegida} onSeleccionar={setElegida} privado>
        <PanelCabecera
          Icono={Car}
          titulo="Registra tu placa para guardar tu puesto"
          subtitulo="Llegaste a EAFIT: elige tu entrada y entras a la fila."
          cerrar={{ href: href(""), etiqueta: "Volver al inicio" }}
        />
        <RegistroLlegada estado={estado} onRegistrada={onRegistrada} />
        <TarjetaDatos Icono={ParkingSquare} titulo="Lote EAFIT ahora" contador={contador}>
          <p className="ui-texto-suave">La celda la asigna el orden de llegada entre ambas entradas: quien llegó primero, entra primero.</p>
        </TarjetaDatos>
        <div>
          <Acordeon Icono={LogIn} titulo="Ya me registré">
            <IngresoConductor />
          </Acordeon>
        </div>
      </Shell>
    );
  }

  const carro = v.encontrado ? estado.carros[v.placa] : undefined;
  const servicio = carro?.servicio ? estado.servicios[carro.servicio] : null;
  const siguientes = pasos(v);
  const libresSet = new Set(v.celdasLibres);
  const reservable = v.puedeReservar && elegida && libresSet.has(elegida) ? elegida : null;
  const minutosEstacionado = carro?.estacionadoEn != null ? estado.minuto - carro.estacionadoEn : null;
  const lugar = lugarEnFila(estado, v.placa);

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
            : v.estado === "en espera"
              ? "primero entras al pasaje, apenas haya cupo."
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
    <Shell vista="conductor" seleccion={reservable ?? elegida ?? v.celda} onSeleccionar={setElegida} enfoque={v.celda} privado>
      <PanelCabecera
        Icono={Car}
        titulo={v.placa}
        subtitulo={v.entrada ? `Entrada ${v.entrada}` : "Conductor"}
        cerrar={{ href: href("conductor"), etiqueta: "Salir de mi puesto" }}
      />
      <FilaAcciones acciones={acciones} />
      <AvisoResultado aviso={aviso ?? (registro && { ok: true, texto: registro.texto })} />
      {registro?.codigo && (
        <TarjetaDatos Icono={KeyRound} titulo="Tu código">
          <p className="cd-codigo-acceso num">{registro.codigo}</p>
          <p className="ui-texto-suave">Guárdalo para ver tu puesto. Con tu placa y este código entras desde cualquier teléfono.</p>
        </TarjetaDatos>
      )}
      {!v.encontrado && <IngresoConductor placa={v.placa} />}
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
              ...(lugar ? [{ etiqueta: "Tu lugar", valor: lugar }] : []),
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

/** Where the plate stands: its place in an entrance's passage or in the waiting line outside. */
function lugarEnFila(estado: Estado, placa: string): string | null {
  for (const entrada of estado.entradas) {
    const enPasaje = entrada.fila.indexOf(placa);
    if (enPasaje >= 0) return `${enPasaje + 1}.º en el pasaje de ${entrada.nombre}`;
    const enEspera = (entrada.espera ?? []).indexOf(placa);
    if (enEspera >= 0) return `${enEspera + 1}.º en la fila de espera de ${entrada.nombre}`;
  }
  return null;
}
