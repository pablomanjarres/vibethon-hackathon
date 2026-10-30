import { formatTime, type Item } from "../data";
import { StatusBadge } from "./StatusBadge";

/** Rows are links: selection lives in the URL, so a refresh keeps the place. */
export function ItemList({ items, selectedId, hrefFor }: { items: Item[]; selectedId: string | null; hrefFor: (id: string) => string }) {
  return (
    <ul className="pp-list">
      {items.map((item) => (
        <li key={item.id}>
          <a className="pp-row" href={hrefFor(item.id)} aria-current={item.id === selectedId ? "true" : undefined}>
            <span className="pp-id num">{item.id}</span>
            <span className="pp-row-title">{item.title}</span>
            <span className="pp-row-meta">
              <StatusBadge status={item.status} />
              <time className="num" dateTime={item.updatedAt}>
                {formatTime(item.updatedAt)}
              </time>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
