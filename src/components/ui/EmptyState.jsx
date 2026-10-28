import { cx } from "../../utils/format";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-muted">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="text-sm font-semibold text-text-strong">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-text-muted">{description}</p>
      )}
      {action}
    </div>
  );
}
