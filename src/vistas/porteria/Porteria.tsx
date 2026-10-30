import { useState } from "react";
import { CircleArrowRight, Clock3, DoorOpen, Hourglass, ListOrdered, ParkingSquare, ShieldCheck, UsersRound } from "lucide-react";
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
import "./porteria.css";

/** One gate: whose turn it is and why, its passage, the waiting line outside and its valets, over the lot. Drivers register themselves. */
export default function Porteria() {
  const estado = useEstado();
  const { params } = useRoute();
  const { aviso, enviar } = useComando();
  const [elegida, setElegida] = useState<string | null>(null);
  const [esperaAbierta, setEsperaAbierta] = useState(false);
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
        subtitulo={`Pasaje ${v.pasaje.ocupados} de ${v.pasaje.capacidad} · ${v.enEspera.length} en espera afuera`}
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
            texto: `Fila de espera (${v.enEspera.length})`,
            Icono: Clock3,
            activa: esperaAbierta,
            onClick: () => setEsperaAbierta(!esperaAbierta),
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
          <Cifra valor={v.enEspera.length} etiqueta="En espera afuera" />
          <Cifra valor={v.valetsDisponibles} etiqueta="Valets libres" />
        </div>
        <Pastilla {...turno} />
        <p className="pt-turno">{v.turno}</p>
      </TarjetaDatos>
      <div>
        <Acordeon Icono={ListOrdered} titulo="Fila del pasaje" extra={`${v.fila.length} de ${v.pasaje.capacidad}`} inicial>
          <FilaPasaje fila={v.fila} />
        </Acordeon>
        <Acordeon Icono={Clock3} titulo="Fila de espera afuera" extra={v.enEspera.length} abierto={esperaAbierta} onCambiar={setEsperaAbierta}>
          {v.enEspera.length === 0 ? (
            <Vacio>Nadie espera afuera: el pasaje tiene cupo o está vacío.</Vacio>
          ) : (
            <ol className="ui-lista pt-fila">
              {v.enEspera.map((placa, i) => (
                <li key={placa}>
                  <span className="pt-pos num">{i + 1}</span>
                  <strong className="pt-placa num">{placa}</strong>
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
