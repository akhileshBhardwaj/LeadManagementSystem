import { cx } from "../../utils/format";
export default function PageHeader({
  title,
  description,
  actions,
  className = "",
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-4 rounded-2xl border border-border bg-surface px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-text-strong sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-5 text-text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
