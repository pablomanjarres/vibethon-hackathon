"""Builds the Hedge Parking identity (symbol, wordmark, lockup, app icon) as path-only SVGs.

Run from the repo root: python3 brand/generar.py
The wordmark uses Inter Bold (SIL Open Font License) from node_modules/@fontsource/inter.
"""
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

SALIDA = Path("public/brand")
FUENTE = Path("node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2")
SETO = "#5bd08d"
AMBAR = "#f0b24a"
AMBAR_OSCURO = "#a8680c"
TINTA_CLARA = "#f4f2ee"
TINTA_OSCURA = "#1b1714"
FONDO = "#1b1714"

# Symbol on a 64 grid: a hedge (three bumps on a flat base) at the head of a parking stall seen from above.
SETO_FORMAS = (
    '<circle cx="18" cy="20" r="8"/><circle cx="32" cy="15" r="9"/><circle cx="46" cy="20" r="8"/>'
    '<rect x="10" y="20" width="44" height="7" rx="2"/>'
)
CELDA = 'M12 56V33H52V56'


def simbolo(seto=SETO, celda=AMBAR):
    return (
        f'<g fill="{seto}">{SETO_FORMAS}</g>'
        f'<path d="{CELDA}" fill="none" stroke="{celda}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
    )


def texto(cadena, tam, x0, y_base):
    """Outlines `cadena` with Inter Bold at `tam` px; returns (path d, advance width)."""
    fuente = TTFont(str(FUENTE))
    glifos = fuente.getGlyphSet()
    mapa = fuente.getBestCmap()
    escala = tam / fuente["head"].unitsPerEm
    pluma = SVGPathPen(glifos)
    x = 0.0
    for caracter in cadena:
        nombre = mapa[ord(caracter)]
        glifos[nombre].draw(TransformPen(pluma, (escala, 0, 0, -escala, x0 + x, y_base)))
        x += glifos[nombre].width * escala
    return pluma.getCommands(), x


def svg(ancho, alto, cuerpo, titulo):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho:.0f} {alto:.0f}" role="img" aria-label="{titulo}">'
        f"<title>{titulo}</title>{cuerpo}</svg>\n"
    )


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    (SALIDA / "symbol.svg").write_text(svg(64, 64, simbolo(), "Hedge Parking"))
    (SALIDA / "symbol-mono.svg").write_text(svg(64, 64, simbolo("currentColor", "currentColor"), "Hedge Parking"))

    for variante, tinta, acento in (("dark", TINTA_CLARA, AMBAR), ("light", TINTA_OSCURA, AMBAR_OSCURO)):
        hedge, ancho_h = texto("Hedge", 40, 0, 40)
        parking, ancho_p = texto("Parking", 40, ancho_h + 11, 40)
        ancho = ancho_h + 11 + ancho_p
        cuerpo = f'<path d="{hedge}" fill="{tinta}"/><path d="{parking}" fill="{acento}"/>'
        (SALIDA / f"wordmark-{variante}.svg").write_text(svg(ancho, 52, cuerpo, "Hedge Parking"))

        # Lockup: symbol 64 high, wordmark baseline aligned to the stall's base.
        hedge, ancho_h = texto("Hedge", 34, 80, 48)
        parking, ancho_p = texto("Parking", 34, 80 + ancho_h + 9, 48)
        ancho = 80 + ancho_h + 9 + ancho_p
        cuerpo = simbolo() + f'<path d="{hedge}" fill="{tinta}"/><path d="{parking}" fill="{acento}"/>'
        (SALIDA / f"lockup-{variante}.svg").write_text(svg(ancho, 64, cuerpo, "Hedge Parking"))

    icono = f'<rect width="64" height="64" rx="14" fill="{FONDO}"/><g transform="translate(9.6 9.6) scale(0.7)">{simbolo()}</g>'
    (SALIDA / "app-icon.svg").write_text(svg(64, 64, icono, "Hedge Parking"))


if __name__ == "__main__":
    main()
