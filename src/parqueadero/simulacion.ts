import type { Escenario, EventoSimulado } from "./escenario.ts";
import { ejecutar, type Comando } from "./motor.ts";
import type { Estado } from "./tipos.ts";

/** Simulated arrivals and exits from the scenario file, as the commands a real camera and cashier would send. */
export function comandosDelEvento(evento: EventoSimulado): Comando[] {
  if (evento.tipo === "llegada") return [{ tipo: "registrarLlegada", placa: evento.placa, entrada: evento.entrada }];
  return [
    { tipo: "pagar", placa: evento.placa },
    { tipo: "salir", placa: evento.placa },
  ];
}

/**
 * Moves the clock one minute at a time up to `hasta`, running each scenario event at its minute.
 * Events the rules reject (a full passage, an unknown plate) are returned with their reason.
 */
export function simularHasta(estado: Estado, escenario: Escenario, hasta: number): { estado: Estado; rechazos: string[] } {
  let actual = estado;
  const rechazos: string[] = [];
  while (actual.minuto < hasta) {
    const paso = ejecutar(actual, { tipo: "avanzarReloj", minutos: 1 });
    if (!paso.ok) break;
    actual = paso.estado;
    for (const evento of escenario.eventos.filter((e) => e.minuto === actual.minuto)) {
      for (const comando of comandosDelEvento(evento)) {
        const resultado = ejecutar(actual, comando);
        if (resultado.ok) actual = resultado.estado;
        else rechazos.push(`Minuto ${evento.minuto}: ${resultado.motivo}`);
      }
    }
  }
  return { estado: actual, rechazos };
}
