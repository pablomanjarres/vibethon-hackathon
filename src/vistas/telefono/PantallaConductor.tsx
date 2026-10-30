import { Eye, KeyRound, LogOut, MapPin } from "lucide-react";
import { vistaConductor } from "../../parqueadero/lecturas/conductor";
import type { Estado } from "../../parqueadero/tipos";
import { href } from "../../shared/route";
import { Boton } from "../../ui/Boton";
import { MapaLote } from "../../ui/MapaLote";
import { pasos } from "../conductor/acciones";
import { HojaInferior } from "./HojaInferior";
import { Ingreso } from "./Ingreso";
import { PestanasConductor } from "./PestanasConductor";
import { Recorrido } from "./Recorrido";
import "../conductor/conductor.css";

/**
 * The driver app on a phone for one plate and access code: the lot map behind, the driver's details
 * in a bottom sheet. Other drivers' plates never show. A preview: the buttons send nothing.
 */
export function PantallaConductor({ estado, placa, codigo }: { estado: Estado; placa: string; codigo: string }) {
  const v = vistaConductor(estado, placa, codigo);
  if (!v.encontrado) return <Ingreso error={v.mensaje} />;

  const mapa = estado.mapas[0];
  const acciones = [
    ...(v.puedeReservar ? [{ texto: "Reservar celda", Icono: MapPin }] : []),
    ...(v.puedePedirValet ? [{ texto: "Reservar valet", Icono: KeyRound }] : []),
    ...pasos(v),
  ].slice(0, 2);

  return (
    <>
      {mapa && (
        <div className="tl-mapa">
          <MapaLote
            nombre={mapa.nombre}
            celdas={estado.celdas.filter((c) => c.mapa === mapa.id).map((c) => ({ ...c, placa: c.id === v.celda ? v.placa : null }))}
            entradas={estado.entradas.map((e) => ({ ...e, fila: e.fila.map(() => "") }))}
            seleccion={v.celda}
            enfoque={v.celda}
          />
        </div>
      )}
      <div className="tl-flotantes">
        <a className="tl-flotante" href={href("telefono")} aria-label="Salir">
          <LogOut size={18} aria-hidden="true" />
        </a>
        <span className="tl-flotante tl-vivo">
          <span className="tl-punto" aria-hidden="true" /> En vivo
        </span>
      </div>
      <HojaInferior
        etiqueta={`Tu carro ${v.placa}`}
        pie={
          <>
            {acciones.length > 0 && (
              <div className="tl-acciones">
                {acciones.map((a, i) => (
                  <Boton key={a.texto} Icono={a.Icono} variante={i === 0 ? "primario" : "secundario"} aria-describedby="tl-vista-previa">
                    {a.texto}
                  </Boton>
                ))}
              </div>
            )}
            <p id="tl-vista-previa" className="tl-nota">
              <Eye size={14} aria-hidden="true" /> Vista previa: los botones no envían nada.
            </p>
          </>
        }
        cabeza={
          <div className="tl-cabeza">
            <p className="tl-placa num">
              {v.placa}
              {v.entrada && <span> · Entrada {v.entrada}</span>}
            </p>
            <p className="tl-mensaje" aria-live="polite">
              {v.mensaje}
            </p>
            <dl className="tl-metricas">
              <div>
                <dt>Espera</dt>
                <dd className="num">{v.espera ? `${v.espera.minutos} min` : "—"}</dd>
              </div>
              <div>
                <dt>Adelante</dt>
                <dd className="num">{v.espera ? v.espera.carrosAdelante : "—"}</dd>
              </div>
              <div>
                <dt>Celda</dt>
                <dd className="num">{v.celda ?? "—"}</dd>
              </div>
            </dl>
            {v.estado && <Recorrido estado={v.estado} />}
          </div>
        }
      >
        <PestanasConductor estado={estado} v={v} />
      </HojaInferior>
    </>
  );
}
