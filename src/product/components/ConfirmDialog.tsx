import { useDialog } from "../../shared/useDialog";

/** Names the record and the consequence. Escape and the cancel button both close it; focus returns to the opener. */
export function ConfirmDialog({ itemId, onConfirm, onCancel }: { itemId: string; onConfirm: () => void; onCancel: () => void }) {
  const surface = useDialog<HTMLDivElement>(onCancel);
  return (
    <div className="pp-scrim" onClick={onCancel}>
      <div
        ref={surface}
        className="pp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pp-dialog-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="pp-dialog-title">Close {itemId}?</h2>
        <p>{itemId} moves to Done and leaves the open list. Its owner sees the change on their next visit.</p>
        <div className="pp-dialog-actions">
          <button type="button" className="pp-btn pp-btn-quiet" onClick={onCancel}>
            Keep it open
          </button>
          <button type="button" className="pp-btn pp-btn-primary" onClick={onConfirm}>
            Close {itemId}
          </button>
        </div>
      </div>
    </div>
  );
}
