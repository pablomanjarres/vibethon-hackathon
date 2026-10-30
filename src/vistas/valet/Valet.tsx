import { useRoute } from "../../shared/route";
import { useEstado } from "../../ui/useTienda";
import { ElegirValet } from "./ElegirValet";
import { PanelValet } from "./PanelValet";
import "./valet.css";

/** The valet's view: who they are comes from the link (?valet=RG-V1); without it they pick once. */
export default function Valet() {
  const estado = useEstado();
  const pedido = useRoute().params.get("valet");
  const valido = pedido !== null && estado.valets.some((x) => x.id === pedido);
  return valido ? <PanelValet key={pedido} valetId={pedido} /> : <ElegirValet pedido={pedido} />;
}
