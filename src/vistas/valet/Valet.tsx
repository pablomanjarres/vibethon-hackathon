import { Banknote, CarFront, KeyRound, ParkingSquare, Ticket, Undo2 } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import { listaValets, vistaValet, type VistaValet } from "../../parqueadero/lecturas/valet";
import { vistaOficina } from "../../parqueadero/lecturas/oficina";
import { href, useRoute } from "../../shared/route";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { ESTADO_VALET } from "../../ui/estados";
import { Opciones } from "../../ui/Opciones";
import { Pastilla } from "../../ui/Pastilla";
import { Shell } from "../../ui/Shell";
import { Datos, Tarjeta, Vacio } from "../../ui/Tarjeta";
import { useComando, useEstado } from "../../ui/useTienda";
import "./valet.css";

interface Accion {
  texto: string;
  Icono: typeof KeyRound;
  comando: Comando;
}

/** The buttons for the valet's current service step: keys, park, take out, charge, hand back. */
function acciones(s: NonNullable<VistaValet["servicio"]>): Accion[] {
  if (s.estado === "solicitado") return [{ texto: "Recibí las llaves", Icono: KeyRound, comando: { tipo: "entregarLlaves", placa: s.placa } }];
  if (s.estado === "en curso" && s.celda) return [{ texto: `Estacionar en ${s.celda}`, Icono: ParkingSquare, comando: { tipo: "estacionar", placa: s.placa } }];
  if (s.estado === "devolución" && s.celda) return [{ texto: "Sacar de la celda", Icono: CarFront, comando: { tipo: "recogerCarro", ficho: s.ficho } }];
  if (s.estado === "devolución")
    return [
      { texto: "Devolver el carro", Icono: Undo2, comando: { tipo: "entregarCarro", ficho: s.ficho } },
      { texto: "Cobrar", Icono: Banknote, comando: { tipo: "pagar", placa: s.placa } },
    ];
  return [];
}

export default function Valet() {
  const estado = useEstado();
  const { params } = useRoute();
  const { aviso, enviar } = useComando();
  const valets = listaValets(estado);
  const pedido = params.get("valet");
  const valetId = valets.some((x) => x.id === pedido) ? pedido! : (estado.valets.find((x) => x.servicio)?.id ?? valets[0].id);
  const v = vistaValet(estado, valetId);
  const oficina = vistaOficina(estado);
  const meta = ESTADO_VALET[v.estado];
  const lista = v.servicio ? acciones(v.servicio) : [];

  return (
    <Shell vista="valet">
      <div className="vl-rejilla">
        <div className="vl-columna">
          <div>
            <p className="ui-ceja">
              Valet {v.id} · {v.entrada}
            </p>
            <h1 className="ui-titulo">{v.siguientePaso}</h1>
          </div>
          <Pastilla {...meta} grande />
          {v.servicio ? (
            <Tarjeta titulo="Servicio actual" Icono={Ticket} extra={<span className="vl-ficho num">{v.servicio.ficho}</span>}>
              <Datos
                filas={[
                  { etiqueta: "Placa", valor: v.servicio.placa },
                  { etiqueta: "Celda", valor: v.servicio.celda ?? "Sin celda" },
                  { etiqueta: "Paso", valor: v.servicio.estado },
                ]}
              />
              {lista.map((accion, i) => (
                <Boton key={accion.texto} variante={i === 0 ? "primario" : "secundario"} Icono={accion.Icono} ancho onClick={() => enviar(accion.comando)}>
                  {accion.texto}
                </Boton>
              ))}
            </Tarjeta>
          ) : (
            <Vacio>Sin servicio. Cuando un conductor entregue su carro, aparecerá aquí.</Vacio>
          )}
          <AvisoResultado aviso={aviso} />
        </div>
        <div className="vl-columna">
          <Tarjeta titulo="Fichos activos" Icono={Ticket} extra={<span className="num">{oficina.fichosActivos.length}</span>}>
            {oficina.fichosActivos.length === 0 ? (
              <Vacio>No hay fichos abiertos.</Vacio>
            ) : (
              <ul className="ui-lista">
                {oficina.fichosActivos.map((f) => (
                  <li key={f.ficho}>
                    <span className="vl-ficho-linea">
                      <strong className="num">{f.ficho}</strong>
                      <span className="ui-texto-suave num">
                        {f.placa} · {f.valet ?? "sin valet"}
                      </span>
                    </span>
                    <span className="ui-texto-suave">{f.estado}</span>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
          <Tarjeta titulo="Llaves en el tablero" Icono={KeyRound} extra={<span className="num">{oficina.llavesEnTablero.length}</span>}>
            {oficina.llavesEnTablero.length === 0 ? <Vacio>El tablero está vacío.</Vacio> : <p className="num">{oficina.llavesEnTablero.join(", ")}</p>}
          </Tarjeta>
          <Tarjeta titulo="Ver otro valet">
            <Opciones
              etiqueta="Valets"
              actual={valetId}
              opciones={valets.map((x) => ({ id: x.id, texto: `${x.id} · ${ESTADO_VALET[x.estado].texto}`, href: href("valet", { valet: x.id }) }))}
            />
          </Tarjeta>
        </div>
      </div>
    </Shell>
  );
}
