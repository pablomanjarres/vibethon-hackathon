import type { Espera } from "../../parqueadero/espera";
import { hora } from "../../parqueadero/lecturas/formato";
import "./pasos.css";

interface Props {
  espera: Espera;
  entrada: string | null;
  /** Inside the passage already; otherwise still in the outer line. */
  enPasaje: boolean;
  inicio: string;
  minuto: number;
  llegoEn: number;
}

/** When the gate turn may come: a clock range, "ya" with a free cell, or no time without data. */
function turno(espera: Espera, inicio: string, minuto: number): string {
  if (!espera.suficientesDatos || !espera.rango) return "Sin estimación aún";
  if (espera.rango.max === 0) return "Tu turno es ya";
  return `Entre las ${hora(inicio, minuto + espera.rango.min)} y las ${hora(inicio, minuto + espera.rango.max)}`;
}

/** The wait as a forecast: the steps from registration to the cell, with their times. */
export function Pronostico({ espera, entrada, enPasaje, inicio, minuto, llegoEn }: Props) {
  const pasos = [
    { texto: "Registro", detalle: `A las ${hora(inicio, llegoEn)}`, hecho: true },
    enPasaje
      ? { texto: "Pasaje", detalle: entrada ? `En ${entrada}, ahora` : "Ahora", hecho: true }
      : { texto: "Pasaje", detalle: "Apenas haya cupo", hecho: false },
    { texto: "Portería", detalle: turno(espera, inicio, minuto), hecho: false },
    { texto: "Celda", detalle: "Justo después de la portería", hecho: false },
  ];
  return (
    <ol className="cd-linea">
      {pasos.map((paso) => (
        <li key={paso.texto} className={paso.hecho ? "cd-hecho" : undefined}>
          <span className="cd-punto" aria-hidden="true" />
          <span className="cd-linea-texto">{paso.texto}</span>
          <span className="cd-linea-detalle num">{paso.detalle}</span>
        </li>
      ))}
    </ol>
  );
}
