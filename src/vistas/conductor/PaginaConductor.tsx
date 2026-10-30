import { useState } from "react";
import { Car, ListOrdered, LogIn, ParkingSquare, Timer } from "lucide-react";
import { vistaConductor } from "../../parqueadero/lecturas/conductor";
import { vistaLlegada } from "../../parqueadero/lecturas/llegada";
import { href } from "../../shared/route";
import { Acordeon } from "../../ui/Acordeon";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Shell } from "../../ui/Shell";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { useComando, useEstado } from "../../ui/useTienda";
import { pasoActual } from "./acciones";
import { AccionesPaso } from "./AccionesPaso";
import { DetallesConductor } from "./DetallesConductor";
import { EstadoPaso } from "./EstadoPaso";
import { IngresoConductor } from "./IngresoConductor";
import { RegistroLlegada } from "./RegistroLlegada";
import "./conductor.css";

/** The driver panel for one plate, or the check-in when there is none. */
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
  const libres = estado.celdas.filter((c) => c.estado === "libre").length;
  const contador = { valor: `${libres}/${estado.celdas.length}`, etiqueta: "Libres" };

  if (!v) {
    const llegada = vistaLlegada(estado);
    return (
      <Shell vista="conductor" seleccion={elegida} onSeleccionar={setElegida} privado>
        <PanelCabecera Icono={Car} titulo="Guarda tu puesto" subtitulo="Tu placa y tu entrada, y entras a la fila." cerrar={{ href: href(""), etiqueta: "Volver al inicio" }} />
        <RegistroLlegada estado={estado} onRegistrada={onRegistrada} />
        <TarjetaDatos Icono={ParkingSquare} titulo="Lote EAFIT ahora" contador={{ valor: `${llegada.celdasLibres}/${llegada.celdasTotal}`, etiqueta: "Libres" }}>
          <p className="ui-texto-suave">
            <strong className="cd-mensaje">
              {llegada.entradas.map((e) => `${e.nombre} ${e.dentro}/${e.capacidad}${e.afuera > 0 ? ` (+${e.afuera} afuera)` : ""}`).join(" · ")} en el pasaje.
            </strong>{" "}
            {llegada.regla}
          </p>
        </TarjetaDatos>
        <div>
          <Acordeon Icono={LogIn} titulo="Ya me registré">
            <IngresoConductor />
          </Acordeon>
        </div>
      </Shell>
    );
  }

  const paso = pasoActual(v, elegida);
  const reservable = paso.principal?.comando.tipo === "reservarCelda" ? paso.principal.comando.celda : null;

  return (
    <Shell vista="conductor" seleccion={reservable ?? v.celda} onSeleccionar={setElegida} enfoque={v.celda} privado>
      <PanelCabecera Icono={Car} titulo={v.placa} subtitulo={v.entrada ? `Entrada ${v.entrada}` : "Conductor"} cerrar={{ href: href("conductor"), etiqueta: "Salir de mi puesto" }} />
      <AvisoResultado aviso={aviso ?? (registro && { ok: true, texto: registro.texto })} />
      {v.encontrado ? (
        <TarjetaDatos Icono={Timer} titulo={v.espera ? "Tu turno" : "Tu carro"} contador={contador}>
          <EstadoPaso v={v} />
          {registro?.codigo && (
            <p className="cd-codigo-linea">
              Tu código <strong className="num">{registro.codigo}</strong> · con tu placa entras desde otro teléfono
            </p>
          )}
          <AccionesPaso paso={paso} onEnviar={enviar} />
        </TarjetaDatos>
      ) : (
        <IngresoConductor placa={v.placa} />
      )}
      {v.encontrado && (
        <div>
          <Acordeon Icono={ListOrdered} titulo="Detalles" extra={v.ficho ? `Ficho ${v.ficho}` : undefined}>
            <DetallesConductor estado={estado} v={v} />
          </Acordeon>
        </div>
      )}
    </Shell>
  );
}
