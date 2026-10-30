import type { ReactNode } from "react";
import { ChevronLeft, Info, SlidersHorizontal, X } from "lucide-react";
import { TARIFA, peso } from "./datos";
import "./telefono.css";

/** A phone frame with the shared map header: back, title, info and the filter chips. */
export function Telefono({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <figure className="mk-telefono">
      <div className="mk-pantalla">
        <div className="mk-estado" aria-hidden="true">
          <span>7:28</span>
          <span>5G ▮</span>
        </div>
        <header className="mk-cabecera">
          <ChevronLeft size={20} aria-hidden="true" />
          <div>
            <strong>Parqueadero EAFIT</strong>
            <span>Hoy, jue 30 oct · 7:30 a.m.</span>
          </div>
          <Info size={18} aria-hidden="true" />
        </header>
        <div className="mk-chips" aria-hidden="true">
          <span className="mk-chip mk-chip-icono">
            <SlidersHorizontal size={14} />
          </span>
          <span className="mk-chip">Con valet</span>
          <span className="mk-chip">{peso(TARIFA.minuto)}/min</span>
          <span className="mk-chip">Entrada</span>
        </div>
        {children}
        <span className="mk-barra-inicio" aria-hidden="true" />
      </div>
      <figcaption>{titulo}</figcaption>
    </figure>
  );
}

/** Bottom sheet shared by the zone and cell screens. */
export function Hoja({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mk-hoja" aria-label={titulo}>
      <header>
        <strong>{titulo}</strong>
        <X size={18} aria-hidden="true" />
      </header>
      {children}
    </section>
  );
}
