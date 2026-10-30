import { useState } from "react";
import { setParams, useRoute } from "../../shared/route";
import type { Aviso } from "../../ui/useTienda";
import { PaginaConductor } from "./PaginaConductor";

export default function Conductor() {
  const { params } = useRoute();
  const placa = params.get("placa");
  // The check-in confirmation survives the switch to the new plate's page.
  const [registro, setRegistro] = useState<Aviso | null>(null);
  const registrada = (nueva: string, texto: string) => {
    setRegistro({ ok: true, texto });
    setParams({ placa: nueva }, { push: true });
  };
  // A new plate starts a fresh page, so the last result of another car is not shown.
  return <PaginaConductor key={placa ?? ""} placa={placa} avisoInicial={registro} onRegistrada={registrada} />;
}
