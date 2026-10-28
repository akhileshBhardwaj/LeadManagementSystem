import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Pencil, Plus, Power, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/org/StatusBadge";
import ManageTable from "../../components/org/ManageTable";
import BusinessForm from "../../components/org/BusinessForm";
import ConfirmDelete from "../../components/org/ConfirmDelete";
import { useLeads } from "../../context/LeadContext";
import { useOrg } from "../../context/OrgContext";
import { ROLES } from "../../data/constants";

const COLUMNS = [
  { label: "Business" },
  { label: "Departments" },
  { label: "Admins" },
  { label: "Status" },
  { label: "Actions", align: "right" },
];

const ACTION =
  "rounded-lg p-2 text-text-muted transition-colors focus:outline-none focus-visible:ring-2";

export default function Businesses() {
  const {
    businesses,
    users,
    getDepartmentsByBusiness,
    addBusiness,
    updateBusiness,
    deleteBusiness,
  } = useOrg();
  const { deleteLeadsByBusiness } = useLeads();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);

  const term = query.trim().toLowerCase();
  const visible = businesses.filter((business) =>
    [business.name, business.description].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(term),
    ),
  );

  const closeForm = () => setEditing(undefined);

  const submitForm = (values) => {
    if (editing) updateBusiness(editing.id, values);
    else addBusiness(values);
    closeForm();
  };

  const confirmDelete = () => {
    deleteLeadsByBusiness(deleting.id);
    deleteBusiness(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Businesses"
        description="Create and manage every business on the platform."
        actions={
          <Button onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" />
            Add business
          </Button>
        }
      />

      <ManageTable
        query={query}
        onQueryChange={setQuery}
        placeholder="Search businesses"
        columns={COLUMNS}
        isEmpty={visible.length === 0}
        empty={
          <EmptyState
            icon={Building2}
            title={businesses.length === 0 ? "No businesses yet" : "No matches"}
            description={
              businesses.length === 0
                ? "Add your first business, then create departments from its business admin account."
                : "Try a different search term."
            }
          />
        }
      >
        {visible.map((business) => {
          const departmentCount = getDepartmentsByBusiness(business.id).length;
          const adminCount = users.filter(
            (user) =>
              user.role === ROLES.BUSINESS_ADMIN &&
              user.businessId === business.id,
          ).length;

          return (
            <tr key={business.id} className="data-row">
              <td className="px-4 py-3">
                <Link
                  to={`/admin/businesses/${business.id}`}
                  className="font-medium text-text-strong hover:text-on-hover"
                >
                  {business.name}
                </Link>
                <p className="max-w-md truncate text-xs text-text-muted">
                  {business.description || "No description"}
                </p>
              </td>
              <td className="px-4 py-3 tabular-nums text-on-surface">
                {departmentCount}
              </td>
              <td className="px-4 py-3 tabular-nums text-on-surface">
                {adminCount}
              </td>
              <td className="px-4 py-3">
                <StatusBadge active={business.active !== false} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    as={Link}
                    to={`/admin/businesses/${business.id}`}
                  >
                    Open
                  </Button>
                  <button
                    type="button"
                    aria-label={`${business.active === false ? "Activate" : "Deactivate"} ${business.name}`}
                    onClick={() =>
                      updateBusiness(business.id, {
                        active: business.active === false,
                      })
                    }
                    className={`${ACTION} hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring`}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Edit ${business.name}`}
                    onClick={() => setEditing(business)}
                    className={`${ACTION} hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${business.name}`}
                    onClick={() => setDeleting(business)}
                    className={`${ACTION} hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </ManageTable>

      <Modal
        open={editing !== undefined}
        onClose={closeForm}
        title={editing ? "Edit business" : "Add business"}
        description={
          editing
            ? `Update the details of ${editing.name}.`
            : "Create departments from the business admin account after setup."
        }
      >
        <BusinessForm
          initial={editing}
          onSubmit={submitForm}
          onCancel={closeForm}
          submitLabel={editing ? "Save changes" : "Create business"}
        />
      </Modal>

      <ConfirmDelete
        open={Boolean(deleting)}
        title="Delete business"
        description={`This permanently removes ${deleting?.name || "this business"} and everything inside it.`}
        details={
          deleting && (
            <span>
              {getDepartmentsByBusiness(deleting.id).length} departments, all of
              their leads and all non-super-admin users of this business will be
              deleted. This cannot be undone.
            </span>
          )
        }
        confirmLabel="Delete business"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
