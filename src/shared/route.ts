import { useEffect, useState } from "react";

/** Hash routes keep the static build working from any folder: #/path?key=value */
export interface Route {
  path: string;
  params: URLSearchParams;
}

function read(): Route {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [path = "", query = ""] = raw.split("?");
  return { path, params: new URLSearchParams(query) };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function href(path: string, params?: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const text = query.toString();
  return `#/${path}${text ? `?${text}` : ""}`;
}

/**
 * Replace one or more query params on the current route. By default no history entry is added;
 * pass { push: true } when opening a step, sheet or dialog so the browser Back button closes it.
 */
export function setParams(next: Record<string, string | undefined>, { push = false } = {}) {
  const { path, params } = read();
  Object.entries(next).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });
  const text = params.toString();
  window.history[push ? "pushState" : "replaceState"](null, "", `#/${path}${text ? `?${text}` : ""}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
