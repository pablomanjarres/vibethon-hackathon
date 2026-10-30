import { CarFront, KeyRound, ParkingSquare, Ticket, Undo2, type LucideIcon } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import { hora } from "../../parqueadero/lecturas/formato";
import { listaValets, vistaValet } from "../../parqueadero/lecturas/valet";
import type { Estado } from "../../parqueadero/tipos";
import { useRoute } from "../../shared/route";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { ESTADO_VALET } from "../../ui/estados";
import { Pastilla } from "../../ui/Pastilla";
import { Shell } from "../../ui/Shell";
import { Tarjeta, Vacio } from "../../ui/Tarjeta";
import { useComando, useEstado } from "../../ui/useTienda";
import { ElegirValet } from "./ElegirValet";
import { Progreso, type Paso } from "./Progreso";
import "./valet.css";

type Servicio = { ficho: string; placa: string; celda: string | null };

/** The service steps in order; the ones a valet does carry their button. */
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
  const valets = listaValets(estado);
  const pedido = params.get("valet");
  const valetId = valets.some((x) => x.id === pedido) ? pedido! : (estado.valets.find((x) => x.servicio)?.id ?? valets[0].id);
  const v = vistaValet(estado, valetId);
  const s = v.servicio;
  const listos = s ? hechos(estado, s) : 0;
  const pasos: Paso[] = s ? PASOS.map((p, i) => ({ texto: p.texto, hecho: i < listos, hora: i < listos ? horaDe(estado, p.tipo, s) : null })) : [];
  const siguiente = s ? PASOS[listos] : undefined;
  const boton = s && siguiente?.boton && (siguiente.tipo !== "estacionar" || s.celda) ? siguiente.boton : null;

  return (
    <Shell vista="valet">
      <div className="vl-columna">
        <ElegirValet valets={valets} actual={valetId} />
        <div className="vl-cabeza">
          <div>
            <p className="ui-ceja">
              Valet {v.id} · {v.entrada}
            </p>
            <h1 className="ui-titulo">{v.siguientePaso}</h1>
          </div>
          <Pastilla {...ESTADO_VALET[v.estado]} grande />
        </div>
        {s ? (
          <Tarjeta titulo={`Placa ${s.placa}`} Icono={Ticket} extra={<span className="vl-ficho num" aria-label={`Ficho ${s.ficho}`}>{s.ficho}</span>}>
            <p className="ui-texto-suave num vl-celda">Celda {s.celda ?? "por asignar en la portería"}</p>
            <Progreso pasos={pasos} />
            {boton ? (
              <Boton Icono={boton.Icono} ancho onClick={() => enviar(boton.comando(s))}>
                {boton.texto(s)}
              </Boton>
            ) : (
              <p className="vl-espera">{v.siguientePaso}</p>
            )}
          </Tarjeta>
        ) : (
          <Vacio>Sin servicio. Cuando un conductor pida valet, aparecerá aquí.</Vacio>
        )}
        <AvisoResultado aviso={aviso} />
      </div>
    </Shell>
  );
}
