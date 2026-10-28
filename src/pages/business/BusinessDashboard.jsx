import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BellRing,
  Building2,
  CheckCircle2,
  Layers,
  Plus,
  Users,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import SourceBreakdown from "../../components/dashboard/SourceBreakdown";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/org/StatusBadge";
import ManageTable from "../../components/org/ManageTable";
import { useAuth } from "../../context/AuthContext";
import { useOrg } from "../../context/OrgContext";
import { useLeads } from "../../context/LeadContext";
import { ROLES } from "../../data/constants";
import {
  getFollowups,
  getSourceBreakdown,
  groupFollowups,
} from "../../utils/response";

const COLUMNS = [
  { label: "Department" },
  { label: "Leads" },
  { label: "Due follow-ups" },
  { label: "Employees" },
  { label: "Status" },
  { label: "Actions", align: "right" },
];

const dueCount = (leads) => {
  const groups = groupFollowups(getFollowups(leads));
  return groups.overdue.length + groups.today.length;
};

export default function BusinessDashboard() {
  const { currentUser } = useAuth();
  const { users, getBusiness, getDepartmentsByBusiness } = useOrg();
  const { accessibleLeads } = useLeads();
  const [query, setQuery] = useState("");

  const businessId = currentUser?.businessId;
  const business = getBusiness(businessId);
  const departments = getDepartmentsByBusiness(businessId);
  const employees = users.filter(
    (user) => user.role === ROLES.EMPLOYEE && user.businessId === businessId,
  );

  const rows = useMemo(
    () =>
      departments.map((department) => {
        const leads = accessibleLeads.filter(
          (lead) => lead.departmentId === department.id,
        );
        return {
          department,
          leads: leads.length,
          due: dueCount(leads),
          employees: employees.filter((user) =>
            (user.departmentIds || []).includes(department.id),
          ).length,
        };
      }),
    [departments, accessibleLeads, employees],
  );

  const totalDue = rows.reduce((sum, row) => sum + row.due, 0);
  const term = query.trim().toLowerCase();
  const visible = rows.filter((row) =>
    row.department.name.toLowerCase().includes(term),
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl dashboard-hero px-6 py-7 text-on-dark shadow-lg shadow-soft sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full border border-on-dark/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-on-dark/15 bg-surface/10 px-3 py-1 text-xs font-medium text-on-hero-muted">
              <Building2 className="h-3.5 w-3.5" /> Business workspace
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {business?.name || "Business dashboard"}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-on-hero-muted">
              Your business at a glance. Set up departments, give employees
              access, and track the work happening across your team.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              as={Link}
              to="/business/departments"
              className="bg-surface text-on-surface hover:bg-hover-bg hover:text-on-hover"
            >
              <Plus className="h-4 w-4" /> New department
            </Button>
            <Button
              as={Link}
              to="/business/employees"
              variant="secondary"
              className="border border-on-dark/20 bg-surface/10 text-on-dark shadow-none hover:bg-hover-bg hover:text-on-hover"
            >
              <Users className="h-4 w-4" /> Manage team
            </Button>
          </div>
        </div>
        <div className="relative mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-on-dark/15 pt-4 text-xs text-on-hero-muted">
          <span>
            <strong className="text-on-hero-muted">{departments.length}</strong>{" "}
            departments
          </span>
          <span>
            <strong className="text-on-hero-muted">{employees.length}</strong>{" "}
            employees
          </span>
          <span>
            <strong className="text-on-hero-muted">{totalDue}</strong>{" "}
            follow-ups due
          </span>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Departments"
          value={departments.length}
          icon={Layers}
          tone="indigo"
          hint="Your business"
          to="/business/departments"
        />
        <StatCard
          label="Employees"
          value={employees.length}
          icon={Users}
          tone="sky"
          hint="Team accounts"
          to="/business/employees"
        />
        <StatCard
          label="Leads"
          value={accessibleLeads.length}
          icon={Building2}
          tone="emerald"
          hint="Across your departments"
        />
        <StatCard
          label="Due follow-ups"
          value={totalDue}
          icon={BellRing}
          tone="rose"
          hint="Overdue and due today"
        />
      </div>

      {(departments.length === 0 || employees.length === 0) && (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Getting started
              </p>
              <h2 className="mt-1 text-base font-semibold text-text-strong">
                Finish setting up your team
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {departments.length === 0
                  ? "Create your first department. You can then assign employee access and start adding leads."
                  : "Your departments are ready. Add employees and choose which departments each person can access."}
              </p>
            </div>
            <Button
              as={Link}
              to={
                departments.length === 0
                  ? "/business/departments"
                  : "/business/employees"
              }
            >
              {departments.length === 0 ? "Create department" : "Add employee"}
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${departments.length ? "bg-success-soft text-success" : "bg-primary-soft text-primary"}`}
              >
                {departments.length ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">1</span>
                )}
              </span>
              <span
                className={
                  departments.length
                    ? "text-text-muted"
                    : "font-medium text-text-strong"
                }
              >
                Create a department
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${employees.length ? "bg-success-soft text-success" : "bg-surface-muted text-text-muted"}`}
              >
                {employees.length ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">2</span>
                )}
              </span>
              <span
                className={
                  employees.length ? "text-text-muted" : "text-on-surface"
                }
              >
                Add employees and assign department access
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <PageHeader
          title="Department performance"
          description="See lead volume, follow-ups and team coverage for each department."
          actions={
            <Button as={Link} to="/business/departments" variant="secondary">
              Manage departments <ArrowUpRight className="h-4 w-4" />
            </Button>
          }
        />
        <ManageTable
          query={query}
          onQueryChange={setQuery}
          placeholder="Search departments"
          columns={COLUMNS}
          isEmpty={visible.length === 0}
          empty={
            <EmptyState
              icon={Layers}
              title={
                departments.length === 0 ? "No departments yet" : "No matches"
              }
              description={
                departments.length === 0
                  ? "Create your first department to organize leads and employee access."
                  : "Try a different search term."
              }
            />
          }
        >
          {visible.map((row) => (
            <tr key={row.department.id} className="data-row">
              <td className="px-4 py-3">
                <Link
                  to={`/d/${row.department.id}`}
                  className="font-medium text-text-strong hover:text-on-hover"
                >
                  {row.department.name}
                </Link>
                <p className="max-w-md truncate text-xs text-text-muted">
                  {row.department.description || "No description"}
                </p>
              </td>
              <td className="px-4 py-3 tabular-nums text-on-surface">
                {row.leads}
              </td>
              <td className="px-4 py-3 tabular-nums text-on-surface">
                {row.due}
              </td>
              <td className="px-4 py-3 tabular-nums text-on-surface">
                {row.employees}
              </td>
              <td className="px-4 py-3">
                <StatusBadge active={row.department.active !== false} />
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  as={Link}
                  to={`/d/${row.department.id}`}
                  variant="secondary"
                  size="sm"
                >
                  Open
                </Button>
              </td>
            </tr>
          ))}
        </ManageTable>
      </section>

      <SourceBreakdown items={getSourceBreakdown(accessibleLeads)} />
    </div>
  );
}
