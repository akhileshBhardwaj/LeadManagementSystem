import { Pencil, Trash2 } from "lucide-react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { LEAD_CONFIG, STATUS_META } from "../../data/constants";
import { getFollowup, getInteractionCount } from "../../utils/response";
import { formatDate, relativeDay } from "../../utils/date";
import { formatBudget } from "../../utils/format";

const HEAD =
  "bg-table-head text-table-head-text px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-table-head-text";

export default function LeadTable({
  leads,
  startIndex = 0,
  onOpen,
  onEdit,
  onDelete,
  onViewResponses,
}) {
  const itemLabel = LEAD_CONFIG.itemLabel;

  return (
    <>
      <div className="hidden overflow-x-auto xl:block">
        <table className="data-table w-full min-w-230 text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className={`${HEAD} w-16`}>S.No</th>
              <th className={HEAD}>Contact Person & Phone</th>
              <th className={HEAD}>{itemLabel}</th>
              <th className={HEAD}>Budget</th>
              <th className={HEAD}>Reference</th>
              <th className={HEAD}>Status</th>
              <th className={HEAD}>Next follow-up</th>
              <th className={HEAD}>Responses</th>
              <th className={`${HEAD} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => {
              const followup = getFollowup(lead);
              const status = STATUS_META[lead.status] || STATUS_META.active;
              return (
                <tr
                  key={lead.id}
                  onClick={() => onOpen(lead.id)}
                  className="data-row cursor-pointer"
                >
                  <td className="px-4 py-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-xs font-bold tabular-nums text-primary ring-1 ring-inset ring-primary-ring">
                      {startIndex + index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={lead.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text-strong">
                          {lead.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 tabular-nums text-xs text-text-muted">
                          <span>{lead.phone}</span>
                          <span className="text-text-muted">·</span>
                          <span>{lead.phone2 || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone="sky">{lead.course || itemLabel}</Badge>
                    <p className="mt-1.5 text-xs font-medium text-text-muted">
                      {lead.location || "Location not set"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-xl bg-success-soft px-2.5 py-1.5 text-xs font-bold tabular-nums text-success ring-1 ring-inset ring-primary-ring">
                      {formatBudget(lead.budgetMin, lead.budgetMax)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone="indigo">{lead.reference || "Unknown"}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    {followup ? (
                      <div>
                        <p className="tabular-nums text-on-surface">
                          {formatDate(followup.nextDate)}
                        </p>
                        <p
                          className={
                            relativeDay(followup.nextDate).includes("overdue")
                              ? "text-xs text-danger"
                              : "text-xs text-text-muted"
                          }
                        >
                          {relativeDay(followup.nextDate)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="border-border bg-primary-soft text-primary hover:bg-hover-bg hover:text-on-hover"
                      onClick={(event) => {
                        event.stopPropagation();
                        onViewResponses(lead);
                      }}
                    >
                      Response ({getInteractionCount(lead)})
                    </Button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <ActionButton
                        label={`Edit ${lead.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(lead);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </ActionButton>
                      <ActionButton
                        label={`Delete ${lead.name}`}
                        danger
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(lead);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-2 p-3 xl:hidden">
        {leads.map((lead) => {
          const followup = getFollowup(lead);
          const status = STATUS_META[lead.status] || STATUS_META.active;
          return (
            <li
              key={lead.id}
              className="rounded-2xl border border-border bg-surface p-3 shadow-sm sm:p-4"
            >
              <div className="flex items-start gap-3">
                <Avatar name={lead.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpen(lead.id)}
                      className="min-w-0 text-left focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary-ring"
                    >
                      <span className="block truncate text-sm font-semibold text-text-strong">
                        {lead.name}
                      </span>
                      <span className="mt-0.5 block break-all text-xs tabular-nums text-text-muted">
                        {lead.phone}
                        {lead.phone2 ? ` · ${lead.phone2}` : ""}
                      </span>
                    </button>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  <div className="mt-3">
                    <Badge tone="sky">{lead.course || itemLabel}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                    {lead.location && <span>{lead.location}</span>}
                    <span>{lead.reference || "Unknown source"}</span>
                    <span>{formatBudget(lead.budgetMin, lead.budgetMax)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <div className="min-w-0 text-xs">
                      <span className="text-text-muted">Next follow-up · </span>
                      {followup ? (
                        <span
                          className={
                            relativeDay(followup.nextDate).includes("overdue")
                              ? "font-medium text-danger"
                              : "text-on-surface"
                          }
                        >
                          {formatDate(followup.nextDate)} ·{" "}
                          {relativeDay(followup.nextDate)}
                        </span>
                      ) : (
                        <span className="text-text-muted">Not scheduled</span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewResponses(lead)}
                      >
                        Responses {getInteractionCount(lead)}
                      </Button>
                      <ActionButton
                        label={`Edit ${lead.name}`}
                        onClick={() => onEdit(lead)}
                      >
                        <Pencil className="h-4 w-4" />
                      </ActionButton>
                      <ActionButton
                        label={`Delete ${lead.name}`}
                        danger
                        onClick={() => onDelete(lead)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function ActionButton({ label, onClick, danger = false, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors focus:outline-none focus-visible:ring-2 ${danger ? "bg-danger-soft text-danger ring-1 ring-inset ring-primary-ring hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring" : "bg-primary-soft text-primary ring-1 ring-inset ring-primary-ring hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring"}`}
    >
      {children}
    </button>
  );
}
