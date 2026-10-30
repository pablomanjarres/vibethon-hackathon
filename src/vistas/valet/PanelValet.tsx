import { BellOff, KeyRound, ListChecks } from "lucide-react";
import { vistaValet } from "../../parqueadero/lecturas/valet";
import { href } from "../../shared/route";
import { Acordeon } from "../../ui/Acordeon";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Vacio } from "../../ui/Datos";
import { ESTADO_VALET } from "../../ui/estados";
import { FilaAcciones } from "../../ui/FilaAcciones";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Shell } from "../../ui/Shell";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { useComando, useEstado } from "../../ui/useTienda";
import { ConfirmarFicho } from "./ConfirmarFicho";
import { DemoAcciones } from "./DemoAcciones";
import { DemoValets } from "./DemoValets";
import { Equipo } from "./Equipo";
import { Historial } from "./Historial";
import { NotiAsignacion } from "./NotiAsignacion";
import { celdaOcupada, etapasDe, type AccionValet, type Servicio } from "./pasos";
import { Progreso } from "./Progreso";
import { TarjetaAsignacion } from "./TarjetaAsignacion";
import { useNuevaAsignacion } from "./useNuevaAsignacion";

/** Next-step wording for the steps where the valet checks the driver's ficho. */
const SIGUIENTE: Partial<Record<string, (s: Servicio) => string>> = {
  "pago pendiente": () => "Apartado: esperando el pago",
  pagado: (s) => `Ve al pasaje de ${s.entrada}, pide el ficho al conductor de ${s.placa} y confírmalo para recibir las llaves.`,
  "ficho emitido": (s) => `Pide el ficho al conductor de ${s.placa} y confírmalo para recibir las llaves.`,
};

/** One valet's phone: only their assignment, its cell on the map, and the one next step. */
export function PanelValet({ valetId }: { valetId: string }) {
  const estado = useEstado();
  const { aviso, enviar, informar } = useComando();
  const v = vistaValet(estado, valetId);
  const s = v.servicio;
  const [nueva, descartar] = useNuevaAsignacion(s);
  const etapa = s ? etapasDe(estado, s) : null;
  const acciones = [etapa?.accion, s ? celdaOcupada(estado, s) : null].filter((a): a is AccionValet => Boolean(a));

  return (
    <Shell vista="valet" seleccion={s?.celda ?? null} enfoque={s?.celda ?? null} privado>
      <PanelCabecera
        Icono={KeyRound}
        titulo={`Valet ${v.id}`}
        subtitulo={`Entrada ${v.entrada} · ${ESTADO_VALET[v.estado].texto}`}
        cerrar={{ href: href("valet"), etiqueta: "Cambiar de valet" }}
      />
      {nueva && <NotiAsignacion asignacion={nueva} onCerrar={descartar} />}
      {s ? (
        <>
          <TarjetaAsignacion servicio={s} />
          <p className="vl-siguiente">{SIGUIENTE[s.estado]?.(s) ?? v.siguientePaso}</p>
        </>
      ) : (
        <TarjetaDatos Icono={BellOff} titulo="Tu asignación">
          <Vacio>Sin asignación. Te avisamos cuando llegue una.</Vacio>
        </TarjetaDatos>
      )}
      {s && (s.estado === "pagado" || s.estado === "ficho emitido") && (
        <ConfirmarFicho
          key={s.id}
          servicio={s}
          onResultado={(resultado) => {
            descartar();
            informar(resultado);
          }}
        />
      )}
      {acciones.length > 0 && (
        <FilaAcciones
          acciones={acciones.map((accion) => ({
            texto: accion.texto,
            Icono: accion.Icono,
            motivo: accion.motivo,
            onClick: () => {
              descartar();
              enviar(accion.comando);
            },
          }))}
        />
      )}
      <DemoAcciones
        valetId={v.id}
        placa={s?.placa ?? null}
        onResultado={(resultado) => {
          descartar();
          informar(resultado);
        }}
      />
      <AvisoResultado aviso={aviso} />
      {etapa && (
        <div>
          <Acordeon Icono={ListChecks} titulo="Progreso del servicio" extra={`${etapa.hechos} de ${etapa.pasos.length}`} inicial>
            <Progreso pasos={etapa.pasos} />
          </Acordeon>
        </div>
      )}
      <Historial valetId={v.id} />
      <Equipo actual={v.id} />
      <DemoValets />
    </Shell>
  );
}
