const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** The noun alone for a count: "business day" or "business days". Use when the figure is shown separately. */
export function nounFor(count: number, one: string, many = `${one}s`) {
  return Math.abs(count) === 1 ? one : many;
}

/** Count with its noun: "1 request", "1,284 requests". One owner for count labels. */
export function countLabel(count: number, one: string, many = `${one}s`) {
  return `${whole.format(count)} ${nounFor(count, one, many)}`;
}
