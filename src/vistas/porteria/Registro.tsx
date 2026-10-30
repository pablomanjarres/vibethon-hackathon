import { useState, type RefObject } from "react";
import { CircleCheck, ScanLine } from "lucide-react";
import type { VistaPorteria } from "../../parqueadero/lecturas/porteria";
import { CampoPlaca } from "../../ui/CampoPlaca";
import { Hoja } from "../../ui/Hoja";
import { useComando } from "../../ui/useTienda";

/** Simulated plate camera: registers an arrival at this gate, a check-in banner on success, a sheet on refusal. */
export function Registro({ v, campo }: { v: VistaPorteria; campo: RefObject<HTMLInputElement | null> }) {
  const { aviso, enviar } = useComando();
  const [placa, setPlaca] = useState<string | null>(null);
  const registrado = aviso?.ok && placa ? v.fila.findIndex((c) => c.placa === placa) : -1;
  const carro = registrado >= 0 ? v.fila[registrado] : null;

  const reintentar = () => {
    setPlaca(null);
    requestAnimationFrame(() => campo.current?.select());
  };

  return (
    <div className="pt-registro">
      <CampoPlaca
        etiqueta="Placa leída por la cámara"
        accion="Registrar"
        Icono={ScanLine}
        inputRef={campo}
        onEnviar={(texto) => {
          setPlaca(texto);
          return enviar({ tipo: "registrarLlegada", placa: texto, entrada: v.entrada });
        }}
      />
      {carro && (
        <div className="pt-checkin ui-tono-libre" role="status">
          <CircleCheck size={22} strokeWidth={2.2} aria-hidden="true" />
          <div>
            <p className="pt-checkin-titulo">
              <strong className="num">{carro.placa}</strong> registrada
            </p>
            <p className="pt-checkin-detalle num">
              Llegó {carro.llego} · puesto {registrado + 1} en la fila de {v.nombre}
            </p>
          </div>
        </div>
      )}
      {aviso && !aviso.ok && placa && (
        <Hoja titulo={`No se registró ${placa || "la placa"}`} accion="Intentar de nuevo" onCerrar={reintentar}>
          {aviso.texto}
        </Hoja>
      )}
    </div>
  );
}
