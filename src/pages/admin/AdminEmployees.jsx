import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import ConfirmDelete from "../../components/org/ConfirmDelete";
import StatusBadge from "../../components/org/StatusBadge";
import UserForm from "../../components/org/UserForm";
import StatCard from "../../components/dashboard/StatCard";
import { useOrg } from "../../context/OrgContext";
import { ROLES } from "../../data/constants";

const ACTION =
  "rounded-lg p-2 text-text-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring hover:bg-hover-bg hover:text-on-hover";

export default function AdminEmployees() {
  const {
    businesses,
    departments,
    users,
    isUsernameTaken,
    addUser,
    updateUser,
    deleteUser,
  } = useOrg();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const selectedBusiness = params.get("business") || "all";
  const employees = users.filter((user) => user.role === ROLES.EMPLOYEE);
  const admins = users.filter((user) => user.role === ROLES.BUSINESS_ADMIN);
  const departmentMap = useMemo(
    () => new Map(departments.map((department) => [department.id, department])),
    [departments],
  );
  const term = query.trim().toLowerCase();

  const groups = businesses
    .filter(
      (business) =>
        selectedBusiness === "all" || business.id === selectedBusiness,
    )
    .map((business) => {
      const members = employees
        .filter((employee) => employee.businessId === business.id)
        .filter((employee) => {
          const assigned = (employee.departmentIds || []).map(
            (id) => departmentMap.get(id)?.name || "",
          );
          return [
            employee.name,
            employee.username,
            business.name,
            ...assigned,
          ].some((value) => String(value).toLowerCase().includes(term));
        });
      return {
        business,
        employees: members,
        admins: admins.filter((admin) => admin.businessId === business.id),
      };
    })
    .filter((group) => group.employees.length > 0 || !term);

  const setBusiness = (value) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("business");
    else next.set("business", value);
    setParams(next, { replace: true });
  };

  const closeForm = () => setEditing(undefined);
  const submitForm = (values) => {
    if (editing) updateUser(editing.id, values);
    else addUser({ ...values, role: ROLES.EMPLOYEE });
    closeForm();
  };

  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-3xl dashboard-hero px-5 py-7 text-on-dark shadow-xl shadow-soft sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-on-dark/15" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-on-dark/15 bg-surface/10 px-3 py-1 text-xs font-semibold">
              TEAM DIRECTORY
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Employees by business
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-hero-muted">
              Manage employee accounts, business assignment, department access
              and account status across the platform.
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

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Employees"
          value={employees.length}
          icon={Users}
          tone="emerald"
          hint="All businesses"
        />
        <StatCard
          label="Businesses"
          value={businesses.length}
          icon={Building2}
          tone="indigo"
          hint="Filter teams below"
          to="/admin/businesses"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search employees, username or department"
            aria-label="Search employees"
            className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm shadow-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
          />
        </label>
        <select
          value={selectedBusiness}
          onChange={(event) => setBusiness(event.target.value)}
          aria-label="Filter by business"
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring sm:w-64"
        >
          <option value="all">All businesses</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
        <Button
          onClick={() => setEditing(null)}
          disabled={businesses.length === 0}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" /> Add employee
        </Button>
      </div>

      <div className="space-y-4">
        {groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description="Try changing your search or business filter."
          />
        ) : (
          groups.map(
            ({ business, employees: team, admins: businessAdmins }) => (
              <Card
                key={business.id}
                padding="none"
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 border-b border-border bg-page px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-text-strong">
                        {business.name}
                      </h2>
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        Admin:{" "}
                        {businessAdmins.map((admin) => admin.name).join(", ") ||
                          "Not assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone="emerald">
                      {team.length}{" "}
                      {team.length === 1 ? "employee" : "employees"}
                    </Badge>
                    <StatusBadge active={business.active !== false} />
                    <Link
                      to={`/admin/businesses/${business.id}`}
                      aria-label={`Open ${business.name}`}
                      className="rounded-lg p-2 text-text-muted transition-colors hover:bg-hover-bg hover:text-on-hover"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                {team.length === 0 ? (
                  <p className="px-5 py-5 text-sm text-text-muted">
                    No employees match this search.
                  </p>
                ) : (
                  <ul className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
                    {team.map((employee) => {
                      const assigned = (employee.departmentIds || [])
                        .map((id) => departmentMap.get(id))
                        .filter(
                          (department) =>
                            department?.businessId === employee.businessId,
                        );
                      return (
                        <li
                          key={employee.id}
                          className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
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
                          <div className="mt-3 flex justify-end gap-1 border-t border-border pt-2">
                            <button
                              type="button"
                              aria-label={`${employee.active === false ? "Activate" : "Deactivate"} ${employee.name}`}
                              title={
                                employee.active === false
                                  ? "Activate employee"
                                  : "Deactivate employee"
                              }
                              onClick={() =>
                                updateUser(employee.id, {
                                  active: employee.active === false,
                                })
                              }
                              className={ACTION}
                            >
                              {employee.active === false ? (
                                <UserCheck className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              aria-label={`Edit ${employee.name}`}
                              title="Edit employee"
                              onClick={() => setEditing(employee)}
                              className={ACTION}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${employee.name}`}
                              title="Delete employee"
                              onClick={() => setDeleting(employee)}
                              className={ACTION}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            ),
          )
        )}
      </div>

      <Modal
        open={editing !== undefined}
        onClose={closeForm}
        title={editing ? "Edit employee" : "Add employee"}
        description={
          editing
            ? "Update this employee’s business, department access or sign-in details."
            : "Choose a business and assign only the departments this employee should access."
        }
      >
        <UserForm
          role={ROLES.EMPLOYEE}
          businesses={businesses}
          departments={departments}
          initial={editing}
          isUsernameTaken={isUsernameTaken}
          onSubmit={submitForm}
          onCancel={closeForm}
          submitLabel={editing ? "Save changes" : "Create employee"}
        />
      </Modal>

      <ConfirmDelete
        open={Boolean(deleting)}
        title="Delete employee"
        description={`This permanently removes ${deleting?.name || "this employee"}'s account.`}
        details={
          deleting && (
            <span>
              The employee will no longer be able to sign in. Leads remain in
              their departments. You can deactivate instead if you want to
              retain their account.
            </span>
          )
        }
        confirmLabel="Delete employee"
        onConfirm={() => {
          deleteUser(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
