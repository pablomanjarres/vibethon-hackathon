import { useEffect, useRef } from "react";

export function useDialog<T extends HTMLElement>(onClose: () => void) {
  const surface = useRef<T>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const focusable = () =>
      Array.from(
        surface.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close.current();
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      const focusIsListed = elements.some(
        (element) => element === document.activeElement,
      );
      const active = document.activeElement;
      if (!first) {
        event.preventDefault();
        surface.current?.focus();
      } else if (!focusIsListed && active && surface.current?.contains(active)) {
        // Focus sits on an unlisted element inside the dialog (a region the app focused on purpose):
        // move to the nearest listed element in page order instead of jumping to an end.
        event.preventDefault();
        const follows = (element: HTMLElement) =>
          Boolean(active.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
        const next = event.shiftKey
          ? [...elements].reverse().find((element) => !follows(element)) ?? last
          : elements.find(follows) ?? first;
        next.focus();
      } else if (
        event.shiftKey &&
        (active === first || !focusIsListed)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !focusIsListed)
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);

  return surface;
}
