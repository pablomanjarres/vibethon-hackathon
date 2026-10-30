import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { hora } from "../../parqueadero/lecturas/formato";
import { vistaOficina } from "../../parqueadero/lecturas/oficina";
import { vistaPorteria } from "../../parqueadero/lecturas/porteria";
import { listaValets, vistaValet } from "../../parqueadero/lecturas/valet";
import { href } from "../../shared/route";
import { MapaLote } from "../../ui/MapaLote";
import { Reloj } from "../../ui/Reloj";
import { Cifra } from "../../ui/Tarjeta";
import { useEstado } from "../../ui/useTienda";
import { Bitacora, FichosActivos } from "../oficina/Registros";
import { Pasajes } from "./Pasajes";
import { Valets } from "./Valets";
import "../../ui/tokens.css";
import "../../ui/texto.css";
import "./telefono.css";

/**
 * A read-only phone that follows the lot live: whatever the driver, gate, valet or office screens
 * do, in this tab or another, shows up here. It never sends a command.
 */
export default function Telefono() {
  const estado = useEstado();
  const oficina = vistaOficina(estado);
  const porterias = estado.entradas.map((e) => vistaPorteria(estado, e.id));
  const valets = listaValets(estado).map((v) => vistaValet(estado, v.id));
  const ultimo = oficina.bitacora[0];

  useEffect(() => {
    document.title = "Teléfono · Parqueadero EAFIT";
  }, []);

  return (
    <div className="tl-fondo">
      <div className="tl-marco">
        <div className="tl-pantalla">
          <header className="tl-cabecera">
            <a href={href("")} aria-label="Ver todas las vistas" className="tl-volver">
              <ChevronLeft size={20} aria-hidden="true" />
            </a>
            <div>
              <h1>Parqueadero EAFIT</h1>
              <p className="tl-vivo" role="status">
                <span className="tl-punto" aria-hidden="true" />
                En vivo{ultimo ? ` · último cambio ${hora(estado.inicio, ultimo.minuto)}` : ""}
              </p>
            </div>
            <Reloj />
          </header>
          <main className="tl-contenido">
            <div className="tl-cifras">
              <Cifra valor={oficina.celdas.libre} etiqueta="Libres" />
              <Cifra valor={oficina.celdas.reservada} etiqueta="Reservadas" />
              <Cifra valor={oficina.celdas.ocupada} etiqueta="Ocupadas" />
            </div>
            {oficina.mapas.map((mapa) => (
              <MapaLote
                key={mapa.id}
                nombre={mapa.nombre}
                columnas={mapa.columnas}
                filas={mapa.filas}
                celdas={mapa.celdas}
                entradas={estado.entradas}
              />
            ))}
            <Pasajes porterias={porterias} />
            <Bitacora eventos={oficina.bitacora.slice(0, 8)} inicio={estado.inicio} />
            <FichosActivos fichos={oficina.fichosActivos} />
            <Valets valets={valets} />
          </main>
        </div>
      </div>
    </div>
  );
}
