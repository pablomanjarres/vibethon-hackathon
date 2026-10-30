import { useEffect, useState } from "react";
import { hora } from "../../parqueadero/lecturas/formato";
import { setParams, useRoute } from "../../shared/route";
import { useComando, useEstado } from "../../ui/useTienda";
import { Dispositivo } from "./Dispositivo";
import { Ingreso } from "./Ingreso";
import { PantallaConductor } from "./PantallaConductor";
import { vistaConductor } from "../../parqueadero/lecturas/conductor";
import { ListaAccesos } from "../../ui/AccesoRapido";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { SiguientePasoDemo } from "../conductor/SiguientePasoDemo";
import "../../ui/acceso.css";
import "../../ui/tokens.css";
import "../../ui/texto.css";
import "./telefono.css";
import "./hoja.css";

/**
 * The driver app as it looks on a phone (#/telefono?placa=CXM540&codigo=5975). It follows the lot
 * live, including what the gate, valet and office do in other tabs, and sends the driver's commands.
 * Beside the phone, the presenter's quick actions: new plates, sign in as any car, and the simulation.
 */
export default function Telefono() {
  const estado = useEstado();
  const { params } = useRoute();
  const placa = params.get("placa")?.toUpperCase() ?? "";
  const codigo = params.get("codigo") ?? "";
  const { aviso, informar } = useComando();
  const conectado = Boolean(placa) && vistaConductor(estado, placa, codigo).encontrado;
  // The code and confirmation shown right after check-in survive the switch to the driver's screen.
  const [nuevo, setNuevo] = useState<{ placa: string; codigo: string; texto: string } | null>(null);
  const registrada = (placa: string, codigo: string, texto: string) => {
    setNuevo({ placa, codigo, texto });
    setParams({ placa, codigo }, { push: true });
  };

  useEffect(() => {
    document.title = "Teléfono del conductor · Parqueadero EAFIT";
  }, []);

  return (
    <div className="tl-escena">
      <Dispositivo hora={hora(estado.inicio, estado.minuto)}>
        {placa ? (
          <PantallaConductor
            key={`${placa}:${codigo}`}
            estado={estado}
            placa={placa}
            codigo={codigo}
            registro={nuevo?.placa === placa ? nuevo : null}
            onRegistrada={registrada}
          />
        ) : (
          <Ingreso estado={estado} onRegistrada={registrada} />
        )}
      </Dispositivo>
      <aside className="tl-presentador" aria-label="Acciones rápidas">
        <h2 className="tl-presentador-titulo">Acciones rápidas</h2>
        {conectado && (
          <div className="cd-demo-paso">
            <SiguientePasoDemo estado={estado} placa={placa} onResultado={informar} />
            {aviso && <AvisoResultado aviso={aviso} />}
          </div>
        )}
        <section className="ui-acceso tl-accesos">
          <ListaAccesos vista="conductor" ruta="telefono" />
        </section>
      </aside>
    </div>
  );
}
