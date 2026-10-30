import type { Brand } from "../shared/types";

/**
 * PLACEHOLDER brand. Replace every field: colors and fonts come from the Refero reference's
 * DESIGN.md (references/refero/<site>/DESIGN.md), the name and symbol are the product's own.
 */
export const brand: Brand = {
  slug: "placeholder",
  name: "Placeholder",
  category: "Request desk for a small team",
  tagline: "Replace this tagline",
  purpose: "Placeholder is a list and detail on sample data that shows how a page uses the shared kit.",
  colors: [
    { name: "Ground", hex: "#F4F4F5" },
    { name: "Surface", hex: "#FFFFFF" },
    { name: "Ink", hex: "#18181B" },
    { name: "Muted ink", hex: "#5F5F68" },
    { name: "Line", hex: "#DCDCE0" },
    { name: "Action", hex: "#18181B" },
  ],
  fonts: { heading: "system-ui", body: "system-ui" },
  logo: '<rect x="6" y="6" width="28" height="28" rx="8" fill="none" stroke="currentColor" stroke-width="3"/><path d="M14 20h12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  logoMeaning: "A plain tile marking where the product's own symbol goes.",
};
