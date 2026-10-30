import { useEffect } from "react";
import type { Brand } from "./types";

/** Page title, meta description and favicon come from brand.ts; restored when the page unmounts. */
export function useBrandDocument(brand: Brand, color: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${brand.name} | ${brand.tagline}`;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    if (description) description.content = brand.purpose;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" color="${color}">${brand.logo}</svg>`;
    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.append(icon);
    }
    icon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== undefined) description.content = previousDescription;
    };
  }, [brand, color]);
}
