import { useEffect, useRef, useState } from "react";
import { Building2, CarFront, ScrollText, SlidersHorizontal } from "lucide-react";
import { hora } from "../../parqueadero/lecturas/formato";
import { detalleCarro, detalleCelda } from "../../parqueadero/lecturas/registro";
import { href, useRoute } from "../../shared/route";
import { Acordeon } from "../../ui/Acordeon";
import { Chips } from "../../ui/Chips";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Shell } from "../../ui/Shell";
import { useEstado } from "../../ui/useTienda";
import { Bitacora } from "./Bitacora";
import { ControlesSimulacion } from "./ControlesSimulacion";
import { DetalleCarro } from "./DetalleCarro";
import { DetalleCelda } from "./DetalleCelda";
import { ListaCarros } from "./ListaCarros";
import { ResumenOficina } from "./ResumenOficina";
import { resumenOficina } from "./resumen";
import "./oficina.css";

type Seleccion = { tipo: "carro"; placa: string } | { tipo: "celda"; id: string } | null;

/**
 * The office of one entrance (or of the whole lot): an overview, the searchable list of its cars, and one
 * car or cell opened up at a time. The presenter's simulation controls wait folded at the bottom.
 */
export default function Oficina() {
  const estado = useEstado();
  const { params } = useRoute();
  const pedida = params.get("oficina");
  const entradaId = estado.entradas.some((e) => e.id === pedida) ? pedida : null;
  const resumen = resumenOficina(estado, entradaId);
  const [seleccion, setSeleccion] = useState<Seleccion>(null);
  const carro = seleccion?.tipo === "carro" ? detalleCarro(estado, seleccion.placa) : null;
  const celda = seleccion?.tipo === "celda" ? detalleCelda(estado, seleccion.id) : null;
  const detalle = useRef<HTMLDivElement>(null);
  const moneda = estado.reglas.moneda;

  useEffect(() => {
    if (seleccion) detalle.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [seleccion]);

  return (
    <Shell vista="oficina" seleccion={carro?.celda ?? celda?.celda.id ?? null} onSeleccionar={(id) => setSeleccion({ tipo: "celda", id })}>
      <PanelCabecera
        Icono={Building2}
        titulo={entradaId ? `Oficina ${resumen.nombre}` : "Oficina · Todo el lote"}
        subtitulo={`${hora(estado.inicio, estado.minuto)} · minuto ${estado.minuto}`}
        cerrar={{ href: href(""), etiqueta: "Volver al inicio" }}
      />
      <Chips
        etiqueta="Oficinas"
        chips={[
          { id: "todo", texto: "Todo el lote", href: href("oficina"), actual: entradaId === null },
          ...estado.entradas.map((e) => ({ id: e.id, texto: e.nombre, href: href("oficina", { oficina: e.id }), actual: e.id === entradaId })),
        ]}
      />
      {(carro || celda) && (
        <div ref={detalle} className="of-detalle">
          {carro && <DetalleCarro carro={carro} inicio={estado.inicio} moneda={moneda} onCerrar={() => setSeleccion(null)} />}
          {celda && (
            <DetalleCelda detalle={celda} onVerCarro={(placa) => setSeleccion({ tipo: "carro", placa })} onCerrar={() => setSeleccion(null)} />
          )}
        </div>
      )}
      <ResumenOficina
        resumen={resumen}
        moneda={moneda}
        celdas={{ libres: estado.celdas.filter((c) => c.estado === "libre").length, total: estado.celdas.length }}
      />
      <div>
        <Acordeon Icono={CarFront} titulo="Carros" extra={resumen.carros.length} inicial>
          <ListaCarros
            carros={resumen.carros}
            seleccion={carro?.placa ?? null}
            onSeleccionar={(placa) => setSeleccion({ tipo: "carro", placa })}
            conEntrada={entradaId === null}
          />
        </Acordeon>
        <Acordeon Icono={ScrollText} titulo="Bitácora" extra={resumen.bitacora.length}>
          <Bitacora eventos={resumen.bitacora} inicio={estado.inicio} />
        </Acordeon>
        <Acordeon Icono={SlidersHorizontal} titulo="Simulación" extra={`minuto ${estado.minuto}`}>
          <ControlesSimulacion minuto={estado.minuto} />
        </Acordeon>
      </div>
    </Shell>
  );
}
