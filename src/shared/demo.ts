import { useRoute } from "./route";

/**
 * Standard fixture set from the quality standard. Each product wires its data layer to the
 * active scenario so every state can be opened on demand: ?demo=slow, ?demo=fail, and so on.
 */
export const scenarios = [
  { id: "normal", code: "F01", label: "Normal", hint: "Typical data, action succeeds" },
  { id: "long", code: "F02", label: "Long content", hint: "Long names, long text, missing media" },
  { id: "slow", code: "F03", label: "Slow", hint: "Responses take about 3 seconds" },
  { id: "fail", code: "F04", label: "Rejected", hint: "The service refuses the action" },
  { id: "empty", code: "E00", label: "Empty", hint: "No data yet" },
  { id: "stale", code: "F05", label: "Stale", hint: "Someone else changed the record" },
  { id: "unknown", code: "F07", label: "Unknown outcome", hint: "Saved, but the reply was lost" },
] as const;

export type ScenarioId = (typeof scenarios)[number]["id"];

export function useScenario(): ScenarioId {
  const { params } = useRoute();
  const value = params.get("demo");
  return (scenarios.find((item) => item.id === value)?.id ?? "normal") as ScenarioId;
}

export class ServiceError extends Error {
  constructor(
    message: string,
    readonly code: "rejected" | "stale" | "unknown" = "rejected",
  ) {
    super(message);
  }
}

/**
 * Simulated service call. Resolves after a short delay, or a long one for "slow".
 * Rejects for "fail", "stale" and "unknown" so screens must handle each outcome.
 */
export function simulate<T>(value: T, scenario: ScenarioId, options: { mutation?: boolean } = {}) {
  const delay = scenario === "slow" ? 3000 : options.mutation ? 700 : 450;
  return new Promise<T>((resolve, reject) => {
    window.setTimeout(() => {
      if (options.mutation && scenario === "fail")
        reject(new ServiceError("The service refused this change. Nothing was saved.", "rejected"));
      else if (options.mutation && scenario === "stale")
        reject(new ServiceError("This record changed after you opened it. Review the new version first.", "stale"));
      else if (options.mutation && scenario === "unknown")
        reject(new ServiceError("The change may have been saved, but no reply arrived. Check its status before trying again.", "unknown"));
      else resolve(value);
    }, delay);
  });
}
