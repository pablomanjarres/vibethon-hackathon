import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { routes } from "./routes";
import { href } from "./shared/route";
import { VISTAS } from "./ui/Shell";
import "./ui/tokens.css";
import "./index-page.css";

/** Entry page: one link per view, each with a one-line summary. */
export function IndexPage() {
  useEffect(() => {
    document.title = "Parqueadero EAFIT";
  }, []);
  return (
    <main className="index-page">
      <p className="index-ceja">Parqueadero EAFIT</p>
      <h1>Reserva tu celda y tu valet en el campus</h1>
      <p className="index-intro">Elige una vista. Todas comparten el mismo lote en vivo.</p>
      <ul>
        {routes.map((route) => {
          const Icono = VISTAS.find((v) => v.id === route.path)?.Icono;
          return (
            <li key={route.path}>
              <a href={href(route.path)}>
                {Icono && (
                  <span className="index-icono" aria-hidden="true">
                    <Icono size={20} strokeWidth={2} />
                  </span>
                )}
                <span className="index-texto">
                  <strong>{route.name}</strong>
                  <span>{route.summary}</span>
                </span>
                <ChevronRight size={20} aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
