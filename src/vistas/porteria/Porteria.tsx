import { useRef, useState } from "react";
import { CircleArrowRight, DoorOpen, Hourglass, ListOrdered, ParkingSquare, ScanLine, ShieldCheck, UsersRound } from "lucide-react";
import { vistaPorteria } from "../../parqueadero/lecturas/porteria";
import { href, useRoute } from "../../shared/route";
import { Acordeon } from "../../ui/Acordeon";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Chips } from "../../ui/Chips";
import { Cifra, Vacio } from "../../ui/Datos";
import { ESTADO_VALET } from "../../ui/estados";
import { FilaAcciones } from "../../ui/FilaAcciones";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Pastilla } from "../../ui/Pastilla";
import { Shell } from "../../ui/Shell";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { useComando, useEstado } from "../../ui/useTienda";
import { FilaPasaje } from "./FilaPasaje";
import { Registro } from "./Registro";
import "./porteria.css";

/** One gate: whose turn it is and why, the plate camera, the passage line and its valets, over the lot. */
export default function Porteria() {
  const estado = useEstado();
  const { params } = useRoute();
  const { aviso, enviar } = useComando();
  const [elegida, setElegida] = useState<string | null>(null);
  const [registroAbierto, setRegistroAbierto] = useState(false);
  const campo = useRef<HTMLInputElement>(null);
  const entradaId = estado.entradas.some((e) => e.id === params.get("entrada")) ? params.get("entrada")! : estado.entradas[0].id;
  const v = vistaPorteria(estado, entradaId);
  const indice = estado.entradas.findIndex((e) => e.id === entradaId);
  const otra = estado.entradas.length > 1 ? estado.entradas[(indice + 1) % estado.entradas.length] : null;
  const valets = estado.valets.filter((x) => x.entrada === entradaId);
  const turno = v.esMiTurno
    ? { texto: "Tu turno", Icono: CircleArrowRight, tono: "libre" as const }
    : { texto: "En espera", Icono: Hourglass, tono: "reservada" as const };

  return (
    <Shell vista="porteria" seleccion={elegida ?? v.celdasLibres[0] ?? null} onSeleccionar={setElegida}>
      <PanelCabecera
        Icono={ShieldCheck}
        titulo={`Portería ${v.nombre}`}
        subtitulo={`Pasaje ${v.pasaje.ocupados} de ${v.pasaje.capacidad} · ${v.valetsDisponibles} valets libres`}
        cerrar={{ href: href(""), etiqueta: "Volver al inicio" }}
      />
      <FilaAcciones
        acciones={[
          {
            texto: v.puedeAsignar ? `Asignar ${v.celdasLibres[0]}` : "Asignar celda",
            Icono: ParkingSquare,
            onClick: () => enviar({ tipo: "asignarCelda", entrada: v.entrada }),
            motivo: v.puedeAsignar ? null : v.turno,
          },
          {
            texto: "Registrar placa",
            Icono: ScanLine,
            activa: registroAbierto,
            onClick: () => {
              setRegistroAbierto(!registroAbierto);
              if (!registroAbierto) requestAnimationFrame(() => campo.current?.focus());
            },
          },
          otra
            ? { texto: otra.nombre, Icono: DoorOpen, href: href("porteria", { entrada: otra.id }) }
            : { texto: "Otra entrada", Icono: DoorOpen, motivo: "el lote tiene una sola entrada." },
        ]}
      />
      <AvisoResultado aviso={aviso} />
      <Chips
        etiqueta="Entradas"
        chips={estado.entradas.map((e) => ({
          id: e.id,
          texto: (
            <>
              {e.nombre} <span className="num pt-cuenta">{e.fila.length}</span>
            </>
          ),
          href: href("porteria", { entrada: e.id }),
          actual: e.id === entradaId,
        }))}
      />
      <TarjetaDatos Icono={DoorOpen} titulo={`Pasaje ${v.nombre}`} contador={{ valor: v.celdasLibres.length, etiqueta: "Celdas libres" }}>
        <div className="ui-cifras">
          <Cifra valor={`${v.pasaje.ocupados}/${v.pasaje.capacidad}`} etiqueta="Pasaje" />
          <Cifra valor={v.valetsDisponibles} etiqueta="Valets libres" />
        </div>
        <Pastilla {...turno} />
        <p className="pt-turno">{v.turno}</p>
      </TarjetaDatos>
      <div>
        <Acordeon Icono={ScanLine} titulo="Registrar placa" abierto={registroAbierto} onCambiar={setRegistroAbierto}>
          <Registro v={v} campo={campo} />
        </Acordeon>
        <Acordeon Icono={ListOrdered} titulo="Fila del pasaje" extra={`${v.fila.length} de ${v.pasaje.capacidad}`} inicial>
          <FilaPasaje fila={v.fila} />
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
