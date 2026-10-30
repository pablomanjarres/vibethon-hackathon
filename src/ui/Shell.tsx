import { useEffect, type ReactNode } from "react";
import { Building2, Car, KeyRound, ShieldCheck, type LucideIcon } from "lucide-react";
import { href } from "../shared/route";
import "./tokens.css";
import "./shell.css";
import "./texto.css";

export type VistaId = "conductor" | "porteria" | "valet" | "oficina";

/** The four views, one shared state. Order here is the order in the navigation. */
export const VISTAS: { id: VistaId; nombre: string; Icono: LucideIcon }[] = [
  { id: "conductor", nombre: "Conductor", Icono: Car },
  { id: "porteria", nombre: "Portería", Icono: ShieldCheck },
  { id: "valet", nombre: "Valet", Icono: KeyRound },
  { id: "oficina", nombre: "Oficina", Icono: Building2 },
];

interface Props {
  vista: VistaId;
  /** Right side of the bar: clock and quick controls. */
  extra?: ReactNode;
  /** Full-bleed map layouts drop the content width. */
  ancho?: boolean;
  children: ReactNode;
}

export function Shell({ vista, extra, ancho, children }: Props) {
  const actual = VISTAS.find((item) => item.id === vista)!;
  useEffect(() => {
    document.title = `${actual.nombre} · Parqueadero EAFIT`;
  }, [actual.nombre]);
  return (
    <div className="ui-app">
      <header className="ui-barra">
        <a className="ui-marca" href={href("")}>
          <span className="ui-marca-punto" aria-hidden="true" />
          Parqueadero EAFIT
        </a>
        <nav aria-label="Vistas">
          <ul className="ui-nav">
            {VISTAS.map(({ id, nombre, Icono }) => (
              <li key={id}>
                <a href={href(id)} aria-current={id === vista ? "page" : undefined}>
                  <Icono size={17} strokeWidth={2} aria-hidden="true" />
                  <span>{nombre}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {extra && <div className="ui-barra-extra">{extra}</div>}
      </header>
      <main className={ancho ? "ui-main ui-main-ancho" : "ui-main"}>{children}</main>
    </div>
  );
}
