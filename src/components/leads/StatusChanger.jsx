import { useState } from "react";
import { CalendarClock, Pencil } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Field";
import { STATUS_META, STATUS_OPTIONS } from "../../data/constants";
import { getResponses } from "../../utils/response";
import { useLeads } from "../../context/LeadContext";
import { cx } from "../../utils/format";

const SELECTED = {
  active: "bg-info-soft text-info ring-primary-ring",
  inactive: "bg-surface-muted text-on-surface ring-primary-ring",
  postponed: "bg-warning-soft text-warning ring-primary-ring",
  converted: "bg-success-soft text-success ring-primary-ring",
};

const IDLE = {
  active:
    "bg-surface text-on-surface ring-primary-ring hover:bg-hover-bg hover:text-on-hover",
  inactive:
    "bg-surface text-on-surface ring-primary-ring hover:bg-hover-bg hover:text-on-hover",
  postponed:
    "bg-surface text-on-surface ring-primary-ring hover:bg-hover-bg hover:text-on-hover",
  converted:
    "bg-surface text-on-surface ring-primary-ring hover:bg-hover-bg hover:text-on-hover",
};

export default function StatusChanger({ lead, onPostpone, onEditDetails }) {
  const { changeStatus } = useLeads();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState("");
  const [spokenWith, setSpokenWith] = useState("");
  const [error, setError] = useState("");

  const current = lead.status;
  const meta = STATUS_META[current] || STATUS_META.active;
  const responses = getResponses(lead);
  const latest = responses[responses.length - 1] || null;
  const latestPostpone = latest?.type === "postponed" ? latest : null;

  const reset = () => {
    setEditing(false);
    setPending(null);
    setNote("");
    setSpokenWith("");
    setError("");
  };

  const pick = (status) => {
    if (status === "postponed") {
      reset();
      onPostpone();
      return;
    }
    setPending(status);
    setNote("");
    setSpokenWith("");
    setError("");
  };

  const save = () => {
    if (!spokenWith.trim()) {
      setError("Enter who spoke with you");
      return;
    }
    changeStatus(lead.id, pending, note.trim(), spokenWith.trim());
    reset();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={meta.tone}>{meta.label}</Badge>
        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            aria-label="Edit status"
            onClick={() => setEditing(true)}
            className="h-8 px-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
        {!editing && latestPostpone && onEditDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditDetails(latestPostpone)}
            className="h-8 px-2"
          >
            <CalendarClock className="h-4 w-4" />
            Edit details
          </Button>
        )}
      </div>

      {editing && (
        <div className="animate-fade-in space-y-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => pick(status)}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring",
                  status === current || status === pending
                    ? SELECTED[status]
                    : IDLE[status],
                )}
              >
                {STATUS_META[status].label}
                {status === current && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    Current
                  </span>
                )}
              </button>
            ))}
          </div>

          {pending && (
            <div className="space-y-3">
              <Input
                label="Who spoke with you"
                value={spokenWith}
                onChange={(event) => {
                  setSpokenWith(event.target.value);
                  setError("");
                }}
                error={error}
                placeholder="e.g. Rahul (student) or his father"
                required
              />
              <Textarea
                label={`Note for ${STATUS_META[pending].label} (optional)`}
                rows={2}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a short reason for this update"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={reset}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={!pending}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
