import { Banknote, CarFront, KeyRound, LogOut, ParkingSquare, UserRound } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import { vistaConductor, type VistaConductor } from "../../parqueadero/lecturas/conductor";
import { href, useRoute } from "../../shared/route";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { Shell } from "../../ui/Shell";
import { useComando, useEstado } from "../../ui/useTienda";
import { ElegirPlaca } from "./ElegirPlaca";
import { Estacionado } from "./Estacionado";
import { Ficho } from "./Ficho";
import { ProgresoValet } from "./ProgresoValet";
import { Pronostico } from "./Pronostico";
import { ReservaCelda } from "./ReservaCelda";
import "./conductor.css";

interface Accion {
  texto: string;
  Icono: typeof KeyRound;
  comando: Comando;
}

/** The next steps the driver can take, from what the read model says about the car. */
function acciones(v: VistaConductor): Accion[] {
  if (!v.encontrado) return [];
  const lista: Accion[] = [];
  if (v.puedePedirValet) lista.push({ texto: "Reservar valet", Icono: KeyRound, comando: { tipo: "pedirValet", placa: v.placa } });
  if (v.ficho && v.llave === "conductor" && v.estado === "en fila")
    lista.push({ texto: "Ya entregué las llaves", Icono: KeyRound, comando: { tipo: "entregarLlaves", placa: v.placa } });
  if (v.estado === "con celda" && !v.ficho) lista.push({ texto: "Ya estacioné", Icono: ParkingSquare, comando: { tipo: "estacionar", placa: v.placa } });
  if (v.ficho && v.estado === "estacionado") lista.push({ texto: "Pedir mi carro", Icono: CarFront, comando: { tipo: "pedirDevolucion", ficho: v.ficho } });
  if (!v.pagado && (v.estado === "estacionado" || v.estado === "en devolución"))
    lista.push({ texto: "Pagar", Icono: Banknote, comando: { tipo: "pagar", placa: v.placa } });
  if (!v.ficho && v.pagado && v.estado === "estacionado") lista.push({ texto: "Salir", Icono: LogOut, comando: { tipo: "salir", placa: v.placa } });
  return lista;
}

export default function Conductor() {
  const { params } = useRoute();
  const placa = params.get("placa");
  // A new plate starts a fresh page, so the last result of another car is not shown.
  return <PaginaConductor key={placa ?? ""} placa={placa} />;
}

function PaginaConductor({ placa }: { placa: string | null }) {
  const estado = useEstado();
  const { aviso, enviar } = useComando();

  if (!placa) {
    return (
      <Shell vista="conductor">
        <div className="cd-columna">
          <div>
            <p className="ui-ceja">Conductor</p>
            <h1 className="ui-titulo">Reserva tu celda o tu valet en EAFIT.</h1>
          </div>
          <ElegirPlaca estado={estado} actual={null} />
        </div>
      </Shell>
    );
  }

  const v = vistaConductor(estado, placa);
  const carro = estado.carros[v.placa];
  const servicio = carro?.servicio ? estado.servicios[carro.servicio] : null;
  const lista = acciones(v);
  const botones = lista.length > 0 && (
    <div className="cd-acciones">
      {lista.map((accion, i) => (
        <Boton key={accion.texto} variante={i === 0 ? "primario" : "secundario"} Icono={accion.Icono} ancho onClick={() => enviar(accion.comando)}>
          {accion.texto}
        </Boton>
      ))}
    </div>
  );
  const enMapa = v.encontrado && (v.estado === "en fila" || v.estado === "con celda") && !v.ficho;
  const enFila = enMapa && v.estado === "en fila";
  const titulo = enFila ? (v.puedeReservar ? "Es tu turno: elige tu celda." : "Aún no es tu turno de reservar.") : v.mensaje;
  const minutosEstacionado = carro?.estacionadoEn != null ? estado.minuto - carro.estacionadoEn : null;

  return (
    <Shell vista="conductor">
      <div className={enMapa ? "cd-rejilla" : "cd-columna"}>
        <div className="cd-cabeza">
          <p className="ui-ceja">{v.entrada ? `Entrada ${v.entrada}` : "Conductor"} · {v.placa}</p>
          <h1 className="ui-titulo">{titulo}</h1>
        </div>
        {enMapa && (
          <div className="cd-mapa">
            <ReservaCelda
              estado={estado}
              celdasLibres={v.celdasLibres}
              puedeReservar={v.puedeReservar}
              motivo={v.mensaje}
              celda={v.celda}
              onReservar={(celda) => enviar({ tipo: "reservarCelda", placa: v.placa, celda })}
            />
          </div>
        )}
        <div className="cd-columna">
          <AvisoResultado aviso={aviso} />
          {!v.encontrado && <ElegirPlaca estado={estado} actual={v.placa} />}
          {v.espera && carro && !v.ficho && (
            <Pronostico espera={v.espera} entrada={v.entrada} inicio={estado.inicio} minuto={estado.minuto} llegoEn={carro.llegoEn} />
          )}
          {v.ficho ? (
            <Ficho ficho={v.ficho} placa={v.placa} celda={v.celda} valet={v.valet}>
              {servicio && <ProgresoValet estado={servicio.estado} />}
              {botones}
            </Ficho>
          ) : v.estado === "estacionado" ? (
            <Estacionado celda={v.celda} minutos={minutosEstacionado} pagado={v.pagado}>
              {botones}
            </Estacionado>
          ) : (
            botones
          )}
          <a className="cd-cambiar" href={href("conductor")}>
            <UserRound size={16} aria-hidden="true" /> Cambiar de placa
          </a>
        </div>
      </div>
    </Shell>
  );
}
