import {
  CalendarClock,
  Clock,
  MapPin,
  Phone,
  Repeat,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import StatusChanger from "./StatusChanger";
import { LEAD_CONFIG } from "../../data/constants";
import { getPostponeCount } from "../../utils/response";
import { formatDate, formatTime, relativeDay } from "../../utils/date";

export default function FollowupCard({ followup, onPostpone, onEditDetails }) {
  const overdue = relativeDay(followup.nextDate).includes("overdue");
  const facts = [
    {
      id: "date",
      icon: CalendarClock,
      value: `${formatDate(followup.nextDate)} · ${relativeDay(followup.nextDate)}`,
    },
    { id: "time", icon: Clock, value: formatTime(followup.time) },
    { id: "person", icon: UserRound, value: followup.person || "—" },
    {
      id: "mobile",
      icon: Phone,
      value: (
        <span className="tabular-nums">
          {followup.mobile || followup.lead.phone}
          <span className="text-text-muted text-xs ml-1">
            (Alt: {followup.lead.phone2 || "-"})
          </span>
        </span>
      ),
    },
    { id: "location", icon: MapPin, value: followup.location || "—" },
  ];

  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-start gap-3">
        <Avatar name={followup.lead.name} />
        <div className="min-w-0 flex-1">
          <Link
            to={`/d/${followup.lead.departmentId}/leads/${followup.leadId}`}
            className="truncate font-semibold text-text-strong hover:text-on-hover transition-colors block"
          >
            {followup.lead.name}
          </Link>
          <p className="truncate text-xs text-text-muted">
            {followup.lead.course || `${LEAD_CONFIG.itemLabel} not set`}
          </p>
          <p className="tabular-nums text-xs text-text-muted font-medium">
            {followup.lead.phone} · {followup.lead.phone2 || "-"}
          </p>
        </div>
        <Badge tone={overdue ? "rose" : "amber"}>
          {relativeDay(followup.nextDate)}
        </Badge>
      </div>

      <ul className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
        {facts.map((fact) => (
          <li key={fact.id} className="flex items-start gap-2 text-on-surface">
            <fact.icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
            <span className="min-w-0 wrap-break-word">{fact.value}</span>
          </li>
        ))}
      </ul>

      {followup.note && (
        <p className="rounded-xl bg-page px-3 py-2 text-sm text-on-surface">
          {followup.note}
        </p>
      )}

      <div className="mt-auto space-y-3 border-t border-border pt-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
          <Repeat className="h-3.5 w-3.5" />
          Postponed {getPostponeCount(followup.lead)} times
        </p>
        <StatusChanger
          lead={followup.lead}
          onPostpone={() => onPostpone(followup.lead)}
          onEditDetails={(entry) => onEditDetails(followup.lead, entry)}
        />
      </div>
    </Card>
  );
}
