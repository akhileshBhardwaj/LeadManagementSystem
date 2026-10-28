import { ChartColumn } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { cx } from "../../utils/format";

const BARS = [
  "bg-gradient-to-r from-primary to-primary",
  "bg-gradient-to-r from-accent to-info",
  "bg-gradient-to-r from-success to-accent",
  "bg-gradient-to-r from-warning to-warning-soft",
  "bg-gradient-to-r from-danger to-danger",
  "bg-gradient-to-r from-info to-primary",
];
const DOTS = [
  "bg-primary-soft",
  "bg-info-soft",
  "bg-success-soft",
  "bg-warning",
  "bg-danger",
  "bg-primary-soft",
];

export default function SourceBreakdown({ items, className = "" }) {
  const max =
    items.reduce((highest, item) => Math.max(highest, item.count), 0) || 1;
  return (
    <Card className={cx("space-y-4 border-border", className)}>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <ChartColumn className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-bold text-text-strong">
          Leads per reference source
        </h2>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={ChartColumn}
          title="No leads yet"
          description="Once you add leads, the split by reference source will appear here."
        />
      ) : (
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={item.source}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-on-surface">
                  <span
                    className={cx(
                      "h-2.5 w-2.5 shrink-0 rounded-full",
                      DOTS[index % DOTS.length],
                    )}
                  />
                  <span className="truncate">{item.source}</span>
                </span>
                <span className="font-bold tabular-nums text-text-strong">
                  {item.count}
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={cx(
                    "h-full rounded-full transition-all duration-500",
                    BARS[index % BARS.length],
                  )}
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
