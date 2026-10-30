import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "../shared/BrandLogo";
import { DemoBar } from "../shared/DemoBar";
import { useScenario } from "../shared/demo";
import { countLabel } from "../shared/format";
import { href, setParams, useRoute } from "../shared/route";
import { useBrandDocument } from "../shared/useBrandDocument";
import { useMediaQuery } from "../shared/useMediaQuery";
import { brand } from "./brand";
import { EmptyState } from "./components/EmptyState";
import { ItemDetail } from "./components/ItemDetail";
import { ItemList } from "./components/ItemList";
import { DetailSkeleton, ListSkeleton } from "./components/Skeletons";
import { countByStatus, openCount, STATUS_META, STATUS_ORDER } from "./data";
import { useStore } from "./useStore";
import "./product.css";

const PATH = "product";

/** PLACEHOLDER page: composes the kit (route, demo states, store, announcer, dialog). Replace it with the product. */
export default function Page() {
  useBrandDocument(brand, "#18181b");
  const scenario = useScenario();
  const { params } = useRoute();
  const store = useStore(scenario);
  const phone = useMediaQuery("(max-width: 760px)");
  const ready = store.phase === "ready";
  const counts = countByStatus(store.items);
  const requested = params.get("record");
  const selected =
    store.items.find((item) => item.id === requested) ?? (phone ? undefined : store.items[0]);
  const hrefFor = (id: string) => href(PATH, { ...Object.fromEntries(params), record: id });
  const showList = !phone || !requested;
  const showDetail = !phone || Boolean(requested);

  return (
    <div className="pp-app">
      <header className="pp-header">
        <BrandLogo brand={brand} />
        <span className="pp-sample">Sample data</span>
      </header>
      <main className="pp-main">
        <div className="pp-title">
          <h1>{ready ? countLabel(openCount(store.items), "open request") : "Requests"}</h1>
          <p>Placeholder page. Replace it with the product, styled from its Refero reference.</p>
          {ready && store.items.length > 0 && (
            <p className="pp-counts num">
              {STATUS_ORDER.map((status) => `${STATUS_META[status].label} ${counts[status]}`).join(" · ")}
            </p>
          )}
        </div>
        <div className="pp-split">
          {showList && (
            <section className="pp-pane" aria-label="Requests">
              {!ready ? (
                <ListSkeleton />
              ) : store.items.length === 0 ? (
                <EmptyState
                  title="No requests yet"
                  action={
                    <button type="button" className="pp-btn pp-btn-primary" onClick={() => setParams({ demo: undefined })}>
                      Load the sample requests
                    </button>
                  }
                >
                  New requests appear here as soon as someone files one.
                </EmptyState>
              ) : (
                <ItemList items={store.items} selectedId={selected?.id ?? null} hrefFor={hrefFor} />
              )}
            </section>
          )}
          {showDetail && (
            <section className="pp-pane" aria-label="Selected request">
              {phone && (
                <a className="pp-back" href={href(PATH, { ...Object.fromEntries(params), record: undefined })}>
                  <ArrowLeft size={16} aria-hidden="true" />
                  All requests
                </a>
              )}
              {!ready ? (
                <DetailSkeleton />
              ) : selected ? (
                <ItemDetail
                  key={selected.id}
                  item={selected}
                  attempt={store.attempts[selected.id]}
                  onClose={store.close}
                  onCheckStatus={store.checkStatus}
                  onReviewLatest={store.reviewLatest}
                />
              ) : (
                <p className="pp-none">{store.items.length ? "Select a request to see it here." : "Nothing to show."}</p>
              )}
            </section>
          )}
        </div>
      </main>
      <DemoBar />
    </div>
  );
}
