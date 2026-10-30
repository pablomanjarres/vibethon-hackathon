/** Clock time of a simulated minute, counted from the scenario's start ("06:40" + 5 → "06:45"). */
export function hora(inicio: string, minuto: number): string {
  const [h, m] = inicio.split(":").map(Number);
  const total = (((h * 60 + m + minuto) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Count of each value, with every key present even when it is zero. */
export function contar<T extends string>(valores: readonly T[], claves: readonly T[]): Record<T, number> {
  const cuenta = Object.fromEntries(claves.map((clave) => [clave, 0])) as Record<T, number>;
  for (const valor of valores) cuenta[valor] += 1;
  return cuenta;
}

export function carros(n: number): string {
  return n === 1 ? "1 carro" : `${n} carros`;
}
