import { CircleArrowRight, Hourglass, KeyRound, ParkingSquare, ScanLine } from "lucide-react";
import { vistaPorteria } from "../../parqueadero/lecturas/porteria";
import { href, useRoute } from "../../shared/route";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { CampoPlaca } from "../../ui/CampoPlaca";
import { MapaLote } from "../../ui/MapaLote";
import { Opciones } from "../../ui/Opciones";
import { Pastilla } from "../../ui/Pastilla";
import { Shell } from "../../ui/Shell";
import { Cifra, Tarjeta, Vacio } from "../../ui/Tarjeta";
import { useComando, useEstado } from "../../ui/useTienda";
import "./porteria.css";

/** One gate: its passage line, whose turn it is and why, and the button that hands out the next cell. */
export default function Porteria() {
  const estado = useEstado();
  const { params } = useRoute();
  const { aviso, enviar } = useComando();
  const entradaId = estado.entradas.some((e) => e.id === params.get("entrada")) ? params.get("entrada")! : estado.entradas[0].id;
  const v = vistaPorteria(estado, entradaId);
  const mapa = estado.mapas[0];
  const turno = v.esMiTurno
    ? { texto: "Tu turno", Icono: CircleArrowRight, tono: "libre" as const }
    : { texto: "En espera", Icono: Hourglass, tono: "reservada" as const };

  return (
    <Shell vista="porteria" ancho>
      <Opciones
        etiqueta="Entradas"
        actual={entradaId}
        opciones={estado.entradas.map((e) => ({ id: e.id, texto: `Portería ${e.nombre}`, href: href("porteria", { entrada: e.id }) }))}
      />
      <div className="ui-mapa-panel pt-rejilla">
        <div className="ui-panel-lateral">
          <div>
            <p className="ui-ceja">Portería</p>
            <h1 className="ui-titulo">{v.nombre}</h1>
          </div>
          <div className="ui-subtarjeta">
            <Pastilla {...turno} grande />
            <p className="pt-turno">{v.turno}</p>
            <Boton Icono={ParkingSquare} ancho onClick={() => enviar({ tipo: "asignarCelda", entrada: v.entrada })}>
              Asignar celda
            </Boton>
          </div>
          <AvisoResultado aviso={aviso} />
          <div className="ui-cifras">
            <Cifra valor={`${v.pasaje.ocupados}/${v.pasaje.capacidad}`} etiqueta="Pasaje" />
            <Cifra valor={v.celdasLibres.length} etiqueta="Celdas libres" />
            <Cifra valor={v.valetsDisponibles} etiqueta="Valets libres" />
          </div>
          <Tarjeta titulo="Fila del pasaje" extra={<span className="ui-texto-suave num">Primero en la puerta</span>}>
            {v.fila.length === 0 ? (
              <Vacio>No hay carros en el pasaje. Registra la placa cuando llegue el siguiente.</Vacio>
            ) : (
              <ol className="ui-lista pt-fila">
                {v.fila.map((carro, i) => (
                  <li key={carro.placa}>
                    <span className="pt-pos num">{i + 1}</span>
                    <span className="pt-placa">
                      <strong className="num">{carro.placa}</strong>
                      <span className="ui-texto-suave num">
                        Llegó {carro.llego} · espera {carro.esperaMinutos} min
                      </span>
                    </span>
                    {carro.conValet && <Pastilla texto="Valet" Icono={KeyRound} tono="neutro" />}
                  </li>
                ))}
              </ol>
            )}
          </Tarjeta>
          <CampoPlaca
            etiqueta="Registrar llegada al pasaje"
            accion="Registrar"
            Icono={ScanLine}
            onEnviar={(placa) => enviar({ tipo: "registrarLlegada", placa, entrada: v.entrada })}
          />
          <p className="ui-texto-suave pt-libres num">
            Libres: {v.celdasLibres.length ? v.celdasLibres.join(", ") : "ninguna"}
          </p>
        </div>
        {mapa && (
          <MapaLote
            nombre={mapa.nombre}
            columnas={mapa.columnas}
            filas={mapa.filas}
            celdas={estado.celdas.filter((c) => c.mapa === mapa.id)}
            entradas={estado.entradas}
            seleccion={v.celdasLibres[0] ?? null}
          />
        )}
      </div>
    </Shell>
  );
}
