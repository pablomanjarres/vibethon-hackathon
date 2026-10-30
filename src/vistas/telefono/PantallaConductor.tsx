import { Eye, LogOut } from "lucide-react";
import { vistaConductor } from "../../parqueadero/lecturas/conductor";
import type { Estado } from "../../parqueadero/tipos";
import { href } from "../../shared/route";
import { MapaLote } from "../../ui/MapaLote";
import { pasoActual } from "../conductor/acciones";
import { AccionesPaso } from "../conductor/AccionesPaso";
import { EstadoPaso } from "../conductor/EstadoPaso";
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
  const paso = pasoActual(v, null);

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
            <AccionesPaso paso={paso} describedBy="tl-vista-previa" />
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
            <EstadoPaso v={v} />
            {v.estado && <Recorrido estado={v.estado} />}
          </div>
        }
      >
        <PestanasConductor estado={estado} v={v} />
      </HojaInferior>
    </>
  );
}
