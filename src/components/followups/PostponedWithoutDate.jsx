import { CalendarPlus, ChevronRight } from "lucide-react";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { LEAD_CONFIG } from "../../data/constants";

export default function PostponedWithoutDate({ leads, onSetDate }) {
  if (leads.length === 0) return null;

  return (
    <details className="group rounded-2xl border border-border bg-warning-soft">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-warning">
        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        Postponed without date ({leads.length})
        <span className="ml-auto hidden text-xs font-normal text-warning sm:block">
          Not listed above until a date is set
        </span>
      </summary>

      <ul className="space-y-2 border-t border-border px-4 py-3">
        {leads.map((lead) => (
          <li key={lead.id} className="flex items-center gap-3">
            <Avatar name={lead.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-strong">
                {lead.name}
              </p>
              <p className="truncate text-xs text-text-muted">
                {lead.course || `${LEAD_CONFIG.itemLabel} not set`} ·{" "}
                {lead.phone}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={() => onSetDate(lead)}
            >
              <CalendarPlus className="h-4 w-4" />
              Set date
            </Button>
          </li>
        ))}
      </ul>
    </details>
  );
}
