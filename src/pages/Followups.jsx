import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CalendarCheck,
  CalendarClock,
  Clock,
  Search,
  TriangleAlert,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import PostponeForm from "../components/leads/PostponeForm";
import FollowupCard from "../components/leads/FollowupCard";
import PostponedWithoutDate from "../components/followups/PostponedWithoutDate";
import { useLeads } from "../context/LeadContext";
import { useOrg } from "../context/OrgContext";
import {
  getFollowups,
  getPostponeDefaults,
  getPostponedWithoutDate,
  groupFollowups,
} from "../utils/response";
import { cx } from "../utils/format";

export default function Followups() {
  const { departmentId } = useParams();
  const { getDepartment } = useOrg();
  const { getLeadsByDepartment, postponeLead, updateResponse } = useLeads();

  const department = getDepartment(departmentId);
  const leads = getLeadsByDepartment(departmentId);

  const [postponeTarget, setPostponeTarget] = useState(null);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const setTarget = (lead, entry = null) => setPostponeTarget({ lead, entry });
  const closePostpone = () => setPostponeTarget(null);

  const submitPostpone = (values) => {
    if (postponeTarget.entry) {
      updateResponse(postponeTarget.lead.id, postponeTarget.entry.id, values);
    } else {
      postponeLead(postponeTarget.lead.id, values);
    }
    closePostpone();
  };

  const rawFollowups = useMemo(() => getFollowups(leads), [leads]);
  const groups = useMemo(() => groupFollowups(rawFollowups), [rawFollowups]);
  const noDate = useMemo(() => getPostponedWithoutDate(leads), [leads]);

  // Search filter
  const term = query.trim().toLowerCase();
  const filterByTerm = (list) => {
    if (!term) return list;
    return list.filter((item) => {
      const haystack = [
        item.lead?.name,
        item.lead?.phone,
        item.lead?.course,
        item.person,
        item.mobile,
        item.location,
        item.note,
      ];
      return haystack.some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(term),
      );
    });
  };

  const overdueFiltered = filterByTerm(groups.overdue);
  const todayFiltered = filterByTerm(groups.today);
  const upcomingFiltered = filterByTerm(groups.upcoming);

  const tabs = [
    { key: "all", label: "All Follow-ups", count: rawFollowups.length },
    {
      key: "overdue",
      label: "Overdue",
      count: groups.overdue.length,
      tone: "rose",
    },
    { key: "today", label: "Today", count: groups.today.length, tone: "amber" },
    {
      key: "upcoming",
      label: "Upcoming",
      count: groups.upcoming.length,
      tone: "slate",
    },
  ];

  const sectionsToRender = useMemo(() => {
    const list = [];
    if (tab === "all" || tab === "overdue") {
      list.push({
        key: "overdue",
        title: "Overdue",
        tone: "rose",
        icon: TriangleAlert,
        items: overdueFiltered,
        hint: "Promised calls that are past their date.",
      });
    }
    if (tab === "all" || tab === "today") {
      list.push({
        key: "today",
        title: "Today",
        tone: "amber",
        icon: Clock,
        items: todayFiltered,
        hint: "Follow up with these contacts today.",
      });
    }
    if (tab === "all" || tab === "upcoming") {
      list.push({
        key: "upcoming",
        title: "Upcoming",
        tone: "slate",
        icon: CalendarClock,
        items: upcomingFiltered,
        hint: "Scheduled for the coming days.",
      });
    }
    return list;
  }, [tab, overdueFiltered, todayFiltered, upcomingFiltered]);

  const totalVisible = sectionsToRender.reduce(
    (sum, s) => sum + s.items.length,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description={`${department?.name || "Department"} · ${rawFollowups.length} scheduled · ${groups.overdue.length} overdue, ${groups.today.length} due today`}
      />

      {/* Tabs and Search Controls */}
      <Card padding="none">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring",
                  tab === t.key
                    ? "bg-primary font-semibold text-on-dark shadow-sm"
                    : "bg-surface-muted text-on-surface hover:bg-hover-bg hover:text-on-hover",
                )}
              >
                <span>{t.label}</span>
                <span
                  className={cx(
                    "rounded-full px-1.5 text-[10px] font-semibold",
                    tab === t.key
                      ? "bg-surface/20 text-on-dark"
                      : t.tone === "rose" && t.count > 0
                        ? "bg-danger-soft text-danger"
                        : t.tone === "amber" && t.count > 0
                          ? "bg-warning-soft text-warning"
                          : "bg-surface-muted text-on-surface",
                  )}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search follow-ups..."
              aria-label="Search follow-ups"
              className="h-9 w-full rounded-xl border border-border bg-page pl-9 pr-3 text-xs text-text-strong placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-ring"
            />
          </div>
        </div>
      </Card>

      {totalVisible === 0 && noDate.length === 0 && (
        <Card>
          <EmptyState
            icon={CalendarCheck}
            title={`No ${tab !== "all" ? tab : ""} follow-ups found`}
            description={
              term
                ? "No follow-up matches your search term."
                : "Postpone a lead to see it scheduled here."
            }
          />
        </Card>
      )}

      {sectionsToRender.map((section) => {
        if (section.items.length === 0) return null;
        return (
          <section key={section.key} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-text-strong">
                {section.title}
              </h2>
              <span
                className={cx(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  section.tone === "rose"
                    ? "bg-danger-soft text-danger"
                    : section.tone === "amber"
                      ? "bg-warning-soft text-warning"
                      : "bg-surface-muted text-on-surface",
                )}
              >
                {section.items.length}
              </span>
              <p className="text-xs text-text-muted">{section.hint}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {section.items.map((item) => (
                <FollowupCard
                  key={`${item.leadId}-${item.responseId}`}
                  followup={item}
                  onPostpone={(lead) => setTarget(lead)}
                  onEditDetails={(lead, entry) => setTarget(lead, entry)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <PostponedWithoutDate
        leads={noDate}
        onSetDate={(lead) => setTarget(lead)}
      />

      <Modal
        open={Boolean(postponeTarget)}
        onClose={closePostpone}
        title={postponeTarget?.entry ? "Edit follow-up" : "Postpone follow-up"}
        description={
          postponeTarget
            ? `Set the next follow-up for ${postponeTarget.lead.name}.`
            : undefined
        }
      >
        {postponeTarget && (
          <PostponeForm
            initial={
              postponeTarget.entry || getPostponeDefaults(postponeTarget.lead)
            }
            submitLabel={
              postponeTarget.entry ? "Save changes" : "Postpone and remind me"
            }
            onCancel={closePostpone}
            onSubmit={submitPostpone}
          />
        )}
      </Modal>
    </div>
  );
}
