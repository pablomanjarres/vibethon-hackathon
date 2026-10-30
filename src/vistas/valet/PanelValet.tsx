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
import { DemoValets } from "./DemoValets";
import { NotiAsignacion } from "./NotiAsignacion";
import { celdaOcupada, etapasDe, type AccionValet } from "./pasos";
import { Progreso } from "./Progreso";
import { TarjetaAsignacion } from "./TarjetaAsignacion";
import { useNuevaAsignacion } from "./useNuevaAsignacion";

/** One valet's phone: only their assignment, its cell on the map, and the one next step. */
export function PanelValet({ valetId }: { valetId: string }) {
  const estado = useEstado();
  const { aviso, enviar } = useComando();
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
          <p className="vl-siguiente">{s.estado === "pago pendiente" ? "Apartado: esperando el pago" : v.siguientePaso}</p>
        </>
      ) : (
        <TarjetaDatos Icono={BellOff} titulo="Tu asignación">
          <Vacio>Sin asignación. Te avisamos cuando llegue una.</Vacio>
        </TarjetaDatos>
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
      <AvisoResultado aviso={aviso} />
      {etapa && (
        <div>
          <Acordeon Icono={ListChecks} titulo="Progreso del servicio" extra={`${etapa.hechos} de ${etapa.pasos.length}`} inicial>
            <Progreso pasos={etapa.pasos} />
          </Acordeon>
        </div>
      )}
      <DemoValets />
    </Shell>
  );
}
