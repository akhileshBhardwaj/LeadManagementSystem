import { History, MapPin, Phone, User } from "lucide-react";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { RESPONSE_TYPE_META } from "../../data/constants";
import { buildTimeline } from "../../utils/response";
import { formatDate, formatTime } from "../../utils/date";
import { cx } from "../../utils/format";

const HEADERS = ["Update", "Status", "Spoken with", "Rescheduled to", "Reason"];

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-text-strong">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function ResponseHistory({ lead }) {
  const items = buildTimeline(lead);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No responses yet"
        description="Status changes and postpone entries will show up here automatically."
      />
    );
  }

  const postponeCount = items.filter(
    (item) => item.type === "postponed",
  ).length;

  return (
    <div className="space-y-5">
      {/* Contact details */}
      <div className="grid gap-4 rounded-2xl border border-border bg-page p-4 sm:grid-cols-3">
        <InfoItem icon={User} label="Contact" value={lead.name} />
        <InfoItem
          icon={Phone}
          label="Phones"
          value={`${lead.phone} · ${lead.phone2 || "-"}`}
        />
        <InfoItem icon={MapPin} label="Location" value={lead.location} />
      </div>

      {/* History table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-text-strong">
            Follow-up history
          </h3>
          <span className="text-xs text-text-muted">
            {items.length} {items.length === 1 ? "entry" : "entries"} ·{" "}
            {postponeCount} postponed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-190 text-left text-sm">
            <thead>
              <tr className="bg-table-head text-table-head-text text-[11px] font-bold uppercase tracking-wider">
                {HEADERS.map((h) => (
                  <th key={h} className="px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const meta =
                  RESPONSE_TYPE_META[item.type] || RESPONSE_TYPE_META.postponed;
                const isPostpone = item.type === "postponed";

                return (
                  <tr
                    key={item.id}
                    className={cx(
                      "data-row align-top",
                      index === 0 && "bg-primary-soft",
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-text-strong">
                      {isPostpone
                        ? `Postpone #${item.postponeNo}`
                        : "Status change"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-text-strong">
                      {item.spokenWith || (
                        <span className="font-normal text-text-muted">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                      {isPostpone ? (
                        <>
                          <p className="font-semibold text-text-strong">
                            {formatDate(item.nextDate)}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatTime(item.time)}
                          </p>
                        </>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-on-surface">
                      {item.note || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
