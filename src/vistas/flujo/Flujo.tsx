import { useEffect } from "react";
import "./flujo.css";

/** The four real screens of the flow, side by side and live: every action shows up in the others at once. */
const PANTALLAS = [
  { titulo: "1 · Conductor: registra la placa, contrata y paga el valet", ruta: "conductor?demo=1" },
  { titulo: "2 · Portería Regional: asigna la celda", ruta: "porteria?entrada=regional" },
  { titulo: "3 · Valet RG-V1: recibe el carro, estaciona, deja las llaves", ruta: "valet?valet=RG-V1&codigo=8542&demo=1" },
  { titulo: "4 · Oficina: entrega las llaves con el ficho", ruta: "oficina" },
];

export default function Flujo() {
  useEffect(() => {
    document.title = "Flujo completo · Parqueadero EAFIT";
  }, []);
  const base = window.location.pathname;
  return (
    <main className="fl-flujo" aria-label="Flujo completo con todas las vistas">
      {PANTALLAS.map((p) => (
        <section key={p.ruta} className="fl-pantalla">
          <h2>{p.titulo}</h2>
          <iframe title={p.titulo} src={`${base}#/${p.ruta}`} />
        </section>
      ))}
    </main>
  );
}
