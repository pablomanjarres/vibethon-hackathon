import { useEffect, useRef, useState } from "react";
import { CircleArrowRight, Clock3, DoorOpen, Hourglass, ListOrdered, LogOut, ParkingSquare, ScanLine, ShieldCheck, UsersRound } from "lucide-react";
import { vistaPorteria } from "../../parqueadero/lecturas/porteria";
import { registroCarros } from "../../parqueadero/lecturas/registro";
import { href, useRoute } from "../../shared/route";
import { Acordeon } from "../../ui/Acordeon";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Chips } from "../../ui/Chips";
import { Cifra, Vacio } from "../../ui/Datos";
import { ESTADO_VALET } from "../../ui/estados";
import { FilaAcciones, type AccionPanel } from "../../ui/FilaAcciones";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Pastilla } from "../../ui/Pastilla";
import { Shell } from "../../ui/Shell";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { useComando, useEstado } from "../../ui/useTienda";
import { BuscarPlaca } from "./BuscarPlaca";
import { ConfirmarIngreso } from "./ConfirmarIngreso";
import { DetallePorteria, type SeleccionPorteria } from "./DetallePorteria";
import { FilaPasaje } from "./FilaPasaje";
import { ResumenLote } from "./ResumenLote";
import "./porteria.css";

/**
 * One gate: whose turn it is and why, its passage and the line outside, then a plate search over this
 * entrance's cars with one detail open at a time. Drivers register themselves.
 */
export default function Porteria() {
  const estado = useEstado();
  const { params } = useRoute();
  const { aviso, enviar } = useComando();
  const [seleccion, setSeleccion] = useState<SeleccionPorteria | null>(null);
  const [esperaAbierta, setEsperaAbierta] = useState(false);
  const detalle = useRef<HTMLDivElement>(null);
  const campoConfirmar = useRef<HTMLInputElement>(null);
  const entradaId = estado.entradas.some((e) => e.id === params.get("entrada")) ? params.get("entrada")! : estado.entradas[0].id;
  const v = vistaPorteria(estado, entradaId);
  const carros = registroCarros(estado, entradaId);
  const valets = estado.valets.filter((x) => x.entrada === entradaId);
  const turno = v.esMiTurno
    ? { texto: "Tu turno", Icono: CircleArrowRight, tono: "libre" as const }
    : { texto: "En espera", Icono: Hourglass, tono: "reservada" as const };
  const elegirPlaca = (placa: string) => setSeleccion({ tipo: "carro", placa });
  const celdaElegida =
    seleccion?.tipo === "celda" ? seleccion.id : seleccion?.tipo === "carro" ? (estado.carros[seleccion.placa]?.celda ?? null) : null;
  const claveSeleccion = seleccion ? `${seleccion.tipo}:${seleccion.tipo === "carro" ? seleccion.placa : seleccion.id}` : null;

  const confirmar: AccionPanel | null =
    v.porConfirmar.length > 0
      ? { texto: `Confirmar a mano (${v.porConfirmar.length})`, Icono: ScanLine, onClick: () => campoConfirmar.current?.focus() }
      : null;
  const pasar: AccionPanel = v.puedeDejarSalir
    ? { texto: "Dejar salir", Icono: LogOut, onClick: () => enviar({ tipo: "dejarSalir", entrada: v.entrada }) }
    : {
        texto: v.puedeAsignar ? `Asignar ${v.celdasLibres[0]}` : "Asignar celda",
        Icono: ParkingSquare,
        onClick: () => enviar({ tipo: "asignarCelda", entrada: v.entrada }),
        motivo: v.puedeAsignar ? null : v.turno,
      };
  const espera: AccionPanel = {
    texto: `Fila de espera (${v.enEspera.length})`,
    Icono: Clock3,
    activa: esperaAbierta,
    onClick: () => setEsperaAbierta(!esperaAbierta),
  };
  // The camera confirms entries; the manual tile leads only while some car still needs it.
  const acciones = confirmar ? [confirmar, pasar, espera] : [pasar, espera];

  // Switching gates closes the open detail: it may belong to the other entrance.
  useEffect(() => setSeleccion(null), [entradaId]);
  useEffect(() => {
    if (claveSeleccion) detalle.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [claveSeleccion]);

  return (
    <Shell vista="porteria" seleccion={seleccion ? celdaElegida : (v.celdasLibres[0] ?? null)} onSeleccionar={(id) => setSeleccion({ tipo: "celda", id })}>
      <PanelCabecera
        Icono={ShieldCheck}
        titulo={`Portería ${v.nombre}`}
        subtitulo={`Pasaje ${v.pasaje.ocupados} de ${v.pasaje.capacidad} · ${v.enEspera.length} en espera afuera`}
        cerrar={{ href: href(""), etiqueta: "Volver al inicio" }}
      />
      <FilaAcciones acciones={acciones} />
      <AvisoResultado aviso={aviso} />
      <Chips
        etiqueta="Entradas"
        chips={estado.entradas.map((e) => ({ id: e.id, texto: e.nombre, href: href("porteria", { entrada: e.id }), actual: e.id === entradaId }))}
      />
      <ResumenLote estado={estado} actual={entradaId} />
      {v.porConfirmar.length > 0 && (
        <ConfirmarIngreso
          porConfirmar={v.porConfirmar}
          onConfirmar={(placa) => enviar({ tipo: "confirmarIngreso", entrada: v.entrada, placa })}
          inputRef={campoConfirmar}
        />
      )}
      <TarjetaDatos Icono={DoorOpen} titulo={`Pasaje ${v.nombre}`} contador={{ valor: v.celdasLibres.length, etiqueta: "Celdas libres" }}>
        <div className="ui-cifras">
          <Cifra valor={`${v.pasaje.ocupados}/${v.pasaje.capacidad}`} etiqueta="Pasaje" />
          <Cifra valor={v.enEspera.length} etiqueta="En espera afuera" />
          <Cifra valor={v.valetsDisponibles} etiqueta="Valets libres" />
        </div>
        <Pastilla {...turno} />
        <p className="pt-turno">{v.turno}</p>
      </TarjetaDatos>
      {seleccion && (
        <div ref={detalle} className="pt-ancla">
          <DetallePorteria estado={estado} v={v} seleccion={seleccion} onCerrar={() => setSeleccion(null)} />
        </div>
      )}
      <BuscarPlaca carros={carros} elegida={seleccion?.tipo === "carro" ? seleccion.placa : null} onElegir={elegirPlaca} />
      <div>
        <Acordeon Icono={ListOrdered} titulo="Fila del pasaje" extra={`${v.fila.length} de ${v.pasaje.capacidad}`}>
          <FilaPasaje fila={v.fila} onElegir={elegirPlaca} />
        </Acordeon>
        <Acordeon Icono={Clock3} titulo="Fila de espera afuera" extra={v.enEspera.length} abierto={esperaAbierta} onCambiar={setEsperaAbierta}>
          {v.enEspera.length === 0 ? (
            <Vacio>Nadie espera afuera: el pasaje tiene cupo o está vacío.</Vacio>
          ) : (
            <ol className="ui-lista pt-fila">
              {v.enEspera.map((placa, i) => (
                <li key={placa}>
                  <button type="button" className="pt-placa-fila" onClick={() => elegirPlaca(placa)}>
                    <span className="pt-pos num">{i + 1}</span>
                    <strong className="pt-placa num">{placa}</strong>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Acordeon>
        <Acordeon Icono={UsersRound} titulo="Valets" extra={valets.length}>
          {valets.length === 0 ? (
            <Vacio>Esta entrada no tiene valets.</Vacio>
          ) : (
            <ul className="ui-lista">
              {valets.map((valet) => (
                <li key={valet.id}>
                  <a className="pt-valet num" href={href("valet", { valet: valet.id })}>
                    Valet {valet.id}
                  </a>
                  <Pastilla {...ESTADO_VALET[valet.estado]} />
                </li>
              ))}
            </ul>
          )}
        </Acordeon>
      </div>
    </Shell>
  );
}
