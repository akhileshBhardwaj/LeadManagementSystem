import { Link, useParams } from "react-router-dom";
import {
  BellRing,
  CalendarClock,
  CircleCheck,
  Hourglass,
  List,
  TriangleAlert,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import StatCard from "../components/dashboard/StatCard";
import SourceBreakdown from "../components/dashboard/SourceBreakdown";
import { useLeads } from "../context/LeadContext";
import { useOrg } from "../context/OrgContext";
import {
  countByStatus,
  getFollowups,
  getSourceBreakdown,
  groupFollowups,
} from "../utils/response";
import { formatTime, relativeDay } from "../utils/date";

export default function Dashboard() {
  const { departmentId } = useParams();
  const { getDepartment } = useOrg();
  const { getLeadsByDepartment } = useLeads();

  const department = getDepartment(departmentId);
  const leads = getLeadsByDepartment(departmentId);

  const stats = countByStatus(leads);
  const groups = groupFollowups(getFollowups(leads));
  const dueCount = groups.overdue.length + groups.today.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={department?.name || "Department"}
        description={`${stats.total} leads in this department. Every department keeps its own leads and follow-ups.`}
        actions={
          <Button as={Link} to={`/d/${departmentId}/leads`} variant="secondary">
            <List className="h-4 w-4" />
            Manage leads
          </Button>
        }
      />

      {dueCount > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-warning-soft p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <BellRing className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-warning">
                Action required: {dueCount} follow-ups due
              </p>
              <p className="text-sm text-warning">
                {groups.overdue.length} overdue · {groups.today.length} due
                today
              </p>
            </div>
          </div>
          <Button
            as={Link}
            to={`/d/${departmentId}/followups`}
            size="sm"
            className="shrink-0"
          >
            Review follow-ups
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total leads"
          value={stats.total}
          icon={Users}
          tone="indigo"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={UserRound}
          tone="sky"
        />
        <StatCard
          label="Postponed"
          value={stats.postponed}
          icon={Hourglass}
          tone="amber"
        />
        <StatCard
          label="Converted"
          value={stats.converted}
          icon={CircleCheck}
          tone="emerald"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={XCircle}
          tone="slate"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="none">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-text-strong">
                Today&apos;s follow-ups
              </h2>
              <p className="text-xs text-text-muted">
                Contacts scheduled for a conversation today
              </p>
            </div>
            <span className="text-xs font-medium tabular-nums text-text-muted">
              {groups.today.length} due
            </span>
          </div>

          {groups.today.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No follow-ups scheduled for today"
              description="Postponed leads with today's date will appear here."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {groups.today.map((item) => (
                <li key={`${item.leadId}-${item.responseId}`}>
                  <Link
                    to={`/d/${departmentId}/leads/${item.leadId}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-hover-bg hover:text-on-hover"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar name={item.lead.name} size="sm" />
                      <span className="min-w-0">
                        <span className="truncate text-sm font-medium text-text-strong">
                          {item.lead.name}
                        </span>
                        <span className="block truncate text-xs text-text-muted">
                          {item.lead.course || "—"} · {item.person || "Contact"}{" "}
                          · {item.location || item.lead.location || "—"}
                        </span>
                        <span className="block text-xs tabular-nums text-text-muted">
                          {item.lead.phone} · {item.lead.phone2 || "-"}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-text-muted">
                      {item.time
                        ? formatTime(item.time)
                        : relativeDay(item.nextDate)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-soft text-danger">
                <TriangleAlert className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-text-muted">Overdue follow-ups</p>
                <p className="text-2xl font-semibold tabular-nums text-text-strong">
                  {groups.overdue.length}
                </p>
              </div>
            </div>
            <p className="text-xs text-text-muted">
              {groups.overdue.length === 0
                ? "Nothing is overdue. Great pipeline management!"
                : "These contacts were promised a call earlier than today."}
            </p>
            {groups.overdue.length > 0 && (
              <Link
                to={`/d/${departmentId}/followups`}
                className="flex items-center justify-between rounded-lg bg-danger-soft px-2.5 py-1.5 text-xs text-danger transition-colors hover:bg-hover-bg hover:text-on-hover"
              >
                <span className="font-medium">Review overdue leads</span>
                <Badge tone="rose">{groups.overdue.length}</Badge>
              </Link>
            )}
          </Card>

          <SourceBreakdown items={getSourceBreakdown(leads)} />
        </div>
      </div>
    </div>
  );
}
