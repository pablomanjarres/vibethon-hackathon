import { Ticket } from "lucide-react";
import { CodigoFicho } from "./CodigoFicho";
import "./ficho.css";

interface Props {
  ficho: string;
  placa: string;
  celda: string | null;
  valet: string | null;
}

/** The valet claim ticket: big ficho code, plate, cell when known and a code to show at the gate. */
export function Ficho({ ficho, placa, celda, valet }: Props) {
  const filas = [
    { etiqueta: "Placa", valor: placa },
    { etiqueta: "Celda", valor: celda ?? "Por asignar" },
    { etiqueta: "Valet", valor: valet ?? "Por asignar" },
  ];
  return (
    <section className="cd-ticket" aria-label={`Ficho ${ficho}`}>
      <div className="cd-ticket-cabeza">
        <p className="cd-ticket-ceja">
          <Ticket size={16} aria-hidden="true" /> Tu ficho de valet
        </p>
        <p className="cd-ticket-codigo num">{ficho}</p>
        <dl className="cd-ticket-datos">
          {filas.map((fila) => (
            <div key={fila.etiqueta}>
              <dt>{fila.etiqueta}</dt>
              <dd className="num">{fila.valor}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="cd-ticket-corte" aria-hidden="true" />
      <div className="cd-ticket-pie">
        <CodigoFicho texto={`${ficho}-${placa}`} />
        <p className="ui-texto-suave">Muéstralo en la portería para recibir tus llaves.</p>
      </div>
    </section>
  );
}
