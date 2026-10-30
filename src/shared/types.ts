/** Identity of the product. Every generated surface (title, favicon, logo) reads from it. */
export interface Brand {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  purpose: string;
  colors: { name: string; hex: string }[];
  fonts: { heading: string; body: string; numbers?: string };
  /** Inner SVG markup for a 40x40 viewBox, drawn with currentColor. */
  logo: string;
  logoMeaning: string;
}
