// Load every route in every demo state at 1440 and 360 px; report console errors, page errors,
// horizontal overflow and near-empty pages. In the normal state at 360 px it also reports what
// judges mark down: text below WCAG AA contrast, controls under 40 px, and clipped text.
// Exits 1 when anything is wrong.
// usage: node scripts/sweep.mjs [route ...]
//   No arguments: the routes are the links on the index page (src/routes.ts), plus the index itself.
//   With arguments: only those routes, e.g. node scripts/sweep.mjs product "product?record=REQ-101"
// The demo states are read from src/shared/demo.ts, so a new scenario is swept automatically.
// SHOT_BASE (default http://127.0.0.1:5199/) points at the dev server.
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const base = process.env.SHOT_BASE ?? "http://127.0.0.1:5199/";
const demoSource = readFileSync(new URL("../src/shared/demo.ts", import.meta.url), "utf8");
const states = [...demoSource.matchAll(/\{\s*id:\s*"([\w-]+)"/g)].map((match) => match[1]);
if (!states.includes("normal")) throw new Error("No scenarios found in src/shared/demo.ts");

// Runs in the page: contrast below AA, controls under 40 px (inline links in text excepted), clipped text.
function auditPage() {
  const rgb = (value) => (value.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => {
    const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const background = (el) => {
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage !== "none") return null; // gradient or image: cannot judge
      const color = rgb(style.backgroundColor);
      if (color.length && (color[3] ?? 1) >= 0.95) return color;
    }
    return [255, 255, 255];
  };
  const name = (el) => (el.innerText || el.getAttribute("aria-label") || el.tagName).trim().replace(/\s+/g, " ").slice(0, 30);
  // Visible to a sighted user: not hidden, not a 1 px screen-reader-only box, not parked off-screen (skip links).
  const seen = (el) => {
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const srOnly = style.clipPath !== "none" || (style.clip && style.clip !== "auto");
    return box.width > 2 && box.height > 2 && box.bottom > 0 && box.right > 0 && style.visibility !== "hidden" && !srOnly;
  };
  const contrast = [], small = [], clipped = [];
  for (const el of document.querySelectorAll("body *")) {
    if (!seen(el) || el.closest(".demo-bar")) continue;
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const style = getComputedStyle(el);
    if (ownText) {
      const bg = background(el), fg = rgb(style.color);
      if (bg && fg.length && (fg[3] ?? 1) > 0.5) {
        const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        const ratio = (a + 0.05) / (b + 0.05);
        const size = parseFloat(style.fontSize), large = size >= 24 || (size >= 18.6 && Number(style.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5)) contrast.push(`"${name(el)}" ${ratio.toFixed(2)}:1`);
      }
      if (el.scrollWidth > el.clientWidth + 1 && style.overflowX !== "visible") clipped.push(`"${name(el)}"`);
    }
    if (el.matches("button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=tab]")) {
      const box = el.getBoundingClientRect();
      const inline = el.matches("a") && el.closest("p, li") && el.closest("p, li").innerText.trim() !== el.innerText.trim();
      if (!inline && (box.height < 40 || box.width < 40)) small.push(`"${name(el)}" ${Math.round(box.width)}x${Math.round(box.height)}`);
    }
  }
  for (const row of document.querySelectorAll('nav, [role=tablist], [role=toolbar]'))
    if (seen(row) && row.scrollWidth > row.clientWidth + 1) clipped.push(`row "${name(row)}" scrolls sideways`);
  return { contrast, small, clipped };
}

const browser = await chromium.launch();
let problems = 0;
try {
  let routes = process.argv.slice(2);
  if (!routes.length) {
    const index = await browser.newPage();
    await index.goto(`${base}#/`, { waitUntil: "networkidle" });
    const links = await index.$$eval('a[href^="#/"]', (anchors) => anchors.map((a) => a.getAttribute("href").replace(/^#\/?/, "")));
    await index.close();
    routes = ["", ...new Set(links.filter(Boolean))];
    if (routes.length < 2) throw new Error(`No page links found on ${base}#/`);
  }
  for (const route of routes) {
    for (const state of route ? states : ["normal"]) {
      for (const width of [1440, 360]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [];
        page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
        page.on("pageerror", (err) => errors.push(String(err)));
        const sep = route.includes("?") ? "&" : "?";
        await page.goto(`${base}#/${route}${state === "normal" ? "" : `${sep}demo=${state}`}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(state === "slow" ? 3600 : 900);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        const text = (await page.evaluate(() => document.body.innerText)).trim().length;
        if (errors.length || overflow > 0 || text < 40) {
          problems++;
          console.log(`PROBLEM ${route || "index"} ${state} ${width}px overflow=${overflow} text=${text} errors=${errors.slice(0, 3).join(" | ")}`);
        }
        if (state === "normal" && width === 360) {
          const audit = await page.evaluate(auditPage);
          for (const [kind, list] of Object.entries(audit)) {
            if (!list.length) continue;
            problems++;
            console.log(`PROBLEM ${route || "index"} 360px ${kind} (${list.length}): ${list.slice(0, 4).join(", ")}`);
          }
        }
        await page.close();
      }
    }
  }
  console.log(`swept ${routes.length} route(s) x ${states.length} state(s) x 2 widths`);
} finally {
  await browser.close();
}
console.log(problems ? `${problems} problem(s)` : "all routes and states clean");
if (problems) process.exitCode = 1;
