import demo from "./demo.json" with { type: "json" };
import { validarEscenario, type Escenario } from "../escenario.ts";

/**
 * Scenarios by id, each checked at load. To use the organizers' maps, starting conditions and
 * events, add their JSON file here and point ESCENARIO_INICIAL at it.
 */
export const ESCENARIOS: Record<string, Escenario> = {
  demo: validarEscenario(demo),
};

export const ESCENARIO_INICIAL: Escenario = ESCENARIOS.demo;
