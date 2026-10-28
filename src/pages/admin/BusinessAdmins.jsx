import { useState } from "react";
import {
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/org/StatusBadge";
import ManageTable from "../../components/org/ManageTable";
import UserForm from "../../components/org/UserForm";
import ConfirmDelete from "../../components/org/ConfirmDelete";
import { useOrg } from "../../context/OrgContext";
import { ROLES } from "../../data/constants";

const COLUMNS = [
  { label: "Admin" },
  { label: "Business" },
  { label: "Status" },
  { label: "Actions", align: "right" },
];

const ACTION =
  "rounded-lg p-2 text-text-muted transition-colors focus:outline-none focus-visible:ring-2";

export default function BusinessAdmins() {
  const {
    businesses,
    users,
    getBusiness,
    isUsernameTaken,
    addUser,
    updateUser,
    deleteUser,
  } = useOrg();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);

  const admins = users.filter((user) => user.role === ROLES.BUSINESS_ADMIN);
  const term = query.trim().toLowerCase();
  const visible = admins.filter((admin) => {
    const business = getBusiness(admin.businessId);
    return [admin.name, admin.username, business?.name].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(term),
    );
  });

  const closeForm = () => setEditing(undefined);

  const submitForm = (values) => {
    if (editing) updateUser(editing.id, values);
    else addUser({ ...values, role: ROLES.BUSINESS_ADMIN });
    closeForm();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business admins"
        description="Accounts that manage a single business and its departments."
        actions={
          <Button
            onClick={() => setEditing(null)}
            disabled={businesses.length === 0}
          >
            <Plus className="h-4 w-4" />
            Add business admin
          </Button>
        }
      />

      <ManageTable
        query={query}
        onQueryChange={setQuery}
        placeholder="Search admins"
        columns={COLUMNS}
        isEmpty={visible.length === 0}
        empty={
          <EmptyState
            icon={ShieldCheck}
            title={
              admins.length === 0 ? "No business admins yet" : "No matches"
            }
            description={
              admins.length === 0
                ? "Create a business first, then add an admin for it."
                : "Try a different search term."
            }
          />
        }
      >
        {visible.map((admin) => (
          <tr key={admin.id} className="data-row">
            <td className="px-4 py-3">
              <p className="font-medium text-text-strong">{admin.name}</p>
              <p className="text-xs text-text-muted">@{admin.username}</p>
            </td>
            <td className="px-4 py-3 text-on-surface">
              {getBusiness(admin.businessId)?.name || "—"}
            </td>
            <td className="px-4 py-3">
              <StatusBadge active={admin.active !== false} />
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  aria-label={`${admin.active === false ? "Activate" : "Deactivate"} ${admin.name}`}
                  onClick={() =>
                    updateUser(admin.id, { active: admin.active === false })
                  }
                  className={`${ACTION} hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring`}
                >
                  {admin.active === false ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <UserX className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label={`Edit ${admin.name}`}
                  onClick={() => setEditing(admin)}
                  className={`${ACTION} hover:bg-hover-bg hover:text-on-hover focus-visible:ring-primary-ring`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${admin.name}`}
                  onClick={() => setDeleting(admin)}
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
        title={editing ? "Edit business admin" : "Add business admin"}
        description={
          editing
            ? `Update the account for ${editing.name}.`
            : "This account will only ever see the business you pick here."
        }
      >
        <UserForm
          role={ROLES.BUSINESS_ADMIN}
          businesses={businesses}
          initial={editing}
          isUsernameTaken={isUsernameTaken}
          onSubmit={submitForm}
          onCancel={closeForm}
          submitLabel={editing ? "Save changes" : "Create admin"}
        />
      </Modal>

      <ConfirmDelete
        open={Boolean(deleting)}
        title="Delete business admin"
        description={`This permanently removes the account of ${deleting?.name || "this admin"}.`}
        confirmLabel="Delete admin"
        onConfirm={() => {
          deleteUser(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
