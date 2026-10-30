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
import { SiguientePasoDemo } from "../conductor/SiguientePasoDemo";
import { HojaInferior } from "./HojaInferior";
import { Ingreso } from "./Ingreso";
import { sinOtrasPlacas } from "./privacidad";
import { Recorrido } from "./Recorrido";
import "../conductor/conductor.css";

/**
 * The driver app on a phone for one plate and access code: the lot map behind, the driver's details
 * in a bottom sheet. Other drivers' plates never show. The step's buttons send the driver's commands,
 * and the simulation moves the gate, valets and other drivers forward one step at a time.
 */
interface Props {
  estado: Estado;
  placa: string;
  codigo: string;
  /** Carried over from check-in: the new code and the engine's confirmation. */
  registro: { codigo: string; texto: string } | null;
  onRegistrada: (placa: string, codigo: string, texto: string) => void;
}

export function PantallaConductor({ estado, placa, codigo, registro, onRegistrada }: Props) {
  const { aviso, enviar, informar } = useComando();
  const [elegida, setElegida] = useState<string | null>(null);
  const [valet, setValet] = useState<string | null>(null);
  const v = vistaConductor(estado, placa, codigo);
  if (!v.encontrado) return <Ingreso estado={estado} onRegistrada={onRegistrada} placa={v.placa} error={v.mensaje} />;

  const privado = (texto: string) => sinOtrasPlacas(texto, estado, v.placa);
  const resultado = aviso ?? (registro && { ok: true, texto: registro.texto });
  const mapa = estado.mapas[0];
  const paso = pasoActual(v, elegida);
  const reservable = paso.principal?.comando.tipo === "reservarCelda" ? paso.principal.comando.celda : null;

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
        pie={<SiguientePasoDemo estado={estado} placa={v.placa} onResultado={informar} ocultar={privado} />}
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
          <AvisoResultado aviso={resultado && { ...resultado, texto: privado(resultado.texto) }} />
          {registro?.codigo && (
            <p className="cd-codigo-linea">
              Tu código <strong className="num">{registro.codigo}</strong> · con tu placa entras desde otro teléfono
            </p>
          )}
          <AccionesPaso paso={paso} onEnviar={enviar} />
          <OfertaValet v={v} tarifa={{ precio: estado.reglas.tarifaValet, moneda: estado.reglas.moneda }} elegido={valet} onElegir={setValet} onEnviar={enviar} />
          <DetallesConductor estado={estado} v={v} />
        </div>
      </HojaInferior>
      {mapa && (
        <div className="tl-mapa">
          <MapaLote
            nombre={mapa.nombre}
            celdas={estado.celdas.filter((c) => c.mapa === mapa.id).map((c) => ({ ...c, placa: c.id === v.celda ? v.placa : null }))}
            entradas={estado.entradas.map((e) => ({ ...e, fila: e.fila.map(() => "") }))}
            seleccion={reservable ?? v.celda}
            onSeleccionar={setElegida}
            enfoque={v.celda}
          />
        </div>
      )}
    </>
  );
}
