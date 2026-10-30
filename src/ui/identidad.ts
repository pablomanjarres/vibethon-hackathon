/** The product name, its logo files and the page titles: every surface reads them from here. */
export const MARCA = "Hedge Parking";

const RAIZ = import.meta.env.BASE_URL;
export const ARCHIVOS_MARCA = {
  simbolo: `${RAIZ}brand/symbol.svg`,
  lockup: `${RAIZ}brand/lockup-dark.svg`,
};

/** "Valet · Hedge Parking", or just the name on the entry page. */
export function tituloPagina(seccion?: string): string {
  return seccion ? `${seccion} · ${MARCA}` : MARCA;
}
