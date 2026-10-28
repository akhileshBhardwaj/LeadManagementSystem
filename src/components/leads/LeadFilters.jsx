import { Search } from "lucide-react";
import { cx } from "../../utils/format";

export default function LeadFilters({
  query,
  onQueryChange,
  tabs,
  active,
  onSelect,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name, phone, course or location"
          aria-label="Search leads"
          className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-text-strong placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
        />
      </div>

      <div className="segmented-track flex flex-wrap gap-1.5 rounded-full bg-surface-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelect(tab.key)}
            className={cx(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring",
              active === tab.key ? "segmented-active" : "segmented-idle",
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
    </div>
  );
}
