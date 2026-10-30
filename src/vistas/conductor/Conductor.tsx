import { useState } from "react";
import { setParams, useRoute } from "../../shared/route";
import { PaginaConductor } from "./PaginaConductor";

export default function Conductor() {
  const { params } = useRoute();
  const placa = params.get("placa");
  const codigo = params.get("codigo") ?? "";
  // The code shown right after check-in survives the switch to the driver's own page.
  const [nuevo, setNuevo] = useState<{ placa: string; codigo: string; texto: string } | null>(null);
  const registrada = (placa: string, codigo: string, texto: string) => {
    setNuevo({ placa, codigo, texto });
    setParams({ placa, codigo }, { push: true });
  };
  // A new plate starts a fresh page, so the last result of another car is not shown.
  return (
    <PaginaConductor
      key={`${placa ?? ""}:${codigo}`}
      placa={placa}
      codigo={codigo}
      registro={nuevo && nuevo.placa === placa ? nuevo : null}
      onRegistrada={registrada}
    />
  );
}
