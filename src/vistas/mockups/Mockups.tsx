import { useEffect } from "react";
import { Car, Clock, KeyRound } from "lucide-react";
import { CELDA_ELEGIDA, TARIFA, ZONAS, ZONA_ELEGIDA, peso } from "./datos";
import { MapaCampus } from "./MapaCampus";
import { Hoja, Telefono } from "./Telefono";
import "../../ui/tokens.css";
import "./mockups.css";

const zona = ZONAS.find((z) => z.id === ZONA_ELEGIDA)!;
const celdaId = `${zona.id}-${String(CELDA_ELEGIDA).padStart(2, "0")}`;

/** Read-only phone mockups: the lot as a seat map, a chosen zone, and the reserved cell. */
export default function Mockups() {
  useEffect(() => {
    document.title = "Mockups · Parqueadero EAFIT";
  }, []);
  return (
    <main className="mk-pagina">
      <header className="mk-intro">
        <p>Parqueadero EAFIT · solo lectura</p>
        <h1>Elige tu zona como eliges tu silla</h1>
      </header>
      <div className="mk-fila">
        <Telefono titulo="1 · El lote por zonas">
          <MapaCampus />
          <Hoja titulo="Lote Carrera 48">
            <p className="mk-resumen">
              {ZONAS.reduce((n, z) => n + z.libres, 0)} celdas libres en {ZONAS.filter((z) => z.libres > 0).length} zonas
            </p>
            <Leyenda />
          </Hoja>
        </Telefono>

        <Telefono titulo="2 · Zona elegida">
          <MapaCampus elegida={ZONA_ELEGIDA} />
          <Hoja titulo={`Zona ${zona.id}`}>
            <div className="mk-oferta">
              <div className="mk-miniatura">
                <MapaCampus elegida={ZONA_ELEGIDA} miniatura />
              </div>
              <div>
                <span className="mk-sub">Fila 1 · junto a Entrada {zona.entrada}</span>
                <strong className="mk-precio">
                  {peso(TARIFA.minuto)} <span>por minuto</span>
                </strong>
                <span className="mk-alerta">Alta demanda</span>
                <span className="mk-sub">
                  {zona.libres} de {zona.total} celdas libres
                </span>
              </div>
            </div>
          </Hoja>
        </Telefono>

        <Telefono titulo="3 · Tu celda">
          <MapaCampus elegida={ZONA_ELEGIDA} celda={CELDA_ELEGIDA} />
          <Hoja titulo={`Celda ${celdaId}`}>
            <ul className="mk-datos">
              <li>
                <Clock size={16} aria-hidden="true" /> Llega antes de las 7:42 a.m.
              </li>
              <li>
                <Car size={16} aria-hidden="true" /> Vas 3.º en la fila de {zona.entrada}
              </li>
              <li>
                <KeyRound size={16} aria-hidden="true" /> Valet incluido · {peso(TARIFA.valet)}
              </li>
            </ul>
            <span className="mk-boton">Reservada</span>
          </Hoja>
        </Telefono>
      </div>
    </main>
  );
}

function Leyenda() {
  const items = [
    ["libre", "Varias libres"],
    ["pocas", "Pocas"],
    ["llena", "Llena"],
  ];
  return (
    <ul className="mk-leyenda">
      {items.map(([tono, texto]) => (
        <li key={tono}>
          <span className={`mk-muestra mk-${tono}`} aria-hidden="true" />
          {texto}
        </li>
      ))}
    </ul>
  );
}
