import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Pencil, Plus, Power, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/org/StatusBadge";
import ManageTable from "../../components/org/ManageTable";
import DepartmentForm from "../../components/org/DepartmentForm";
import ConfirmDelete from "../../components/org/ConfirmDelete";
import { useAuth } from "../../context/AuthContext";
import { useOrg } from "../../context/OrgContext";
import { useLeads } from "../../context/LeadContext";
import { ROLES } from "../../data/constants";

const COLUMNS = [
  { label: "Department" },
  { label: "Leads" },
  { label: "Employees" },
  { label: "Status" },
  { label: "Actions", align: "right" },
];

const ACTION =
  "rounded-lg p-2 text-text-muted transition-colors focus:outline-none focus-visible:ring-2";

export default function Departments() {
  const { currentUser } = useAuth();
  const {
    users,
    getDepartmentsByBusiness,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    isDepartmentNameTaken,
  } = useOrg();
  const { getLeadsByDepartment, deleteLeadsByDepartment } = useLeads();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);

  const businessId = currentUser?.businessId;
  const departments = getDepartmentsByBusiness(businessId);

  const term = query.trim().toLowerCase();
  const visible = departments.filter((department) =>
    [department.name, department.description].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(term),
    ),
  );

  const employeesIn = (departmentId) =>
    users.filter(
      (user) =>
        user.role === ROLES.EMPLOYEE &&
        (user.departmentIds || []).includes(departmentId),
    ).length;

  const closeForm = () => setEditing(undefined);

  const submitForm = (values) => {
    if (editing) updateDepartment(editing.id, values);
    else addDepartment(businessId, values);
    closeForm();
  };

  const confirmDelete = () => {
    deleteLeadsByDepartment(deleting.id);
    deleteDepartment(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Every department has its own leads, follow-ups and reminders."
        actions={
          <Button onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" />
            Add department
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
            icon={Building2}
            title={
              departments.length === 0 ? "No departments yet" : "No matches"
            }
            description={
              departments.length === 0
                ? "Create a department to start adding leads."
                : "Try a different search term."
            }
          />
        }
      >
        {visible.map((department) => (
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
              {getLeadsByDepartment(department.id).length}
            </td>
            <td className="px-4 py-3 tabular-nums text-on-surface">
              {employeesIn(department.id)}
            </td>
            <td className="px-4 py-3">
              <StatusBadge active={department.active !== false} />
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  as={Link}
                  to={`/d/${department.id}`}
                >
                  Open
                </Button>
                <button
                  type="button"
                  aria-label={`${department.active === false ? "Activate" : "Deactivate"} ${department.name}`}
                  onClick={() =>
                    updateDepartment(department.id, {
                      active: department.active === false,
                    })
                  }
                  className={`${ACTION} hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring`}
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Edit ${department.name}`}
                  onClick={() => setEditing(department)}
                  className={`${ACTION} hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${department.name}`}
                  onClick={() => setDeleting(department)}
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
        title={editing ? "Edit department" : "Add department"}
        description={
          editing
            ? `Update the details of ${editing.name}.`
            : "Leads, follow-ups and reminders are scoped to each department."
        }
      >
        <DepartmentForm
          initial={editing}
          isNameTaken={isDepartmentNameTaken.bind(null, businessId)}
          onSubmit={submitForm}
          onCancel={closeForm}
          submitLabel={editing ? "Save changes" : "Create department"}
        />
      </Modal>

      <ConfirmDelete
        open={Boolean(deleting)}
        title="Delete department"
        description={`This permanently removes ${deleting?.name || "this department"} and everything inside it.`}
        details={
          deleting && (
            <span>
              {getLeadsByDepartment(deleting.id).length} leads and their
              follow-up history will be deleted. This cannot be undone.
            </span>
          )
        }
        confirmLabel="Delete department"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
