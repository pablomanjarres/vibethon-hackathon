import { useState } from "react";
import { Car, CarFront, KeyRound, ListChecks, ParkingSquare, ShieldCheck, Ticket, Undo2, type LucideIcon } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import { hora } from "../../parqueadero/lecturas/formato";
import { vistaValet } from "../../parqueadero/lecturas/valet";
import type { Estado } from "../../parqueadero/tipos";
import { href, useRoute } from "../../shared/route";
import { Acordeon } from "../../ui/Acordeon";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Chips } from "../../ui/Chips";
import { Datos, Vacio } from "../../ui/Datos";
import { ESTADO_VALET } from "../../ui/estados";
import { FilaAcciones, type AccionPanel } from "../../ui/FilaAcciones";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Pastilla } from "../../ui/Pastilla";
import { Shell } from "../../ui/Shell";
import { TarjetaDatos } from "../../ui/TarjetaDatos";
import { useComando, useEstado } from "../../ui/useTienda";
import { Progreso, type Paso } from "./Progreso";
import "./valet.css";

type Servicio = { ficho: string; placa: string; celda: string | null };

/** The service steps in order; the ones a valet does carry their action. */
const PASOS: { tipo: Comando["tipo"]; texto: string; boton?: { texto: (s: Servicio) => string; Icono: LucideIcon; comando: (s: Servicio) => Comando } }[] = [
  { tipo: "pedirValet", texto: "Servicio pedido" },
  { tipo: "entregarLlaves", texto: "Llaves recibidas", boton: { texto: () => "Recibí las llaves", Icono: KeyRound, comando: (s) => ({ tipo: "entregarLlaves", placa: s.placa }) } },
  { tipo: "estacionar", texto: "Carro estacionado", boton: { texto: (s) => `Estacionar en ${s.celda}`, Icono: ParkingSquare, comando: (s) => ({ tipo: "estacionar", placa: s.placa }) } },
  { tipo: "pedirDevolucion", texto: "Devolución pedida" },
  { tipo: "recogerCarro", texto: "Carro sacado de la celda", boton: { texto: () => "Sacar de la celda", Icono: CarFront, comando: (s) => ({ tipo: "recogerCarro", ficho: s.ficho }) } },
  { tipo: "entregarCarro", texto: "Carro entregado", boton: { texto: () => "Entregar el carro", Icono: Undo2, comando: (s) => ({ tipo: "entregarCarro", ficho: s.ficho }) } },
];

/** How many steps are done, read from the service and the car's state. */
function hechos(estado: Estado, servicio: Servicio & { estado: string }): number {
  const parqueado = estado.carros[servicio.placa]?.estado === "estacionado";
  if (servicio.estado === "solicitado") return 1;
  if (servicio.estado === "en curso") return 2;
  if (servicio.estado === "estacionado") return 3;
  if (servicio.estado === "devolución") return parqueado ? 4 : 5;
  return 6;
}

/** Time of the latest log entry for this step that names the plate or the ficho. */
function horaDe(estado: Estado, tipo: string, s: Servicio): string | null {
  const evento = [...estado.bitacora].reverse().find((e) => e.tipo === tipo && (e.detalle.includes(s.placa) || e.detalle.includes(s.ficho)));
  return evento ? hora(estado.inicio, evento.minuto) : null;
}

/** A valet's phone: pick the valet, see the service like an order status, press the one next step. */
export default function Valet() {
  const estado = useEstado();
  const { params } = useRoute();
  const { aviso, enviar } = useComando();
  const [elegida, setElegida] = useState<string | null>(null);
  const pedido = params.get("valet");
  const valetId = estado.valets.some((x) => x.id === pedido) ? pedido! : (estado.valets.find((x) => x.servicio)?.id ?? estado.valets[0].id);
  const valet = estado.valets.find((x) => x.id === valetId)!;
  const v = vistaValet(estado, valetId);
  const s = v.servicio;
  const listos = s ? hechos(estado, s) : 0;
  const pasos: Paso[] = s ? PASOS.map((p, i) => ({ texto: p.texto, hecho: i < listos, hora: i < listos ? horaDe(estado, p.tipo, s) : null })) : [];
  const siguiente = s ? PASOS[listos] : undefined;
  const boton = s && siguiente?.boton && (siguiente.tipo !== "estacionar" || s.celda) ? siguiente.boton : null;

  const acciones: AccionPanel[] = [
    boton && s
      ? { texto: boton.texto(s), Icono: boton.Icono, onClick: () => enviar(boton.comando(s)) }
      : { texto: "Siguiente paso", Icono: ListChecks, motivo: v.siguientePaso },
    { texto: "Mi portería", Icono: ShieldCheck, href: href("porteria", { entrada: valet.entrada }) },
    s
      ? { texto: "Ver conductor", Icono: Car, href: href("conductor", { placa: s.placa }) }
      : { texto: "Ver conductor", Icono: Car, motivo: "no hay un servicio en curso." },
  ];

  return (
    <Shell vista="valet" seleccion={elegida ?? s?.celda ?? null} onSeleccionar={setElegida}>
      <PanelCabecera
        Icono={KeyRound}
        titulo={`Valet ${v.id}`}
        subtitulo={`Entrada ${v.entrada} · ${ESTADO_VALET[v.estado].texto}`}
        cerrar={{ href: href(""), etiqueta: "Volver al inicio" }}
      />
      <FilaAcciones acciones={acciones} />
      <AvisoResultado aviso={aviso} />
      <Chips
        etiqueta="Valets"
        chips={estado.valets.map((x) => ({ id: x.id, texto: <span className="num">{x.id}</span>, href: href("valet", { valet: x.id }), actual: x.id === valetId }))}
      />
      <TarjetaDatos Icono={Ticket} titulo="Servicio actual" contador={s ? { valor: s.ficho, etiqueta: "Ficho" } : undefined}>
        <Pastilla {...ESTADO_VALET[v.estado]} />
        <p className="vl-siguiente">{v.siguientePaso}</p>
        {s ? (
          <Datos
            filas={[
              { etiqueta: "Placa", valor: s.placa },
              { etiqueta: "Celda", valor: s.celda ?? "Por asignar en la portería" },
              { etiqueta: "Ficho", valor: s.ficho },
            ]}
          />
        ) : (
          <Vacio>Sin servicio. Cuando un conductor pida valet, aparecerá aquí.</Vacio>
        )}
      </TarjetaDatos>
      <div>
        <Acordeon Icono={ListChecks} titulo="Progreso del servicio" extra={s ? `${listos} de ${PASOS.length}` : undefined} inicial>
          {s ? <Progreso pasos={pasos} /> : <Vacio>Sin pasos todavía: no hay un servicio en curso.</Vacio>}
        </Acordeon>
      </div>
    </Shell>
  );
}
