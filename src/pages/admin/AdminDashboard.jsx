import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  Plus,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/org/StatusBadge";
import ManageTable from "../../components/org/ManageTable";
import Button from "../../components/ui/Button";
import { useLeads } from "../../context/LeadContext";
import { useOrg } from "../../context/OrgContext";
import { ROLES } from "../../data/constants";

const COLUMNS = [
  { label: "Business" },
  { label: "Business admin" },
  { label: "Employees" },
  { label: "Leads" },
  { label: "Status" },
  { label: "", align: "right" },
];

export default function AdminDashboard() {
  const { businesses, departments, users } = useOrg();
  const { accessibleLeads } = useLeads();
  const [query, setQuery] = useState("");
  const admins = users.filter((user) => user.role === ROLES.BUSINESS_ADMIN);
  const employees = users.filter((user) => user.role === ROLES.EMPLOYEE);

  const leadCounts = useMemo(() => {
    const departmentBusinesses = new Map(
      departments.map((item) => [item.id, item.businessId]),
    );
    const counts = new Map();
    accessibleLeads.forEach((lead) => {
      const businessId =
        lead.businessId || departmentBusinesses.get(lead.departmentId);
      if (businessId) counts.set(businessId, (counts.get(businessId) || 0) + 1);
    });
    return counts;
  }, [accessibleLeads, departments]);

  const term = query.trim().toLowerCase();
  const visible = businesses.filter((business) => {
    const businessAdmins = admins.filter(
      (admin) => admin.businessId === business.id,
    );
    return [
      business.name,
      business.description,
      ...businessAdmins.map((admin) => admin.name),
      ...businessAdmins.map((admin) => admin.username),
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(term),
    );
  });

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-3xl dashboard-hero px-5 py-7 text-on-dark shadow-xl shadow-soft sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-on-dark/10" />
        <div className="pointer-events-none absolute right-12 top-8 h-44 w-44 rounded-full bg-primary blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-on-dark/15 bg-surface/10 px-3 py-1.5 text-xs font-semibold text-on-hero-muted shadow-sm backdrop-blur">
              <Building2 className="h-3.5 w-3.5" /> PLATFORM CONTROL CENTER
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your businesses at a glance
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-on-hero-muted sm:text-base">
              See who runs each business, how many employees are on the team,
              and how many leads they manage.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              as={Link}
              to="/admin/businesses"
              className="border border-on-dark/15 bg-surface text-on-surface shadow-lg shadow-soft hover:bg-hover-bg hover:text-on-hover"
            >
              <Plus className="h-4 w-4" /> Add business
            </Button>
            <Button
              as={Link}
              to="/admin/users"
              variant="secondary"
              className="border border-on-dark/20 bg-surface/10 text-on-dark shadow-none backdrop-blur hover:bg-hover-bg hover:text-on-hover"
            >
              <ShieldCheck className="h-4 w-4" /> Business admins
            </Button>
          </div>
        </div>
        <div className="relative mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-on-dark/15 pt-4 text-xs font-medium text-on-hero-muted">
          <span>
            <strong className="text-on-hero-muted">{businesses.length}</strong>{" "}
            businesses
          </span>
          <span>
            <strong className="text-on-hero-muted">{employees.length}</strong>{" "}
            employees
          </span>
          <span>
            <strong className="text-on-hero-muted">
              {accessibleLeads.length}
            </strong>{" "}
            leads
          </span>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Businesses"
          value={businesses.length}
          icon={Building2}
          tone="indigo"
          hint="View all businesses"
          to="/admin/businesses"
        />
        <StatCard
          label="Business admins"
          value={admins.length}
          icon={ShieldCheck}
          tone="sky"
          hint="Manage admin accounts"
          to="/admin/users"
        />
        <StatCard
          label="Employees"
          value={employees.length}
          icon={UserRound}
          tone="emerald"
          hint="Browse teams by business"
          to="/admin/employees"
        />
        <StatCard
          label="Leads"
          value={accessibleLeads.length}
          icon={Users}
          tone="amber"
          hint="View business lead totals"
          to="/admin/leads"
        />
      </div>

      <section className="space-y-4">
        <PageHeader
          title="Business directory"
          description="Choose a business to see its team, departments and lead totals."
          actions={
            <Button as={Link} to="/admin/businesses" variant="secondary">
              Manage businesses <ArrowUpRight className="h-4 w-4" />
            </Button>
          }
        />
        <ManageTable
          query={query}
          onQueryChange={setQuery}
          placeholder="Search businesses or admins"
          columns={COLUMNS}
          isEmpty={visible.length === 0}
          empty={
            <EmptyState
              icon={Building2}
              title="No businesses found"
              description="Create a business to start setting up its team."
            />
          }
        >
          {visible.map((business) => {
            const businessAdmins = admins.filter(
              (user) => user.businessId === business.id,
            );
            const businessEmployees = employees.filter(
              (user) => user.businessId === business.id,
            );
            return (
              <tr key={business.id} className="data-row">
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/businesses/${business.id}`}
                    className="font-semibold text-text-strong hover:text-on-hover"
                  >
                    {business.name}
                  </Link>
                  <p className="max-w-56 truncate text-xs text-text-muted">
                    {business.description || "No description"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {businessAdmins.length ? (
                    <div className="space-y-1">
                      {businessAdmins.slice(0, 2).map((admin) => (
                        <p
                          key={admin.id}
                          className="max-w-48 truncate text-on-surface"
                          title={admin.name}
                        >
                          {admin.name}
                        </p>
                      ))}
                      {businessAdmins.length > 2 && (
                        <p className="text-xs text-text-muted">
                          +{businessAdmins.length - 2} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-text-muted">Not assigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/employees?business=${encodeURIComponent(business.id)}`}
                    aria-label={`View ${businessEmployees.length} employees in ${business.name}`}
                    className="inline-flex min-w-10 items-center justify-center rounded-full bg-success-soft px-3 py-1 font-semibold tabular-nums text-success transition-colors hover:bg-hover-bg hover:text-on-hover"
                  >
                    {businessEmployees.length}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/leads?business=${encodeURIComponent(business.id)}`}
                    aria-label={`View leads in ${business.name}`}
                    className="inline-flex min-w-10 items-center justify-center rounded-full bg-warning-soft px-3 py-1 font-semibold tabular-nums text-warning transition-colors hover:bg-hover-bg hover:text-on-hover"
                  >
                    {leadCounts.get(business.id) || 0}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge active={business.active !== false} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    as={Link}
                    to={`/admin/businesses/${business.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    Open
                  </Button>
                </td>
              </tr>
            );
          })}
        </ManageTable>
      </section>
    </div>
  );
}
