import { useState } from "react";
import { FastForward, PlayCircle, Plus, StepForward } from "lucide-react";
import { codigoDeRegistro, vistaConductor } from "../../parqueadero/lecturas/conductor";
import { pasoSimulado } from "../../parqueadero/simulacion";
import { tienda } from "../../parqueadero/tienda";
import { href, setParams, useRoute } from "../../shared/route";
import { useAnnounce } from "../../shared/Announcer";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Boton } from "../../ui/Boton";
import { CampoPlaca } from "../../ui/CampoPlaca";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Shell } from "../../ui/Shell";
import { useComando, useEstado } from "../../ui/useTienda";
import "./simulador.css";

/** How many steps "Hasta tener celda" may run before it stops. */
const LIMITE = 120;

/**
 * Presenter tool: register a plate, get its code, then let the gate, valets, office and other
 * drivers act one step at a time until the car has its cell. Every step goes through the engine.
 */
export default function Simulador() {
  const estado = useEstado();
  const { params } = useRoute();
  const anunciar = useAnnounce();
  const { aviso, enviar, informar } = useComando();
  const [entrada, setEntrada] = useState(estado.entradas[0]?.id ?? "");
  const [registro, setRegistro] = useState<string[]>([]);
  const placa = params.get("placa") ?? "";
  const carro = placa ? estado.carros[placa] : undefined;
  const v = carro ? vistaConductor(estado, placa) : null;
  const siguiente = carro ? pasoSimulado(estado, placa) : null;

  const registrar = (escrita: string) => {
    const nueva = escrita.trim().toUpperCase().replace(/[\s-]+/g, "");
    if (!enviar({ tipo: "registrarLlegada", placa: nueva, entrada })) return false;
    setRegistro([]);
    setParams({ placa: nueva });
    return true;
  };

  /** Runs one step; returns false when nothing is left to do or the engine refused. */
  const unPaso = (): boolean => {
    const paso = pasoSimulado(tienda.leer(), placa);
    if (!paso) return false;
    for (const comando of paso.comandos) {
      const r = tienda.ejecutar(comando);
      if (!r.ok) {
        informar({ ok: false, texto: r.motivo });
        return false;
      }
      setRegistro((previo) => [`${paso.quien}: ${r.evento.detalle}`, ...previo].slice(0, 6));
    }
    return true;
  };

  const hastaCelda = () => {
    let pasos = 0;
    while (pasos < LIMITE && ["en espera", "en fila"].includes(tienda.leer().carros[placa]?.estado ?? "") && unPaso()) pasos += 1;
    const ahora = vistaConductor(tienda.leer(), placa);
    informar({ ok: true, texto: `${pasos} pasos simulados. ${ahora.mensaje}` });
    anunciar(ahora.mensaje);
  };

  return (
    <Shell seleccion={v?.celda ?? null} enfoque={v?.celda ?? null}>
      <PanelCabecera
        Icono={PlayCircle}
        titulo="Simular el flujo"
        subtitulo={carro ? `${placa} · código ${carro.codigo}` : "Registra una placa y avanza paso a paso."}
        cerrar={{ href: href(""), etiqueta: "Volver al inicio" }}
      />
      <AvisoResultado aviso={aviso} />
      {!carro ? (
        <div className="sm-registro">
          <div className="sm-entradas" role="group" aria-label="Entrada">
            {estado.entradas.map((e) => (
              <button key={e.id} type="button" className="sm-entrada" aria-pressed={e.id === entrada} onClick={() => setEntrada(e.id)}>
                {e.nombre} · {e.fila.length}/{e.capacidadPasaje}
              </button>
            ))}
          </div>
          <CampoPlaca etiqueta="Placa" accion="Registrar" Icono={Plus} onEnviar={registrar} />
        </div>
      ) : (
        <div className="sm-flujo">
          {codigoDeRegistro(estado, placa) && <p className="sm-codigo">Código del conductor: <strong className="num">{carro.codigo}</strong></p>}
          <p className="sm-estado">{v?.mensaje}</p>
          {siguiente ? (
            <>
              <Boton variante="primario" Icono={StepForward} ancho onClick={() => unPaso()}>
                Siguiente paso: {siguiente.quien}
              </Boton>
              {carro.estado === "en fila" || carro.estado === "en espera" ? (
                <Boton variante="secundario" Icono={FastForward} ancho onClick={hastaCelda}>
                  Hasta tener celda
                </Boton>
              ) : null}
            </>
          ) : (
            <p className="sm-listo">Nada más que simular para {placa}.</p>
          )}
          {registro.length > 0 && (
            <ol className="sm-registro-pasos" aria-label="Últimos pasos">
              {registro.map((linea, i) => (
                <li key={`${i}-${linea}`}>{linea}</li>
              ))}
            </ol>
          )}
          <Boton variante="contorno" Icono={Plus} onClick={() => setParams({ placa: undefined })}>
            Otro carro
          </Boton>
        </div>
      )}
    </Shell>
  );
}
