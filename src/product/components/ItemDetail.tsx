import { useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { formatTime, STATUS_META, type Item } from "../data";
import { isBusy, type Attempt } from "../useStore";
import { ActionNotice } from "./ActionNotice";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatusBadge } from "./StatusBadge";

/** One record: facts, the one consequential action, and its outcome. */
export function ItemDetail({
  item,
  attempt,
  onClose,
  onCheckStatus,
  onReviewLatest,
}: {
  item: Item;
  attempt: Attempt | undefined;
  onClose: (item: Item) => void;
  onCheckStatus: (id: string) => void;
  onReviewLatest: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const pending = isBusy(attempt);
  const unknown = attempt?.state === "failed" && attempt.code === "unknown";
  const canClose = STATUS_META[item.status].canClose && !unknown;

  return (
    <article className="pp-detail" aria-labelledby="pp-detail-title">
      <p className="pp-id num">
        {item.id} · version {item.version}
      </p>
      <h2 id="pp-detail-title">{item.title}</h2>
      <dl className="pp-facts">
        <div>
          <dt>Status</dt>
          <dd>
            <StatusBadge status={item.status} />
          </dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{item.owner ?? "Not assigned"}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd className="num">{formatTime(item.updatedAt)}</dd>
        </div>
      </dl>
      <p className="pp-note">{item.note}</p>
      {canClose && (
        <button
          ref={opener}
          type="button"
          className="pp-btn pp-btn-primary"
          disabled={pending}
          aria-disabled={pending}
          onClick={() => setConfirming(true)}
        >
          {pending && <LoaderCircle size={16} className="pp-spin" aria-hidden="true" />}
          {pending ? `Closing ${item.id}` : `Close ${item.id}`}
        </button>
      )}
      <ActionNotice
        attempt={attempt}
        onRetry={() => onClose(item)}
        onCheckStatus={() => onCheckStatus(item.id)}
        onReviewLatest={() => onReviewLatest(item.id)}
      />
      {confirming && (
        <ConfirmDialog
          itemId={item.id}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onClose(item);
          }}
        />
      )}
    </article>
  );
}
