import { useState } from "react";
import { Pencil, Plus, Power, Trash2, Users } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/org/StatusBadge";
import ManageTable from "../../components/org/ManageTable";
import UserForm from "../../components/org/UserForm";
import ConfirmDelete from "../../components/org/ConfirmDelete";
import { useAuth } from "../../context/AuthContext";
import { useOrg } from "../../context/OrgContext";
import { ROLES } from "../../data/constants";

const COLUMNS = [
  { label: "Employee" },
  { label: "Departments" },
  { label: "Status" },
  { label: "Actions", align: "right" },
];

const ACTION =
  "rounded-lg p-2 text-text-muted transition-colors focus:outline-none focus-visible:ring-2";

export default function Employees() {
  const { currentUser } = useAuth();
  const {
    users,
    getDepartment,
    getDepartmentsByBusiness,
    addUser,
    updateUser,
    deleteUser,
    isUsernameTaken,
  } = useOrg();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);

  const businessId = currentUser?.businessId;
  const departments = getDepartmentsByBusiness(businessId);
  const employees = users.filter(
    (user) => user.role === ROLES.EMPLOYEE && user.businessId === businessId,
  );

  const term = query.trim().toLowerCase();
  const visible = employees.filter((employee) =>
    [employee.name, employee.username].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(term),
    ),
  );

  const departmentNames = (employee) =>
    (employee.departmentIds || [])
      .map((id) => getDepartment(id)?.name)
      .filter(Boolean);

  const closeForm = () => setEditing(undefined);

  const submitForm = (values) => {
    if (editing) updateUser(editing.id, values);
    else addUser({ ...values, businessId });
    closeForm();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Create employee accounts, then choose which departments each person can access."
        actions={
          <Button onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" />
            Add employee
          </Button>
        }
      />

      <ManageTable
        query={query}
        onQueryChange={setQuery}
        placeholder="Search employees"
        columns={COLUMNS}
        isEmpty={visible.length === 0}
        empty={
          <EmptyState
            icon={Users}
            title={employees.length === 0 ? "No employees yet" : "No matches"}
            description={
              employees.length === 0
                ? "Add an employee now. You can assign department access when departments are ready."
                : "Try a different search term."
            }
          />
        }
      >
        {visible.map((employee) => (
          <tr key={employee.id} className="data-row">
            <td className="px-4 py-3">
              <p className="font-medium text-text-strong">{employee.name}</p>
              <p className="text-xs text-text-muted">@{employee.username}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {departmentNames(employee).length === 0 ? (
                  <span className="text-xs text-text-muted">No department</span>
                ) : (
                  departmentNames(employee).map((name) => (
                    <span
                      key={name}
                      className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-on-surface"
                    >
                      {name}
                    </span>
                  ))
                )}
              </div>
            </td>
            <td className="px-4 py-3">
              <StatusBadge active={employee.active !== false} />
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  aria-label={`${employee.active === false ? "Activate" : "Deactivate"} ${employee.name}`}
                  onClick={() =>
                    updateUser(employee.id, {
                      active: employee.active === false,
                    })
                  }
                  className={`${ACTION} hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring`}
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Edit ${employee.name}`}
                  onClick={() => setEditing(employee)}
                  className={`${ACTION} hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${employee.name}`}
                  onClick={() => setDeleting(employee)}
                  className={`${ACTION} hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </ManageTable>

      <Modal
        open={editing !== undefined}
        onClose={closeForm}
        title={editing ? "Edit employee" : "Add employee"}
        description={
          editing
            ? "Change the assigned departments, reset the password or update the name."
            : "Department access is optional here. Employees only see departments assigned to their account."
        }
      >
        <UserForm
          role={ROLES.EMPLOYEE}
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
              The account is deleted immediately and can no longer sign in.
              Leads stay in their departments. Consider deactivating instead.
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
