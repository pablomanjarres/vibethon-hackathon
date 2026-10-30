import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { scenarios, useScenario } from "./demo";
import { href, setParams, useRoute } from "./route";
import "./demo-bar.css";

/**
 * Presenter control, kept visually apart from the product. It switches the fixture scenario
 * so judges can see slow, failed, empty and long-content states on purpose.
 * Hidden unless the URL carries ?demo= (open the page with ?demo=normal to show it), so judges
 * and screenshots see a clean product.
 */
export function DemoBar({ only }: { only?: string[] }) {
  const active = useScenario();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  const list = only ? scenarios.filter((item) => only.includes(item.id)) : scenarios;
  const label = active === "normal" ? "Demo states" : `State: ${scenarios.find((s) => s.id === active)?.label}`;

  // Opening moves focus to the active scenario; closing returns it to the toggle.
  useEffect(() => {
    if (open) {
      opened.current = true;
      const current = panel.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
      (current ?? panel.current?.querySelector<HTMLElement>("button"))?.focus();
    } else if (opened.current) {
      toggle.current?.focus();
    }
  }, [open]);

  const { params } = useRoute();

  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    setOpen(false);
  };

  if (!params.has("demo")) return null;

  return (
    <aside className="demo-bar" aria-label="Demo states">
      {open ? (
        <div className="demo-bar-panel" ref={panel} onKeyDown={closeOnEscape}>
          <div className="demo-bar-head">
            <strong>Demo states</strong>
            <button type="button" className="demo-bar-icon" onClick={() => setOpen(false)} aria-label="Close demo states">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="demo-bar-list" role="group" aria-label="Fixture scenario">
            {list.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={active === item.id}
                onClick={() => setParams({ demo: item.id })}
              >
                <span className="demo-bar-code">{item.code}</span>
                <span>
                  {item.label}
                  <small>{item.hint}</small>
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="demo-bar-home"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Reset demo data
          </button>
          <a className="demo-bar-home" href={href("")}>
            All pages
          </a>
        </div>
      ) : (
        <button
          ref={toggle}
          type="button"
          className="demo-bar-toggle"
          aria-expanded={false}
          aria-label={label}
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          <span className="demo-bar-label" aria-hidden="true">
            {label}
          </span>
          {active !== "normal" && <span className="demo-bar-dot" aria-hidden="true" />}
        </button>
      )}
    </aside>
  );
}
