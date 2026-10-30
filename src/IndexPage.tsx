import { useEffect } from "react";
import { routes } from "./routes";
import { href } from "./shared/route";
import "./index-page.css";

/** Presenter index: one link per page. Not product UI; keep it plain. */
export function IndexPage() {
  useEffect(() => {
    document.title = "Pages";
  }, []);
  return (
    <main className="index-page">
      <h1>Pages</h1>
      <ul>
        {routes.map((route) => (
          <li key={route.path}>
            <a href={href(route.path)}>{route.name}</a>
            <p>{route.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
