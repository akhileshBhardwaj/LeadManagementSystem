import { CalendarClock, Hourglass } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { LEAD_CONFIG } from "../../data/constants";
import { getFollowup, getPostponeCount } from "../../utils/response";
import { formatBudget } from "../../utils/format";
import { formatDate, formatTime } from "../../utils/date";

export default function LeadInfoPanel({ lead, onPostpone }) {
  const followup = getFollowup(lead);
  const rows = [
    ["Phone 1", lead.phone],
    ["Phone 2", lead.phone2 || "-"],
    [LEAD_CONFIG.itemLabel, lead.course || "—"],
    ["Location", lead.location || "—"],
    ["Budget", formatBudget(lead.budgetMin, lead.budgetMax)],
    ["Reference", lead.reference || "Unknown"],
    ["Created on", formatDate(lead.createdAt.slice(0, 10))],
  ];

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-text-strong">
          Next follow-up
        </h2>
        {followup ? (
          <div className="space-y-1.5 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
            <p className="flex items-center gap-2 font-medium">
              <CalendarClock className="h-4 w-4" />
              {formatDate(followup.nextDate)} · {formatTime(followup.time)}
            </p>
            <p className="text-xs">Talk to {followup.person}</p>
            <p className="flex items-center gap-1.5 text-xs">
              <Hourglass className="h-3.5 w-3.5" />
              Postponed {getPostponeCount(lead)} times
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            No follow-up scheduled. Postpone this lead to be reminded on a
            particular date.
          </p>
        )}
        <Button className="w-full" onClick={onPostpone}>
          {followup ? "Reschedule follow-up" : "Postpone follow-up"}
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-text-strong">
          Lead information
        </h2>
        <dl className="space-y-2.5 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-text-muted">{label}</dt>
              <dd className="text-right font-medium text-text-strong">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
