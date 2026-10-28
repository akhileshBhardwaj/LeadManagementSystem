import { Search } from "lucide-react";
import Card from "../ui/Card";

const HEAD =
  "bg-table-head text-table-head-text px-4 py-3 text-xs font-bold uppercase tracking-wider text-table-head-text";

export default function ManageTable({
  query,
  onQueryChange,
  placeholder = "Search",
  columns = [],
  isEmpty = false,
  empty = null,
  children,
}) {
  return (
    <Card
      padding="none"
      className="overflow-hidden border-border shadow-md shadow-soft"
    >
      <div className="border-b border-border bg-surface-muted p-4">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-text-strong shadow-sm shadow-soft placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-ring"
          />
        </div>
      </div>
      {isEmpty ? (
        empty
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th
                    key={column.label}
                    className={`${HEAD} ${column.align === "right" ? "text-right" : "text-left"}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
