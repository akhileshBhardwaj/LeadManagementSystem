import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Building2, Search, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/dashboard/StatCard";
import { useLeads } from "../../context/LeadContext";
import { useOrg } from "../../context/OrgContext";
import { countByStatus } from "../../utils/response";

export default function AdminLeads() {
  const { businesses, departments } = useOrg();
  const { accessibleLeads } = useLeads();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const selectedBusiness = params.get("business") || "all";
  const departmentMap = useMemo(
    () => new Map(departments.map((department) => [department.id, department])),
    [departments],
  );
  const businessLeads = (businessId) =>
    accessibleLeads.filter(
      (lead) =>
        lead.businessId === businessId ||
        (!lead.businessId &&
          departmentMap.get(lead.departmentId)?.businessId === businessId),
    );
  const totalStats = countByStatus(accessibleLeads);
  const term = query.trim().toLowerCase();
  const groups = businesses
    .filter(
      (business) =>
        selectedBusiness === "all" || business.id === selectedBusiness,
    )
    .map((business) => {
      const leads = businessLeads(business.id).filter((lead) => {
        const department = departmentMap.get(lead.departmentId);
        return [
          lead.name,
          lead.phone,
          lead.course,
          lead.location,
          department?.name,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(term),
        );
      });
      const byDepartment = departments
        .filter((department) => department.businessId === business.id)
        .map((department) => ({
          department,
          leads: leads.filter((lead) => lead.departmentId === department.id),
        }));
      return { business, leads, byDepartment, stats: countByStatus(leads) };
    })
    .filter((group) => group.leads.length > 0 || !term);

  const setBusiness = (value) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("business");
    else next.set("business", value);
    setParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-3xl dashboard-hero px-5 py-7 text-on-dark shadow-xl shadow-soft sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-on-dark/20" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-on-dark/20 bg-surface/10 px-3 py-1 text-xs font-semibold">
              BUSINESS ACTIVITY
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Leads by business
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-hero-muted">
              Review lead totals and status by business and department. Lead
              reminders stay with each business team.
            </p>
          </div>
          <Link
            to="/admin/businesses"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-on-dark/20 bg-surface/10 px-4 text-sm font-semibold transition-colors hover:bg-hover-bg hover:text-on-hover"
          >
            Businesses <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="All leads"
          value={totalStats.total}
          icon={Users}
          tone="amber"
          hint="Across all businesses"
        />
        <StatCard
          label="Active"
          value={totalStats.active}
          icon={Users}
          tone="sky"
          hint="By current status"
        />
        <StatCard
          label="Converted"
          value={totalStats.converted}
          icon={Users}
          tone="emerald"
          hint="By current status"
        />
        <StatCard
          label="Businesses"
          value={businesses.length}
          icon={Building2}
          tone="indigo"
          hint="See business directory"
          to="/admin/businesses"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search lead, phone or department"
            aria-label="Search leads"
            className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm shadow-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
          />
        </label>
        <select
          value={selectedBusiness}
          onChange={(event) => setBusiness(event.target.value)}
          aria-label="Filter leads by business"
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring sm:w-64"
        >
          <option value="all">All businesses</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No leads found"
            description="Try changing your search or business filter."
          />
        ) : (
          groups.map(({ business, leads, byDepartment, stats }) => (
            <Card key={business.id} padding="none" className="overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-border bg-warning-soft px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-text-strong">
                      {business.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {leads.length} {leads.length === 1 ? "lead" : "leads"}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/admin/businesses/${business.id}`}
                  aria-label={`Open ${business.name}`}
                  className="rounded-lg p-2 text-text-muted transition-colors hover:bg-hover-bg hover:text-on-hover"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 px-4 py-3 sm:px-5">
                {[
                  ["Active", stats.active, "sky"],
                  ["Postponed", stats.postponed, "amber"],
                  ["Converted", stats.converted, "emerald"],
                  ["Inactive", stats.inactive, "slate"],
                ].map(([label, value, tone]) => (
                  <Badge key={label} tone={tone}>
                    {label}: {value}
                  </Badge>
                ))}
              </div>
              <div className="divide-y divide-slate-100 border-t border-border">
                {byDepartment.map(({ department, leads: deptLeads }) => (
                  <Link
                    key={department.id}
                    to={`/d/${department.id}/leads`}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-hover-bg hover:text-on-hover sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-strong">
                        {department.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        Department leads
                      </p>
                    </div>
                    <Badge tone="indigo">{deptLeads.length}</Badge>
                  </Link>
                ))}
                {byDepartment.length === 0 && (
                  <p className="px-5 py-4 text-sm text-text-muted">
                    No departments in this business yet.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-5">
                <span className="text-xs text-text-muted">Business total</span>
                <Link
                  to={`/admin/businesses/${business.id}`}
                  className="text-xs font-semibold text-primary hover:text-on-hover"
                >
                  Open business{" "}
                  <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
