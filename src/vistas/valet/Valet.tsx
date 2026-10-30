import { valetAutorizado } from "../../parqueadero/lecturas/valet";
import { useRoute } from "../../shared/route";
import { useEstado } from "../../ui/useTienda";
import { ElegirValet } from "./ElegirValet";
import { PanelValet } from "./PanelValet";
import "./valet.css";

/** The valet's view: who they are and their code come from the link (?valet=RG-V1&codigo=8542); without them they sign in once. */
export default function Valet() {
  const estado = useEstado();
  const { params } = useRoute();
  const pedido = params.get("valet");
  const codigo = params.get("codigo");
  const valido = pedido !== null && codigo !== null && valetAutorizado(estado, pedido, codigo);
  return valido ? <PanelValet key={pedido} valetId={pedido} /> : <ElegirValet rechazado={pedido !== null || codigo !== null} />;
}
