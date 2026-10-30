import { ChevronRight, ParkingSquare } from "lucide-react";
import { routes } from "./routes";
import { href } from "./shared/route";
import { PanelCabecera } from "./ui/PanelCabecera";
import { Shell, VISTAS } from "./ui/Shell";
import { TarjetaDatos } from "./ui/TarjetaDatos";
import { useEstado } from "./ui/useTienda";
import "./index-page.css";

/** Entry page over the live lot: one row per view, each with a one-line summary. */
export function IndexPage() {
  const estado = useEstado();
  const libres = estado.celdas.filter((c) => c.estado === "libre").length;
  const enFila = estado.entradas.reduce((suma, e) => suma + e.fila.length, 0);
  return (
    <Shell>
      <PanelCabecera Icono={ParkingSquare} titulo="Parqueadero EAFIT" subtitulo="Reserva tu celda y tu valet en el campus" />
      <TarjetaDatos Icono={ParkingSquare} titulo="Lote en vivo" contador={{ valor: `${libres}/${estado.celdas.length}`, etiqueta: "Libres" }}>
        <p className="ui-texto-suave">
          {enFila === 1 ? "1 carro espera" : `${enFila} carros esperan`} en los pasajes. Todas las vistas comparten este lote.
        </p>
      </TarjetaDatos>
      <nav aria-label="Vistas">
        <ul className="index-lista">
          {routes.map((route) => {
            const Icono = VISTAS.find((v) => v.id === route.path)?.Icono;
            return (
              <li key={route.path}>
                <a href={href(route.path)}>
                  {Icono && <Icono size={18} strokeWidth={2} aria-hidden="true" />}
                  <span className="index-texto">
                    <strong>{route.name}</strong>
                    <span>{route.summary}</span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </Shell>
  );
}
