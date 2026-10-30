/**
 * Fixtures (invented people and content only). Dates are relative to today.
 * F01 normal   seedItems(): 8 items across every status, one without an owner.
 * F02 long     longItems(): long titles and names, a URL, an emoji, a missing owner.
 * E00 empty    the store returns no items.
 * F03 to F07 come from the shared simulate() in src/shared/demo.ts.
 */
import type { Item, Status } from "./data";

type Row = [number, string, string | null, Status, number, string];

const rows: Row[] = [
  [104, "Replace the broken badge reader at the side entrance", "Dana Ortiz", "new", 1, "Reported twice this week. The side door stays locked for deliveries."],
  [103, "Renew the shared calendar licence", "Mika Hale", "in_progress", 3, "Quote received; waiting on the purchase order."],
  [102, "Move the weekly review to Thursday", null, "new", 4, "Two people asked. Nobody has picked it up yet."],
  [101, "Fix the expense export for March", "Ren Ito", "blocked", 6, "Blocked until finance shares the new category list."],
  [100, "Order replacement chairs for room 2", "Dana Ortiz", "in_progress", 9, "Three chairs are broken. Supplier confirmed stock."],
  [99, "Update the onboarding checklist", "Sam Price", "done", 12, "New laptop steps added."],
  [98, "Archive last year's project folders", "Mika Hale", "done", 15, "Done and checked by the owner."],
  [97, "Set up the guest network password rotation", "Ren Ito", "blocked", 20, "Needs the network admin, who is away until next week."],
];

function build(row: Row, today: Date, stretch = false): Item {
  const [n, title, owner, status, hoursAgo, note] = row;
  return {
    id: `REQ-${n}`,
    title: stretch ? `${title}, including the follow-up items raised at the last two reviews 🗂️` : title,
    owner: stretch && owner ? `${owner}-Fitzgerald Montgomery-Wellesley` : owner,
    status,
    updatedAt: new Date(today.getTime() - hoursAgo * 3_600_000).toISOString(),
    version: 1 + (n % 4),
    note: stretch
      ? `${note} Background and the full thread: https://intranet.example.com/requests/${n}/history?view=all&include=attachments ${note}`
      : note,
  };
}

export function seedItems(today = new Date()): Item[] {
  return rows.map((row) => build(row, today));
}

export function longItems(today = new Date()): Item[] {
  return rows.map((row) => build(row, today, true));
}
