import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Download, Plus, Trash2, Users } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import LeadTable from "../components/leads/LeadTable";
import LeadForm from "../components/leads/LeadForm";
import LeadFilters from "../components/leads/LeadFilters";
import ImportLeads from "../components/leads/ImportLeads";
import ResponseModal from "../components/leads/ResponseModal";
import { STATUS_META, STATUS_OPTIONS } from "../data/constants";
import { useLeads } from "../context/LeadContext";
import { useOrg } from "../context/OrgContext";
import { countByStatus } from "../utils/response";
import { downloadLeads } from "../utils/excel";
import { cx } from "../utils/format";

const ADD_MODES = [
  { key: "single", label: "Single lead" },
  { key: "excel", label: "Import from Excel" },
];

export default function Leads() {
  const { departmentId } = useParams();
  const { getDepartment } = useOrg();
  const { getLeadsByDepartment, addLead, updateLead, deleteLead } = useLeads();

  const department = getDepartment(departmentId);
  const leads = getLeadsByDepartment(departmentId);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState(undefined);
  const [addMode, setAddMode] = useState("single");
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const setQuery = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const counts = countByStatus(leads);
  const term = query.trim().toLowerCase();
  const visible = leads.filter((lead) => {
    const haystack = [
      lead.name,
      lead.phone,
      lead.phone2,
      lead.course,
      lead.location,
    ];
    const matches =
      !term ||
      haystack.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term),
      );
    return matches && (status === "all" || lead.status === status);
  });

  const tabs = [
    { key: "all", label: "All leads", count: counts.total },
    ...STATUS_OPTIONS.map((key) => ({
      key,
      label: STATUS_META[key].label,
      count: counts[key],
    })),
  ];

  const openAdd = () => {
    setAddMode("single");
    setEditing(null);
  };
  const closeForm = () => setEditing(undefined);

  const submitForm = (values, initialResponse) => {
    if (editing) updateLead(editing.id, values, initialResponse);
    else addLead(departmentId, values, initialResponse);
    closeForm();
  };

  const isAdding = editing === null;
  const showExcel = isAdding && addMode === "excel";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={`${counts.total} leads in ${department?.name || "this department"}`}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                downloadLeads(
                  visible,
                  `${department?.name || "department"}-leads`,
                )
              }
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add lead
            </Button>
          </>
        }
      />

      <Card padding="none">
        <LeadFilters
          query={query}
          onQueryChange={setQuery}
          tabs={tabs}
          active={status}
          onSelect={setStatus}
        />

        {visible.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No leads found"
            description="Try another search term, change the status filter, or add a new lead."
          />
        ) : (
          <LeadTable
            leads={visible}
            onOpen={(id) => navigate(`/d/${departmentId}/leads/${id}`)}
            onEdit={setEditing}
            onDelete={setDeleting}
            onViewResponses={setViewing}
          />
        )}
      </Card>

      <Modal
        open={editing !== undefined}
        onClose={closeForm}
        size={showExcel ? "lg" : undefined}
        title={editing ? "Edit lead" : "Add lead"}
        description={
          showExcel
            ? "Upload an Excel or CSV file to import multiple leads into this department."
            : "Basic details and requirements for this lead."
        }
      >
        {isAdding && (
          <div className="mb-4 inline-flex rounded-xl bg-surface-muted p-1 text-sm font-medium">
            {ADD_MODES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setAddMode(key)}
                className={cx(
                  "rounded-lg px-3 py-1.5 transition-colors",
                  addMode === key ? "segmented-active" : "segmented-idle",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {showExcel ? (
          <ImportLeads departmentId={departmentId} onDone={closeForm} />
        ) : (
          <LeadForm
            initial={editing}
            onSubmit={submitForm}
            onCancel={closeForm}
            submitLabel={editing ? "Save changes" : "Add lead"}
          />
        )}
      </Modal>

      <ResponseModal
        open={Boolean(viewing)}
        lead={viewing}
        onClose={() => setViewing(null)}
      />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        size="sm"
        title="Delete lead"
        description={`This will permanently remove ${deleting?.name || "this lead"} and its response history.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteLead(deleting.id);
              setDeleting(null);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
