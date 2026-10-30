import { useState } from "react";
import { LogOut } from "lucide-react";
import { vistaConductor } from "../../parqueadero/lecturas/conductor";
import type { Estado } from "../../parqueadero/tipos";
import { href } from "../../shared/route";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { MapaLote } from "../../ui/MapaLote";
import { useComando } from "../../ui/useTienda";
import { pasoActual } from "../conductor/acciones";
import { AccionesPaso } from "../conductor/AccionesPaso";
import { DetallesConductor } from "../conductor/DetallesConductor";
import { EstadoPaso } from "../conductor/EstadoPaso";
import { OfertaValet } from "../conductor/OfertaValet";
import { PasoValet } from "../conductor/PasoValet";
import { HojaInferior } from "./HojaInferior";
import { Ingreso } from "./Ingreso";
import { Recorrido } from "./Recorrido";
import "../conductor/conductor.css";

/**
 * The driver app on a phone for one plate and access code: the lot map behind, the driver's details
 * in a bottom sheet. Other drivers' plates never show. The step's buttons send the driver's commands.
 */
export function PantallaConductor({ estado, placa, codigo }: { estado: Estado; placa: string; codigo: string }) {
  const { aviso, enviar } = useComando();
  const [valet, setValet] = useState<string | null>(null);
  const v = vistaConductor(estado, placa, codigo);
  if (!v.encontrado) return <Ingreso placa={v.placa} error={v.mensaje} />;

  const mapa = estado.mapas[0];
  const paso = pasoActual(v, null);

  return (
    <>
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
            <AvisoResultado aviso={aviso} />
            <AccionesPaso paso={paso} onEnviar={enviar} />
          </>
        }
        cabeza={
          <div className="tl-cabeza">
            <h1 className="tl-placa num">
              {v.placa}
              {v.entrada && <span> · Entrada {v.entrada}</span>}
            </h1>
            {v.servicio ? <PasoValet servicio={v.servicio} restantes={null} /> : <EstadoPaso v={v} />}
            {v.estado && <Recorrido estado={v.estado} />}
          </div>
        }
      >
        <div className="tl-detalles">
          {!v.servicio && (v.estado === "en fila" || v.estado === "en espera") && (
            <OfertaValet
              placa={v.placa}
              oferta={v.oferta}
              estado={v.estado}
              tarifa={{ precio: estado.reglas.tarifaValet, moneda: estado.reglas.moneda }}
              elegido={valet}
              onElegir={setValet}
              onEnviar={enviar}
            />
          )}
          <DetallesConductor estado={estado} v={v} />
        </div>
      </HojaInferior>
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
    </>
  );
}
