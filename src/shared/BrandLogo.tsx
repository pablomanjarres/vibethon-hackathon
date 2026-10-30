import type { Brand } from "./types";
export function BrandLogo({
  brand,
  className = "",
  symbolOnly = false,
}: {
  brand: Brand;
  className?: string;
  symbolOnly?: boolean;
}) {
  return (
    <span className={`brand-logo ${className}`}>
      <svg
        viewBox="0 0 40 40"
        width="32"
        height="32"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: brand.logo }}
      />
      {!symbolOnly && <span>{brand.name}</span>}
    </span>
  );
}
