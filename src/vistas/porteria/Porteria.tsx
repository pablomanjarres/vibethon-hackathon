import { CircleArrowRight, Hourglass, ParkingSquare } from "lucide-react";
import { vistaPorteria } from "../../parqueadero/lecturas/porteria";
import { href, useRoute } from "../../shared/route";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { MapaLote } from "../../ui/MapaLote";
import { Opciones } from "../../ui/Opciones";
import { Pastilla } from "../../ui/Pastilla";
import { Shell } from "../../ui/Shell";
import { Cifra } from "../../ui/Tarjeta";
import { useComando, useEstado } from "../../ui/useTienda";
import { FilaPasaje } from "./FilaPasaje";
import { Registro } from "./Registro";
import "./porteria.css";

/** One gate as a guest list: whose turn it is and why, the plate camera, the passage line and the lot. */
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
      <div className="ui-mapa-panel pt-rejilla">
        <div className="ui-panel-lateral">
          <div>
            <p className="ui-ceja">Portería</p>
            <h1 className="ui-titulo">{v.nombre}</h1>
          </div>
          <Opciones
            etiqueta="Entradas"
            actual={entradaId}
            opciones={estado.entradas.map((e) => ({
              id: e.id,
              texto: (
                <>
                  {e.nombre} <span className="num pt-cuenta">{e.fila.length}</span>
                </>
              ),
              href: href("porteria", { entrada: e.id }),
            }))}
          />
          <div className="ui-cifras">
            <Cifra valor={`${v.pasaje.ocupados}/${v.pasaje.capacidad}`} etiqueta="Pasaje" />
            <Cifra valor={v.celdasLibres.length} etiqueta="Celdas libres" />
            <Cifra valor={v.valetsDisponibles} etiqueta="Valets libres" />
          </div>
          <div className="ui-subtarjeta">
            <Pastilla {...turno} grande />
            <p className="pt-turno" id="pt-turno">
              {v.turno}
            </p>
            <Boton
              Icono={ParkingSquare}
              ancho
              disabled={!v.puedeAsignar}
              aria-describedby="pt-turno"
              onClick={() => enviar({ tipo: "asignarCelda", entrada: v.entrada })}
            >
              {v.puedeAsignar ? `Asignar celda ${v.celdasLibres[0]}` : "Asignar celda"}
            </Boton>
            <AvisoResultado aviso={aviso} />
          </div>
          <Registro v={v} />
          <FilaPasaje fila={v.fila} capacidad={v.pasaje.capacidad} />
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
