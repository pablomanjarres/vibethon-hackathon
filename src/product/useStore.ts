/**
 * The store owns every read and write. It plays the part of the service: all traffic goes
 * through simulate(), a write sends the version it saw, a second click while pending is
 * ignored, and an unknown outcome is reconciled with a status check before any retry.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAnnounce } from "../shared/Announcer";
import { ServiceError, simulate, type ScenarioId } from "../shared/demo";
import { closeItem, receiptFor, STATUS_META, type Item, type Receipt } from "./data";
import { longItems, seedItems } from "./fixtures";

export type Attempt =
  | { state: "pending" }
  | { state: "failed"; code: ServiceError["code"]; message: string }
  | { state: "checking" }
  | { state: "reloading" }
  | { state: "refreshed"; version: number }
  | { state: "done"; receipt: Receipt; reconciled: boolean };

export const isBusy = (attempt: Attempt | undefined) =>
  attempt?.state === "pending" || attempt?.state === "checking" || attempt?.state === "reloading";

/** The service's copy is saved on this device, so a refresh never loses work. Rename the key per product. */
const SAVE_KEY = "product-items-v1";
function loadSaved(): Item[] | null {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
  } catch {
    return null;
  }
}
function save(items: Item[]) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(items));
  } catch {
    // Storage blocked (private mode): keep working in memory.
  }
}

function seedFor(scenario: ScenarioId): Item[] {
  if (scenario === "empty") return [];
  return scenario === "long" ? longItems() : (loadSaved() ?? seedItems());
}

export function useStore(scenario: ScenarioId) {
  const announce = useAnnounce();
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [items, setItems] = useState<Item[]>([]);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  /** The service's copy. The screen only sees it through simulate(). */
  const server = useRef<Item[]>([]);
  const busy = useRef(new Set<string>());
  const refreshed = useRef(new Set<string>());
  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;

  const setAttempt = (id: string, attempt: Attempt) => setAttempts((current) => ({ ...current, [id]: attempt }));

  const load = useCallback(async (isCancelled: () => boolean = () => false) => {
    setPhase("loading");
    const read = await simulate(server.current.map((item) => ({ ...item })), scenarioRef.current);
    if (isCancelled()) return;
    setItems(read);
    setPhase("ready");
  }, []);

  // A new scenario starts from its own seed.
  useEffect(() => {
    let cancelled = false;
    server.current = seedFor(scenario);
    refreshed.current.clear();
    busy.current.clear();
    setAttempts({});
    load(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [scenario, load]);

  const replaceOnServer = (next: Item) => {
    server.current = server.current.map((item) => (item.id === next.id ? next : item));
    if (scenarioRef.current !== "empty" && scenarioRef.current !== "long") save(server.current);
  };

  const close = useCallback(
    async (item: Item) => {
      const id = item.id;
      if (busy.current.has(id)) return;
      busy.current.add(id);
      setAttempt(id, { state: "pending" });
      const current = scenarioRef.current;
      // After a stale refusal the user has seen the new version, so the next try goes through.
      const effective = current === "stale" && refreshed.current.has(id) ? "normal" : current;
      try {
        await simulate(null, effective, { mutation: true });
        const stored = server.current.find((entry) => entry.id === id);
        if (!stored || stored.version !== item.version)
          throw new ServiceError("This item changed after you opened it. Review the new version first.", "stale");
        if (!STATUS_META[stored.status].canClose) throw new ServiceError("This item can no longer be closed.", "rejected");
        const result = closeItem(stored, new Date().toISOString());
        replaceOnServer(result.item);
        setItems((list) => list.map((entry) => (entry.id === id ? result.item : entry)));
        setAttempt(id, { state: "done", receipt: result.receipt, reconciled: false });
        announce(`${result.receipt.text}, version ${result.receipt.version}.`);
      } catch (error) {
        const failure = error instanceof ServiceError ? error : new ServiceError("Something went wrong. Nothing was saved.");
        const stored = server.current.find((entry) => entry.id === id);
        if (failure.code === "unknown" && stored) replaceOnServer(closeItem(stored, new Date().toISOString()).item);
        if (failure.code === "stale" && stored && stored.version === item.version)
          replaceOnServer({ ...stored, version: stored.version + 1, owner: stored.owner ?? "Sam Price", updatedAt: new Date().toISOString() });
        setAttempt(id, { state: "failed", code: failure.code, message: failure.message });
        announce(failure.message);
      } finally {
        busy.current.delete(id);
      }
    },
    [announce],
  );

  /** Unknown outcome: read the record and show what really happened. Never repeats the write. */
  const checkStatus = useCallback(
    async (id: string) => {
      setAttempt(id, { state: "checking" });
      const read = await simulate(server.current.find((entry) => entry.id === id), "normal");
      if (!read) return;
      setItems((list) => list.map((entry) => (entry.id === id ? read : entry)));
      if (read.status === "done") {
        setAttempt(id, { state: "done", receipt: receiptFor(read), reconciled: true });
        announce(`${id} was already closed. Nothing was sent twice.`);
      } else {
        setAttempts(({ [id]: _, ...rest }) => rest);
        announce(`${id} was not closed. You can close it now.`);
      }
    },
    [announce],
  );

  /** Stale refusal: load the latest version so the user decides on what is on file. */
  const reviewLatest = useCallback(async (id: string) => {
    setAttempt(id, { state: "reloading" });
    const read = await simulate(server.current.find((entry) => entry.id === id), "normal");
    if (!read) return;
    refreshed.current.add(id);
    setItems((list) => list.map((entry) => (entry.id === id ? read : entry)));
    setAttempt(id, { state: "refreshed", version: read.version });
  }, []);

  return { phase, items, attempts, close, checkStatus, reviewLatest };
}
