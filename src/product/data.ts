/**
 * Placeholder domain: types, the status table and pure helpers. Every badge, count and
 * action label reads from here. No state, no IO.
 */
import { CheckCircle2, CircleDashed, CircleDot, OctagonAlert, type LucideIcon } from "lucide-react";

export type Status = "new" | "in_progress" | "blocked" | "done";
export type Tone = "info" | "progress" | "danger" | "success";

export interface Item {
  id: string;
  title: string;
  /** Null when nobody owns it yet; shown as "Not assigned", never blank. */
  owner: string | null;
  status: Status;
  /** ISO timestamp. */
  updatedAt: string;
  /** Bumped by every committed change; a write sends the version it saw. */
  version: number;
  note: string;
}

export interface Receipt {
  itemId: string;
  version: number;
  at: string;
  text: string;
}

/** The single owner of status wording, tone and icon. A new Status fails to compile until it is listed. */
export const STATUS_META = {
  new: { label: "New", tone: "info", icon: CircleDot, canClose: true, open: true },
  in_progress: { label: "In progress", tone: "progress", icon: CircleDashed, canClose: true, open: true },
  blocked: { label: "Blocked", tone: "danger", icon: OctagonAlert, canClose: false, open: true },
  done: { label: "Done", tone: "success", icon: CheckCircle2, canClose: false, open: false },
} satisfies Record<Status, { label: string; tone: Tone; icon: LucideIcon; canClose: boolean; open: boolean }>;

export const STATUS_ORDER: Status[] = ["blocked", "new", "in_progress", "done"];

export function countByStatus(items: Item[]) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0])) as Record<Status, number>;
  items.forEach((item) => counts[item.status]++);
  return counts;
}

/** Items still needing work, per the status table. One owner for the header count. */
export function openCount(items: Item[]) {
  return items.filter((item) => STATUS_META[item.status].open).length;
}

/** The receipt for a closed item, whether confirmed now or found later by a status check. */
export function receiptFor(item: Item): Receipt {
  return { itemId: item.id, version: item.version, at: item.updatedAt, text: `${item.id} closed` };
}

/** The one write: close an item. Returns the new record and its receipt. */
export function closeItem(item: Item, at: string): { item: Item; receipt: Receipt } {
  const next: Item = { ...item, status: "done", version: item.version + 1, updatedAt: at };
  return { item: next, receipt: receiptFor(next) };
}

const time = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function formatTime(iso: string) {
  return time.format(new Date(iso));
}
