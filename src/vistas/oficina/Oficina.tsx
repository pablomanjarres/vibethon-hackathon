import { useState } from "react";
import { Building2, DoorOpen, KeyRound, ScrollText, Ticket } from "lucide-react";
import { vistaOficina } from "../../parqueadero/lecturas/oficina";
import { href } from "../../shared/route";
import { Acordeon } from "../../ui/Acordeon";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Shell } from "../../ui/Shell";
import { useEstado } from "../../ui/useTienda";
import { CeldasPorEstado } from "./CeldasPorEstado";
import { ControlesSimulacion } from "./ControlesSimulacion";
import { DetalleCelda } from "./DetalleCelda";
import { Bitacora, FichosActivos, LlavesYPagos } from "./Registros";
import { TableroEntradas } from "./TableroEntradas";
import "./oficina.css";

/** The office desk over the lot: simulation, cells by state, the selected cell, entrances, fichos, keys, payments and the log. */
export default function Oficina() {
  const estado = useEstado();
  const v = vistaOficina(estado);
  const celdas = v.mapas.flatMap((m) => m.celdas);
  const [elegida, setElegida] = useState<string | null>(null);
  const seleccion = celdas.find((c) => c.id === elegida) ?? null;

  return (
    <Shell vista="oficina" seleccion={seleccion?.id ?? null} onSeleccionar={setElegida}>
      <PanelCabecera Icono={Building2} titulo="Lote EAFIT" subtitulo={`${v.hora} · minuto ${v.minuto}`} cerrar={{ href: href(""), etiqueta: "Volver al inicio" }} />
      <ControlesSimulacion minuto={v.minuto} />
      <CeldasPorEstado celdas={celdas} seleccion={seleccion?.id ?? null} onSeleccionar={setElegida} />
      <DetalleCelda celda={seleccion} fichos={v.fichosActivos} />
      <div>
        <Acordeon Icono={DoorOpen} titulo="Entradas" extra={v.entradas.length} inicial>
          <TableroEntradas entradas={v.entradas} />
        </Acordeon>
        <Acordeon Icono={Ticket} titulo="Fichos activos" extra={v.fichosActivos.length}>
          <FichosActivos fichos={v.fichosActivos} />
        </Acordeon>
        <Acordeon Icono={KeyRound} titulo="Llaves y pagos" extra={v.pagos.cantidad}>
          <LlavesYPagos llaves={v.llavesEnTablero} pagos={v.pagos} />
        </Acordeon>
        <Acordeon Icono={ScrollText} titulo="Bitácora" extra={v.bitacora.length}>
          <Bitacora eventos={v.bitacora} inicio={estado.inicio} />
        </Acordeon>
      </div>
    </Shell>
  );
}
