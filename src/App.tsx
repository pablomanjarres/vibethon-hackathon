import { Suspense } from "react";
import { IndexPage } from "./IndexPage";
import { routes } from "./routes";
import { AnnouncerProvider } from "./shared/Announcer";
import { href, useRoute } from "./shared/route";

/** Hash routing: #/ is the index, #/<path> opens one page from routes.ts. */
export function App() {
  const { path } = useRoute();
  if (!path) return <IndexPage />;
  const route = routes.find((item) => item.path === path);
  if (!route)
    return (
      <main className="app-message">
        <p>That page does not exist.</p>
        <a href={href("")}>See all pages</a>
      </main>
    );
  const { Page } = route;
  return (
    <AnnouncerProvider>
      <Suspense
        fallback={
          <p className="app-message" role="status">
            Opening {route.name}
          </p>
        }
      >
        <Page />
      </Suspense>
    </AnnouncerProvider>
  );
}
