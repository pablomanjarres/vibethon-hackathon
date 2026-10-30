// Screenshot one route at desktop and phone sizes; report horizontal overflow at 1440, 390 and 360 px.
// usage: node scripts/shot.mjs <route-with-query> [name] [--full]
// example: node scripts/shot.mjs "product?demo=slow" product-slow
// SHOT_BASE (default http://127.0.0.1:5199/) points at the dev server; SHOT_WAIT is the settle time in ms.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const full = args.includes("--full");
const [route = "", name = route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "index"] = args.filter((arg) => arg !== "--full");
const base = process.env.SHOT_BASE ?? "http://127.0.0.1:5199/";
const sizes = [
  { tag: "desktop", width: 1440, height: 900 },
  { tag: "phone", width: 390, height: 844 },
  { tag: "small", width: 360, height: 740, noFile: true },
];
mkdirSync("shots", { recursive: true });
const browser = await chromium.launch();
let overflowed = false;
try {
  for (const size of sizes) {
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 });
    await page.goto(`${base}#/${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(Number(process.env.SHOT_WAIT ?? 1200));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) overflowed = true;
    if (size.noFile) {
      console.log(`${size.width}px  horizontal overflow: ${overflow}px`);
    } else {
      const file = `shots/${name}-${size.tag}.jpg`;
      await page.screenshot({ path: file, fullPage: full, type: "jpeg", quality: 82 });
      console.log(`${file}  horizontal overflow: ${overflow}px`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
if (overflowed) process.exitCode = 1;
