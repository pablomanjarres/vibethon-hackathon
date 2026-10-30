const LADO = 21;
const GUIA = 7;

/** Deterministic 32-bit seed from the ficho text (FNV-1a). */
function semilla(texto: string): number {
  let h = 0x811c9dc5;
  for (const letra of texto) h = Math.imul(h ^ letra.charCodeAt(0), 0x01000193);
  return h >>> 0;
}

function enGuia(x: number, y: number): boolean | null {
  const esquinas = [
    [0, 0],
    [LADO - GUIA, 0],
    [0, LADO - GUIA],
  ];
  for (const [ox, oy] of esquinas) {
    const dx = x - ox;
    const dy = y - oy;
    if (dx >= -1 && dx <= GUIA && dy >= -1 && dy <= GUIA) {
      if (dx < 0 || dy < 0 || dx === GUIA || dy === GUIA) return false;
      const borde = Math.min(dx, dy, GUIA - 1 - dx, GUIA - 1 - dy);
      return borde !== 1;
    }
  }
  return null;
}

/** A square code drawn from the ficho itself: same ficho, same pattern, no library and no network. */
export function CodigoFicho({ texto }: { texto: string }) {
  let h = semilla(texto);
  const modulos: [number, number][] = [];
  for (let y = 0; y < LADO; y++) {
    for (let x = 0; x < LADO; x++) {
      h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
      const guia = enGuia(x, y);
      if (guia ?? h >>> 31 === 1) modulos.push([x, y]);
    }
  }
  return (
    <svg className="cd-codigo" viewBox={`-2 -2 ${LADO + 4} ${LADO + 4}`} role="img" aria-label={`Código del ficho ${texto}`}>
      <rect x={-2} y={-2} width={LADO + 4} height={LADO + 4} fill="#fff" />
      {modulos.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} />
      ))}
    </svg>
  );
}
