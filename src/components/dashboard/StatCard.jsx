import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cx } from "../../utils/format";
const TONES = {
  indigo: "stat-tone-indigo",
  sky: "stat-tone-sky",
  amber: "stat-tone-amber",
  emerald: "stat-tone-emerald",
  slate: "stat-tone-slate",
  rose: "stat-tone-rose",
};
export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "indigo",
  hint,
  to,
}) {
  const Tag = to ? Link : "div";
  return (
    <Tag
      {...(to ? { to } : {})}
      className={cx(
        "stat-tile group relative block min-h-36 min-w-0 rounded-2xl p-5 transition-all duration-150 sm:p-6",
        to &&
          "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        TONES[tone] || TONES.indigo,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="stat-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </span>
        {to && (
          <ArrowUpRight className="h-5 w-5 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        )}
      </div>
      <div className="mt-5 min-w-0">
        <p className="truncate text-sm font-medium text-text-muted">{label}</p>
        <p className="mt-0.5 text-3xl font-bold tracking-tight tabular-nums text-text-strong">
          {value}
        </p>
        {hint && (
          <p className="mt-1 truncate text-xs text-text-muted">{hint}</p>
        )}
        {to && <span className="sr-only">Open {label}</span>}
      </div>
    </Tag>
  );
}
