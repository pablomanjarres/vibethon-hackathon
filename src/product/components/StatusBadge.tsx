import { STATUS_META, type Status } from "../data";

/** Status as text, tone and icon together, so meaning survives without color. */
export function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span className={`pp-badge pp-tone-${meta.tone}`}>
      <Icon size={14} strokeWidth={2} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
