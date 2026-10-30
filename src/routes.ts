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
    path: "conductor",
    name: "Conductor",
    summary: "Mi lugar en la fila, la espera estimada, mi celda y la entrega al valet.",
    Page: lazy(() => import("./vistas/conductor/Conductor")),
  },
  {
    path: "porteria",
    name: "Portería",
    summary: "El pasaje de cada entrada, de quién es el turno y las celdas libres.",
    Page: lazy(() => import("./vistas/porteria/Porteria")),
  },
  {
    path: "valet",
    name: "Valet",
    summary: "El servicio en curso, el siguiente paso, los fichos y las llaves.",
    Page: lazy(() => import("./vistas/valet/Valet")),
  },
  {
    path: "oficina",
    name: "Oficina",
    summary: "Todo el lote en vivo: entradas, celdas, fichos, llaves, pagos y bitácora.",
    Page: lazy(() => import("./vistas/oficina/Oficina")),
  },
  {
    path: "telefono",
    name: "Teléfono",
    summary: "Cómo ve la app un conductor en su teléfono, en vivo y de solo lectura.",
    Page: lazy(() => import("./vistas/telefono/Telefono")),
  },
  {
    path: "mockups",
    name: "Mockups",
    summary: "Pantallas de solo lectura: el lote por zonas, la zona elegida y tu celda.",
    Page: lazy(() => import("./vistas/mockups/Mockups")),
  },
];
