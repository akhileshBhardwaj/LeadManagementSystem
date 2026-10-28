import {
  getConvertedEntry,
  getInteractionCount,
  getPostponeCount,
} from "../../utils/response";
import { formatDate } from "../../utils/date";
import { cx } from "../../utils/format";

export default function ResponseSummary({ lead, className = "" }) {
  const converted = getConvertedEntry(lead);
  const items = [
    { label: "Total interactions", value: getInteractionCount(lead) },
    { label: "Times postponed", value: getPostponeCount(lead) },
    {
      label: "Agreed on",
      value: converted ? formatDate(converted.createdAt.slice(0, 10)) : "—",
    },
  ];

  return (
    <dl className={cx("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-page px-4 py-3"
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {item.label}
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-text-strong">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
