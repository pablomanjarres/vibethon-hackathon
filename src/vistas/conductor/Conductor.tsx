import { useRoute } from "../../shared/route";
import { PaginaConductor } from "./PaginaConductor";

export default function Conductor() {
  const { params } = useRoute();
  const placa = params.get("placa");
  // A new plate starts a fresh page, so the last result of another car is not shown.
  return <PaginaConductor key={placa ?? ""} placa={placa} />;
}
