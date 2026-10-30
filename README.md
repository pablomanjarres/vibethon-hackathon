# Parking app

Prompt record: [`docs/prompting.md`](docs/prompting.md) (spec, corrections and checks) and [`docs/prompting.raw.md`](docs/prompting.raw.md) (every typed prompt, verbatim).

Vite 8 + React 19 + TypeScript 7, plain CSS, `lucide-react`. Hash routes (`#/path?key=value`), so the static build works from any folder or host. One placeholder page shows how a product page uses the shared kit. Replace it; keep the kit.

## Run

```bash
npm install
npm run dev            # http://127.0.0.1:5199/  (another port: npm run dev -- --port 5288)
npm run check          # tsc --noEmit
npm run build          # type check + static build in dist/
```

The working notes live in `docs/`: brief, design direction, design rules, QA matrix, demo script and the prompt record.

## What is where

| Path | Owns |
|---|---|
| `src/routes.ts` | The one list of pages. The index links to each; `sweep.mjs` sweeps each |
| `src/App.tsx` | `#/` shows the index, `#/<path>` opens one page inside the Announcer |
| `src/shared/route.ts` | `useRoute`, `href`, `setParams`: filters, selection and view live in the URL; `setParams(next, { push: true })` for steps, sheets and dialogs so Back closes them |
| `src/shared/demo.ts` | Scenarios F01 to F07 and `simulate()`: every read and write goes through it |
| `src/shared/DemoBar.tsx` | Presenter control that switches `?demo=` (normal, long, slow, fail, empty, stale, unknown). Hidden unless the URL has `?demo=`: open `#/product?demo=normal` to show it |
| `src/shared/Announcer.tsx` | One polite live region; `useAnnounce()` after every result |
| `src/shared/useDialog.ts` | Initial focus, Tab trap, Escape, scroll lock, focus return |
| `src/shared/useMediaQuery.ts`, `format.ts` | Layout switches; count labels ("1 request", "8 requests") |
| `src/shared/useBrandDocument.ts`, `BrandLogo.tsx`, `types.ts` | Title, description, favicon and logo from `brand.ts` |
| `src/shared/base.css` | Reset, one focus ring for every control, reduced motion, `.num`, `.sr-only` |
| `public/sw.js` | Network-first service worker, registered in production builds: online always the latest build; offline, every page opened once still loads |
| `src/product/` | PLACEHOLDER page: `brand.ts`, `data.ts` (STATUS_META with `satisfies`), `fixtures.ts` (normal and long), `useStore.ts`, components, `product.css` |

## Make it the product

1. Save the Refero reference in `references/refero/<site>/`. Put its tokens, type, radii and shadows into `src/product/product.css` (rename the folder and the `pp-` prefix). Delete every placeholder value; the neutral grey ground and black button are not a design.
2. Add the reference's free font substitutes with `@fontsource` packages, imported once in `main.tsx`.
3. Rewrite `data.ts` for the real domain. Keep the status table shape: text + tone + icon per status, typed with `satisfies Record<Status, ...>`.
4. Rewrite `fixtures.ts` with dates relative to today, a long variant, and invented content only.
5. Keep the store contract: reads and writes through `simulate()`, a write sends the version it saw, a pending guard in the handler, unknown outcome answered by Check status, stale answered by Review the latest version.
6. Add pages to `src/routes.ts` only. Delete the placeholder page once the product page exists.

## Screenshot and sweep

Both scripts need the dev server running. `SHOT_BASE` points them at it (default `http://127.0.0.1:5199/`).

```bash
node scripts/shot.mjs product                          # shots/product-desktop.jpg (1440) and -phone.jpg (390), overflow at 360
node scripts/shot.mjs "product?demo=slow" product-slow --full
node scripts/sweep.mjs                                 # every page in routes.ts x every demo state x 1440 and 360 px
node scripts/sweep.mjs product "product?record=REQ-101"  # only these routes
SHOT_BASE=http://127.0.0.1:5288/ node scripts/sweep.mjs
```

`shot.mjs` exits 1 on horizontal overflow. `sweep.mjs` reports console errors, page errors, overflow and near-empty pages, and at 360 px in the normal state text below AA contrast, controls under 40 px and clipped labels; it exits 1 on any problem. It reads the scenario list from `src/shared/demo.ts`. Open every screenshot and compare it side by side with the reference screenshot before calling a screen done.

The scripts use the Chromium that Playwright installs. If `chromium.launch()` fails, run `npx playwright-core install chromium` once.
