import { Timer } from "lucide-react";
import type { Espera } from "../../parqueadero/espera";
import { carros, hora } from "../../parqueadero/lecturas/formato";
import { Tarjeta } from "../../ui/Tarjeta";
import "./pasos.css";

interface Props {
  espera: Espera;
  entrada: string | null;
  inicio: string;
  minuto: number;
  llegoEn: number;
}

/** The wait as a forecast: minutes, cars ahead and the steps from registration to the cell. */
export function Pronostico({ espera, entrada, inicio, minuto, llegoEn }: Props) {
  const turno = hora(inicio, minuto + espera.minutos);
  const pasos = [
    { texto: "Registro", detalle: `A las ${hora(inicio, llegoEn)}`, hecho: true },
    { texto: "Pasaje", detalle: entrada ? `En ${entrada}, ahora` : "Ahora", hecho: true },
    { texto: "Portería", detalle: espera.minutos === 0 ? "Tu turno es ya" : `Hacia las ${turno}`, hecho: false },
    { texto: "Celda", detalle: "Justo después de la portería", hecho: false },
  ];
  return (
    <Tarjeta titulo="Tu espera" Icono={Timer}>
      <div className="cd-pronostico">
        <p className="cd-pronostico-min num">
          {espera.minutos}
          <span> min</span>
        </p>
        <p className="ui-texto-suave">
          {espera.carrosAdelante === 0 ? "Eres el siguiente en la fila." : `${carros(espera.carrosAdelante)} antes que tú, contando ambas entradas.`}
        </p>
      </div>
      <ol className="cd-linea">
        {pasos.map((paso) => (
          <li key={paso.texto} className={paso.hecho ? "cd-hecho" : undefined}>
            <span className="cd-punto" aria-hidden="true" />
            <span className="cd-linea-texto">{paso.texto}</span>
            <span className="cd-linea-detalle num">{paso.detalle}</span>
          </li>
        ))}
      </ol>
    </Tarjeta>
  );
}
