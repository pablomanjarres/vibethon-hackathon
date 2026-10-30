import { KeyRound } from "lucide-react";
import { listaValets } from "../../parqueadero/lecturas/valet";
import { href } from "../../shared/route";
import { AvisoResultado } from "../../ui/AvisoResultado";
import { Chips } from "../../ui/Chips";
import { PanelCabecera } from "../../ui/PanelCabecera";
import { Shell } from "../../ui/Shell";
import { useEstado } from "../../ui/useTienda";

/** First open on a phone: the valet says who they are once; the link keeps it from then on. */
export function ElegirValet({ pedido }: { pedido: string | null }) {
  const estado = useEstado();
  return (
    <Shell vista="valet" privado>
      <PanelCabecera
        Icono={KeyRound}
        titulo="¿Qué valet eres?"
        subtitulo="Elige tu código una vez; queda guardado en este enlace."
        cerrar={{ href: href(""), etiqueta: "Volver al inicio" }}
      />
      <AvisoResultado aviso={pedido ? { ok: false, texto: `No existe el valet ${pedido}. Elige el tuyo.` } : null} />
      <Chips
        etiqueta="Valets"
        chips={listaValets(estado).map((v) => ({
          id: v.id,
          texto: (
            <>
              <span className="num">{v.id}</span> · {v.entrada}
            </>
          ),
          href: href("valet", { valet: v.id }),
        }))}
      />
    </Shell>
  );
}
