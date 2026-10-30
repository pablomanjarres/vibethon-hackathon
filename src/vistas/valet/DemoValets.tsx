import { FlaskConical } from "lucide-react";
import { href, useRoute } from "../../shared/route";
import { Acordeon } from "../../ui/Acordeon";
import { ESTADO_VALET } from "../../ui/estados";
import { useEstado } from "../../ui/useTienda";

/** Demo shortcut, only with ?demo in the link: every valet with its code, one click to open that phone. */
export function DemoValets() {
  const estado = useEstado();
  const { params } = useRoute();
  if (!params.has("demo")) return null;
  const actual = params.get("valet");
  return (
    <div className="vl-demo">
      <Acordeon Icono={FlaskConical} titulo="Modo demo" extra={`${estado.valets.length} valets`}>
        <ul className="vl-demo-lista">
          {estado.valets.map((v) => (
            <li key={v.id}>
              <a
                className="vl-demo-valet"
                href={href("valet", { valet: v.id, codigo: v.codigo, demo: "1" })}
                aria-current={v.id === actual ? "true" : undefined}
              >
                <strong className="num">{v.id}</strong>
                <span className="num">{v.codigo}</span>
                <span>{ESTADO_VALET[v.estado].texto}</span>
              </a>
            </li>
          ))}
        </ul>
      </Acordeon>
    </div>
  );
}
