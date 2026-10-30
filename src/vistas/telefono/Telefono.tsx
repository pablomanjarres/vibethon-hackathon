import { useEffect } from "react";
import { hora } from "../../parqueadero/lecturas/formato";
import { useRoute } from "../../shared/route";
import { useEstado } from "../../ui/useTienda";
import { Dispositivo } from "./Dispositivo";
import { Ingreso } from "./Ingreso";
import { PantallaConductor } from "./PantallaConductor";
import { SelectorPlacas } from "./SelectorPlacas";
import "../../ui/tokens.css";
import "../../ui/texto.css";
import "./telefono.css";
import "./hoja.css";

/**
 * The driver app as it looks on a phone (#/telefono?placa=CXM540&codigo=5975). It follows the lot
 * live, including what the gate, valet and office do in other tabs, and sends the driver's commands.
 * With ?demo, a presenter panel beside the phone signs in as any car in the lot.
 */
export default function Telefono() {
  const estado = useEstado();
  const { params } = useRoute();
  const placa = params.get("placa")?.toUpperCase() ?? "";
  const codigo = params.get("codigo") ?? "";
  const demo = params.has("demo");

  useEffect(() => {
    document.title = "Teléfono del conductor · Parqueadero EAFIT";
  }, []);

  return (
    <div className="tl-escena">
      <Dispositivo hora={hora(estado.inicio, estado.minuto)}>
        {placa ? <PantallaConductor estado={estado} placa={placa} codigo={codigo} /> : <Ingreso />}
      </Dispositivo>
      {demo && (
      <aside className="tl-presentador" aria-label="Entrar como otro conductor">
        <h2 className="tl-presentador-titulo">Teléfono del conductor</h2>
        <p className="ui-texto-suave">
          Así ve la app un conductor. Toca una placa para entrar con su código; la pantalla cambia sola cuando la portería, el valet o la oficina actúan.
        </p>
        <SelectorPlacas estado={estado} vista="telefono" actual={placa} extra={{ demo: "1" }} />
      </aside>
      )}
    </div>
  );
}
