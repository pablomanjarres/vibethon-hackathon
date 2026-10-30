import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

/** One always-mounted polite live region, so screen readers hear results after an action. */
const AnnouncerContext = createContext<(message: string) => void>(() => {});

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const announce = useCallback((next: string) => {
    setMessage("");
    window.setTimeout(() => setMessage(next), 30);
  }, []);
  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnounce() {
  return useContext(AnnouncerContext);
}
