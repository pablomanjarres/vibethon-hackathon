import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/**
 * The one list of pages. The index renders a link for each entry, and scripts/sweep.mjs
 * collects those links, so a page added here is swept automatically.
 */
export interface PageRoute {
  path: string;
  name: string;
  summary: string;
  Page: LazyExoticComponent<ComponentType>;
}

export const routes: PageRoute[] = [
  {
    path: "product",
    name: "Placeholder product",
    summary: "A list and detail on sample data. Replace it with the product.",
    Page: lazy(() => import("./product/Page")),
  },
];
