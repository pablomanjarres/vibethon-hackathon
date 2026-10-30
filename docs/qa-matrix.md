# QA matrix: <product name>

Copy to `docs/qa-matrix.md`. Mark every cell **designed**, **implemented**, **tested** or **deferred: <reason>**. A blank cell is an unresolved decision, not a pass. Open each state on demand with `?demo=<state>` and the DemoBar.

## 1. States by screen

Put one column per screen in the demo path. Example column: the Ventana inbox (operational workspace).

| State | Pass when | Inbox (example) | <screen 2> | <screen 3> |
|---|---|---|---|---|
| Empty | Says why it is empty and offers the first action | tested: E00 "No requests need a decision" + Check for new requests | | |
| Loading | Each async action has its own pending state; skeletons match the content | | | |
| Success | Appears only after confirmation; names what happens next | | | |
| Validation error | Inline message per field; focus moves to the first error | | | |
| Service failure | Entered data kept; retry offered | | | |
| Uncertain outcome | Reconciled with Check status before any retry | | | |
| Long and variable content | Long names, URLs, emoji, multiline text, missing media keep the layout | | | |
| Role and access | Restricted actions refused with an explanation | | | |
| Keyboard and focus | Tab order, visible ring on every control, dialogs trap and return focus, Escape | | | |
| Assistive use and motion | Status announced with a text label; nothing depends on motion | | | |
| Responsive and device | No horizontal overflow at 1440, 1100, 760, 390, **360** px; on-screen keyboard does not hide essential fields; one real phone | | | |

## 2. Fixtures

F01 to F04 are required in every build. F05 to F08 are required for approval workspaces and optional elsewhere; write the deferral reason.

| ID | Condition | Expected result | `?demo=` | Status |
|---|---|---|---|---|
| F01 Normal | Typical record, permitted user | Main action completes; receipt names the exact record and version | (none) | |
| F02 Long content | Long names, long text, URLs, emoji, missing image | Text wraps; controls stay usable | `long` | |
| F03 Slow | Response delayed about 3 s | Pending state visible; no early success | `slow` | |
| F04 Rejected | Controlled failure | Entered work kept; reason and recovery shown | `fail` | |
| F05 Stale | Screen on version N, store holds N+1 | Action on N refused; Review the latest version | `stale` | |
| F06 No permission | Role lacks the right, or loses it mid-session | Action refused; access state explained | (add) | |
| F07 Unknown outcome | Committed, reply lost | Check status finds the result; retry does not duplicate | `unknown` | |
| F08 Duplicate | Double click or two tabs | Exactly one result | (manual) | |
| E00 Empty | No data | Why it is empty plus one action | `empty` | |

## 3. Three passes, in order

- [ ] Logic: status moves, calculations, versions, duplicates, unknown outcomes.
- [ ] Interaction: keyboard walk, long content, validation, slow responses (F02 to F04).
- [ ] Environment: deployed build, a real phone in portrait, a narrower width, zoomed text, the on-screen keyboard, dialog edges, return after an interruption.
- [ ] `node scripts/sweep.mjs` reports "all routes and states clean".

## 4. Release blockers (fix before any cosmetic work)

- [ ] No wrong record or version changed.
- [ ] No lost user input.
- [ ] No false success.
- [ ] Every essential control reachable by keyboard and on a phone.
- [ ] No broken route or dead link in the demo path.
- [ ] No untested core dependency.

## 5. Defects

| Title (user consequence) | Fixture | Steps | Expected | Actual | Severity and why | Retest |
|---|---|---|---|---|---|---|
| | | | | | | |

## 6. Performance (deployed build, mobile profile)

| Route | LCP (≤ 2.5 s) | INP (≤ 200 ms) | CLS (≤ 0.1) | Device, viewport, connection, data |
|---|---|---|---|---|
| | | | | |
