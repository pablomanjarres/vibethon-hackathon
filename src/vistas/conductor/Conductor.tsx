import { Banknote, CarFront, KeyRound, LogOut, ParkingSquare, Search, Ticket, UserRound } from "lucide-react";
import type { Comando } from "../../parqueadero/motor";
import { vistaConductor, type VistaConductor } from "../../parqueadero/lecturas/conductor";
import { href, setParams, useRoute } from "../../shared/route";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { CampoPlaca } from "../../ui/CampoPlaca";
import { MapaLote } from "../../ui/MapaLote";
import { Opciones } from "../../ui/Opciones";
import { Shell } from "../../ui/Shell";
import { Cifra, Datos, Tarjeta } from "../../ui/Tarjeta";
import { useComando, useEstado } from "../../ui/useTienda";
import "./conductor.css";

const LLAVE = { conductor: "Contigo", valet: "Con el valet", tablero: "En el tablero" } as const;

interface Accion {
  texto: string;
  Icono: typeof KeyRound;
  comando: Comando;
}

/** The one next step the driver can take, from what the read model says about the car. */
function acciones(v: VistaConductor): Accion[] {
  if (!v.encontrado) return [];
  const lista: Accion[] = [];
  if (v.puedePedirValet) lista.push({ texto: "Entregar al valet", Icono: KeyRound, comando: { tipo: "pedirValet", placa: v.placa } });
  if (v.ficho && v.llave === "conductor" && v.estado === "en fila")
    lista.push({ texto: "Ya le di las llaves", Icono: KeyRound, comando: { tipo: "entregarLlaves", placa: v.placa } });
  if (v.estado === "con celda" && !v.ficho) lista.push({ texto: "Ya estacioné", Icono: ParkingSquare, comando: { tipo: "estacionar", placa: v.placa } });
  if (v.ficho && v.estado === "estacionado") lista.push({ texto: "Pedir mi carro", Icono: CarFront, comando: { tipo: "pedirDevolucion", ficho: v.ficho } });
  if (!v.pagado && (v.estado === "estacionado" || v.estado === "en devolución"))
    lista.push({ texto: "Pagar", Icono: Banknote, comando: { tipo: "pagar", placa: v.placa } });
  if (!v.ficho && v.pagado && v.estado === "estacionado") lista.push({ texto: "Salir", Icono: LogOut, comando: { tipo: "salir", placa: v.placa } });
  return lista;
}

export default function Conductor() {
  const estado = useEstado();
  const { params } = useRoute();
  const { aviso, enviar } = useComando();
  const placa = params.get("placa");
  const enFila = estado.entradas.flatMap((e) => e.fila);

  const elegir = (
    <Tarjeta titulo="¿Cuál es tu placa?" Icono={Search}>
      <CampoPlaca etiqueta="Placa del carro" accion="Ver mi lugar" Icono={Search} onEnviar={(valor) => setParams({ placa: valor }, { push: true })} />
      {enFila.length > 0 && (
        <div className="cd-sugeridas">
          <p className="ui-texto-suave">Carros en los pasajes ahora</p>
          <Opciones etiqueta="Placas en fila" actual={placa} opciones={enFila.map((p) => ({ id: p, texto: p, href: href("conductor", { placa: p }) }))} />
        </div>
      )}
    </Tarjeta>
  );

  if (!placa) {
    return (
      <Shell vista="conductor">
        <div className="cd-columna">
          <div>
            <p className="ui-ceja">Conductor</p>
            <h1 className="ui-titulo">Tu lugar en la fila y tu celda, al instante.</h1>
          </div>
          {elegir}
        </div>
      </Shell>
    );
  }

  const v = vistaConductor(estado, placa);
  const mapa = estado.mapas[0];
  const lista = acciones(v);

  return (
    <Shell vista="conductor">
      <div className="cd-rejilla">
        <div className="cd-columna">
          <div>
            <p className="ui-ceja">{v.entrada ? `Entrada ${v.entrada}` : "Conductor"} · {v.placa}</p>
            <h1 className="ui-titulo">{v.mensaje}</h1>
          </div>
          {v.encontrado && (
            <div className="ui-cifras">
              {v.espera && <Cifra valor={v.espera.carrosAdelante + 1} etiqueta="Tu lugar" detalle={`${v.espera.carrosAdelante} adelante, ambas entradas`} />}
              {v.espera && <Cifra valor={`${v.espera.minutos} min`} etiqueta="Espera estimada" />}
              <Cifra valor={v.celda ?? "Sin asignar"} etiqueta="Tu celda" />
            </div>
          )}
          {lista.length > 0 && (
            <div className="cd-acciones">
              {lista.map((accion, i) => (
                <Boton key={accion.texto} variante={i === 0 ? "primario" : "secundario"} Icono={accion.Icono} ancho onClick={() => enviar(accion.comando)}>
                  {accion.texto}
                </Boton>
              ))}
            </div>
          )}
          <AvisoResultado aviso={aviso} />
          {v.encontrado ? (
            <Tarjeta titulo="Mi ficho" Icono={Ticket} extra={v.ficho && <span className="cd-ficho num">{v.ficho}</span>}>
              <Datos
                filas={[
                  { etiqueta: "Ficho", valor: v.ficho ?? "Sin valet" },
                  { etiqueta: "Llaves", valor: v.llave ? LLAVE[v.llave] : "—" },
                  { etiqueta: "Valet", valor: v.valet ?? "—" },
                  { etiqueta: "Pago", valor: v.pagado ? "Pagado" : "Pendiente" },
                ]}
              />
            </Tarjeta>
          ) : (
            elegir
          )}
          <a className="cd-cambiar" href={href("conductor")}>
            <UserRound size={16} aria-hidden="true" /> Cambiar de placa
          </a>
        </div>
        {mapa && v.celda && (
          <MapaLote
            nombre={mapa.nombre}
            columnas={mapa.columnas}
            filas={mapa.filas}
            celdas={estado.celdas.filter((c) => c.mapa === mapa.id)}
            entradas={estado.entradas}
            seleccion={v.celda}
          />
        )}
      </div>
    </Shell>
  );
}
