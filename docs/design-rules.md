# Design rules: <product name>

Copy to `docs/design-rules.md`. Write it before the second screen, from the hero screen, one dialog, one form and one failure state.

Reference: <site> (https://styles.refero.design/style/<id>), saved in `references/refero/<site>/`. The reference wins every style conflict (fonts, uppercase labels, dark canvas). Accessibility, the async contract, demo states and honest content still apply in full.

## 1. Tokens (copied from the reference DESIGN.md)

Copy the colors table from the reference DESIGN.md with its roles, then say where each token is used here. Scope them on the app root (`.xx-app`). Keep the reference's names.

| Token | Value | Role in the reference | Use in this product |
|---|---|---|---|
| `--color-void` | #08090a | Page canvas, full-bleed backgrounds | Canvas and sidebar |
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

| Shape and depth | Value from the reference | Applied to |
|---|---|---|
| Radius, controls | | buttons, inputs, filters |
| Radius, panels and cards | | |
| Radius, pills | | status pills only, or as the reference does |
| Shadows | | which surfaces get which shadow |
| Borders | | hairline width and color |
| Spacing base and scale | | |
| Content width | | |

## 2. Type ladder (exactly five roles)

Families are the reference's, or the free substitutes its DESIGN.md names (installed with `@fontsource`). Floor: 12 px for anything read, 11 px only for tiny meta. Tabular figures on every number, ID, date and amount.

| Role | Family | Size / line height | Weight | Tracking | Why it works |
|---|---|---|---|---|---|
| Page title | Inter | 20 / 1.3 | 590 | -0.012em | Linear's issue title size; dense screen stays scannable |
| Section title | | | | | |
| Body | | | | | |
| Metadata | | | | | |
| Control label | | | | | |
| Headline figure (data screens only) | | | | | |

## 3. Visual rules

- [ ] Status colors carry meaning only; every status also shows its text label and icon (`status.ts`).
- [ ] The strongest emphasis is the single primary action on each screen: <which color, which shape>.
- [ ] Long text: max line length <n>ch, wrap with `overflow-wrap: anywhere`, truncation only where the full text is one click away.
- [ ] Every grid column `minmax(0, 1fr)`; text-holding flex children `min-width: 0`.
- [ ] Touch targets 44 px on phones; dense desktop controls at least 28 px.
- [ ] Sentence case for product copy; uppercase only where the reference uses it.
- [ ] Never copied from the reference: logo, name, mascots, illustrations, photos, text.

## 4. Behavior contracts

| Component | Must define | Written rule here |
|---|---|---|
| Button | default, hover, focus, disabled, pending | |
| Dialog, drawer, sheet | entry point, clear title, Escape, initial focus, return-focus target (`useDialog`) | |
| Status badge | text label + tone + icon from the status table | |
| Form field | label, hint, inline error with `aria-invalid` and `aria-describedby`, disabled reason | |
| Async action | pending, success only after confirmation, failure keeps input with retry, unknown outcome offers Check status | |
| Empty state | why it is empty plus one action | |
| Skeleton | shaped like the final content | |

## 5. Icon audit (core journey)

Each icon: a familiar meaning, the same stroke and fill as the rest, optically aligned, an accessible name when it is a control. Keep a library icon that works; replace one that fails.

| Icon | Where | Meaning | Accessible name (if a control) | Keep / replace |
|---|---|---|---|---|
| `CircleDot` | status badge, Received | Waiting for a first decision | none (label beside it) | Keep |
| | | | | |

## 6. Motion

Motion only explains a change: pending, a status transition, a sheet opening. No entrance stagger on app screens. A landing page may have one signature moment of 600 to 900 ms that answers the visitor's action. Under reduced motion every state shows its final form. A success animation never stands in for server confirmation.

| Motion | Trigger | Duration | Reduced-motion fallback |
|---|---|---|---|
| | | | |

## 7. Side by side (once)

Once: the desktop and phone shots next to the reference screenshot, five concrete mismatches written, each fixed by changing a rule above, not by nudging pixels.

| # | Mismatch | Rule changed |
|---|---|---|
| 1 | | |
