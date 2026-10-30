import { useEffect, useRef } from "react";
import { LoaderCircle, RefreshCw, SearchCheck, TriangleAlert } from "lucide-react";
import { formatTime } from "../data";
import type { Attempt } from "../useStore";

/** The outcome of the last write: refused, stale, unknown, checking or confirmed with a receipt. */
export function ActionNotice({
  attempt,
  onRetry,
  onCheckStatus,
  onReviewLatest,
}: {
  attempt: Attempt | undefined;
  onRetry: () => void;
  onCheckStatus: () => void;
  onReviewLatest: () => void;
}) {
  const actionRef = useRef<HTMLButtonElement>(null);
  // A new failure moves focus to its one way forward.
  useEffect(() => {
    if (attempt?.state === "failed") actionRef.current?.focus();
  }, [attempt]);

  if (!attempt || attempt.state === "pending") return null;

  if (attempt.state === "checking" || attempt.state === "reloading")
    return (
      <p className="pp-notice" role="status">
        <LoaderCircle size={14} className="pp-spin" aria-hidden="true" />
        {attempt.state === "checking" ? "Checking whether the change was saved" : "Loading the latest version"}
      </p>
    );

  if (attempt.state === "refreshed")
    return (
      <p className="pp-notice" role="status">
        <RefreshCw size={14} aria-hidden="true" />
        You are now on version <span className="num">{attempt.version}</span>. Close it again when ready.
      </p>
    );

  if (attempt.state === "done") {
    const { receipt, reconciled } = attempt;
    return (
      <p className="pp-notice pp-notice-success" role="status">
        <span>
          <strong>{receipt.text}.</strong> Version <span className="num">{receipt.version}</span>, {formatTime(receipt.at)}.
          {reconciled && " The earlier attempt had already saved it; nothing was sent twice."}
        </span>
      </p>
    );
  }

  const { code, message } = attempt;
  const action =
    code === "stale"
      ? { label: "Review the latest version", icon: RefreshCw, run: onReviewLatest }
      : code === "unknown"
        ? { label: "Check status", icon: SearchCheck, run: onCheckStatus }
        : { label: "Try again", icon: RefreshCw, run: onRetry };
  const Icon = action.icon;
  return (
    <div className="pp-notice pp-notice-danger" role="alert">
      <TriangleAlert size={14} aria-hidden="true" />
      <div>
        <p>{message}</p>
        <button ref={actionRef} type="button" className="pp-btn pp-btn-quiet" onClick={action.run}>
          <Icon size={14} aria-hidden="true" />
          {action.label}
        </button>
      </div>
    </div>
  );
}
