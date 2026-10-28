import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Layers, ShieldCheck, Users, UserRound } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/org/StatusBadge";
import { useLeads } from "../../context/LeadContext";
import { useOrg } from "../../context/OrgContext";
import { ROLES } from "../../data/constants";

const HEAD =
  "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary";

export default function BusinessDetail() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { getBusiness, getDepartmentsByBusiness, users } = useOrg();
  const { accessibleLeads } = useLeads();

  const business = getBusiness(businessId);

  if (!business) {
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center">
        <p className="text-lg font-semibold text-text-strong">
          Business not found
        </p>
        <p className="text-sm text-text-muted">
          This business does not exist or has been deleted.
        </p>
        <Button
          as={Link}
          to="/admin/businesses"
          variant="secondary"
          className="mx-auto"
        >
          Back to businesses
        </Button>
      </Card>
    );
  }

  const departments = getDepartmentsByBusiness(business.id);
  const admins = users.filter(
    (user) =>
      user.role === ROLES.BUSINESS_ADMIN && user.businessId === business.id,
  );
  const employees = users.filter(
    (user) => user.role === ROLES.EMPLOYEE && user.businessId === business.id,
  );
  const departmentIds = new Set(departments.map((department) => department.id));
  const leads = accessibleLeads.filter(
    (lead) =>
      lead.businessId === business.id || departmentIds.has(lead.departmentId),
  );
  const openDepartment = departments.find(
    (department) => department.active !== false,
  );

  return (
    <div className="space-y-4">
      <Button
        as={Link}
        to="/admin/businesses"
        variant="ghost"
        size="sm"
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        All businesses
      </Button>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-primary-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Viewing as Super Admin: {business.name}
        </p>
        <Button
          size="sm"
          className="shrink-0"
          disabled={!openDepartment}
          onClick={() => openDepartment && navigate(`/d/${openDepartment.id}`)}
        >
          Open as admin
        </Button>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-text-strong">
            {business.name}
          </h1>
          <StatusBadge active={business.active !== false} />
        </div>
        <p className="text-sm text-text-muted">
          {business.description || "No description provided."}
        </p>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            {
              label: "Departments",
              value: departments.length,
              icon: Layers,
              color:
                "from-primary-soft to-primary-soft text-primary border-border",
            },
            {
              label: "Admins",
              value: admins.length,
              icon: ShieldCheck,
              color: "from-info-soft to-accent-soft text-info border-border",
            },
            {
              label: "Employees",
              value: employees.length,
              icon: UserRound,
              to: `/admin/employees?business=${encodeURIComponent(business.id)}`,
              color:
                "from-success-soft to-accent-soft text-success border-border",
            },
            {
              label: "Leads",
              value: leads.length,
              icon: Users,
              to: `/admin/leads?business=${encodeURIComponent(business.id)}`,
              color:
                "from-warning-soft to-warning-soft text-warning border-border",
            },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to || `/admin/businesses/${business.id}`}
              className={`rounded-2xl border bg-linear-to-br px-4 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${item.color}`}
            >
              <span className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide opacity-80">
                {item.label}
                <item.icon className="h-4 w-4 opacity-80" />
              </span>
              <span className="mt-2 block text-2xl font-extrabold tabular-nums">
                {item.value}
              </span>
              {(item.label === "Employees" || item.label === "Leads") && (
                <p className="mt-1 text-xs font-semibold opacity-80">
                  View details →
                </p>
              )}
            </Link>
          ))}
        </div>
      </Card>

      <Card padding="none">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-text-strong">
            Departments
          </h2>
          <p className="text-xs text-text-muted">
            Open any department to manage its leads as the super admin.
          </p>
        </div>
        {departments.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No departments"
            description="This business has no departments yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full min-w-140 text-sm">
              <thead>
                <tr className="border-b border-border bg-linear-to-r from-sidebar-bg via-sidebar-hover-bg to-sidebar-bg">
                  <th className={HEAD}>Department</th>
                  <th className={HEAD}>Leads</th>
                  <th className={HEAD}>Status</th>
                  <th className={`${HEAD} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((department) => (
                  <tr key={department.id} className="data-row">
                    <td className="px-4 py-3">
                      <Link
                        to={`/d/${department.id}`}
                        className="font-medium text-text-strong hover:text-on-hover"
                      >
                        {department.name}
                      </Link>
                      <p className="max-w-md truncate text-xs text-text-muted">
                        {department.description || "No description"}
                      </p>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-on-surface">
                      {
                        leads.filter(
                          (lead) => lead.departmentId === department.id,
                        ).length
                      }
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={department.active !== false} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        as={Link}
                        to={`/d/${department.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card padding="none">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-text-strong">
            Business admins
          </h2>
          <p className="text-xs text-text-muted">
            Accounts that manage this business.
          </p>
        </div>
        {admins.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No business admins"
            description="Create one from Business Admins to let someone manage this business."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <li
                key={admin.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-strong">
                    {admin.name}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    @{admin.username}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone="sky">{ROLES.BUSINESS_ADMIN}</Badge>
                  <StatusBadge active={admin.active !== false} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-border bg-linear-to-r from-success-soft to-surface px-5 py-4">
          <h2 className="text-sm font-semibold text-text-strong">
            Employees in {business.name}
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            {employees.length} team members and their department access.
          </p>
        </div>
        {employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees yet"
            description="Employees created for this business will appear here."
          />
        ) : (
          <ul className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
            {employees.map((employee) => {
              const assigned = (employee.departmentIds || [])
                .filter((id) => departmentIds.has(id))
                .map((id) =>
                  departments.find((department) => department.id === id),
                )
                .filter(Boolean);
              return (
                <li
                  key={employee.id}
                  className="rounded-2xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-hover-bg hover:text-on-hover"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-sm font-bold text-success">
                        {employee.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-strong">
                          {employee.name}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          @{employee.username}
                        </p>
                      </div>
                    </div>
                    <StatusBadge active={employee.active !== false} />
                  </div>
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                      Department access
                    </p>
                    {assigned.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {assigned.map((department) => (
                          <Badge key={department.id} tone="indigo">
                            {department.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted">
                        No departments assigned
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
