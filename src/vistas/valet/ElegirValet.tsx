import { useId } from "react";
import type { listaValets } from "../../parqueadero/lecturas/valet";
import { href } from "../../shared/route";
import { ESTADO_VALET } from "../../ui/estados";

/** Which valet's phone to show; a select keeps a long roster to one line on a phone. */
export function ElegirValet({ valets, actual }: { valets: ReturnType<typeof listaValets>; actual: string }) {
  const id = useId();
  return (
    <div className="vl-elegir">
      <label htmlFor={id}>Valet</label>
      <select id={id} value={actual} onChange={(event) => window.location.assign(href("valet", { valet: event.target.value }))}>
        {valets.map((x) => (
          <option key={x.id} value={x.id}>
            {x.id} · {x.entrada} · {ESTADO_VALET[x.estado].texto}
          </option>
        ))}
      </select>
    </div>
  );
}
