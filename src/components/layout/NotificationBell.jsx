import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Clock, TriangleAlert } from "lucide-react";
import { useLeads } from "../../context/LeadContext";
import { useOrg } from "../../context/OrgContext";
import useOutsideClick from "../../hooks/useOutsideClick";
import { getFollowups, isDueToday } from "../../utils/response";
import { formatDate, relativeDay, sortByISODate } from "../../utils/date";
import { cx } from "../../utils/format";

export default function NotificationBell({ dueCount = 0 }) {
  const { accessibleLeads } = useLeads();
  const { getDepartment } = useOrg();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  useOutsideClick(ref, () => setOpen(false), open);

  // Reminders only ever cover the departments this user may open.
  const dueList = useMemo(
    () =>
      sortByISODate(
        getFollowups(accessibleLeads).filter((item) =>
          isDueToday(item.nextDate),
        ),
        (item) => item.nextDate,
      ),
    [accessibleLeads],
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Follow-up reminders, ${dueCount} due in your departments`}
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-xl p-2 text-text-muted hover:bg-hover-bg hover:text-on-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring"
      >
        <Bell className="h-5 w-5" />
        {dueCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-soft px-1 text-[11px] font-semibold text-on-danger-soft">
            {dueCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-text-strong">
              Follow-ups Due Today
            </p>
            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
              {dueList.length} total
            </span>
          </div>

          {dueList.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-text-muted">
              Nothing pending today. Great work!
            </p>
          ) : (
            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
              {dueList.map((item) => {
                const overdue = relativeDay(item.nextDate).includes("overdue");
                const department = getDepartment(item.lead.departmentId);
                return (
                  <li key={`${item.leadId}-${item.responseId}`}>
                    <Link
                      to={`/d/${item.lead.departmentId}/leads/${item.leadId}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-hover-bg hover:text-on-hover"
                    >
                      {overdue ? (
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                      ) : (
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-text-strong">
                            {item.lead.name}
                          </span>
                          {department && (
                            <span className="shrink-0 rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-on-surface">
                              {department.name}
                            </span>
                          )}
                        </span>
                        <span
                          className={cx(
                            "block text-xs",
                            overdue
                              ? "font-medium text-danger"
                              : "text-text-muted",
                          )}
                        >
                          {formatDate(item.nextDate)} ·{" "}
                          {relativeDay(item.nextDate)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
