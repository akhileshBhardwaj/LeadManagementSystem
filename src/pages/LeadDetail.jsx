import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CalendarPlus, Phone } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import PostponeForm from "../components/leads/PostponeForm";
import StatusChanger from "../components/leads/StatusChanger";
import ResponseSummary from "../components/leads/ResponseSummary";
import ResponseHistory from "../components/leads/ResponseHistory";
import LeadInfoPanel from "../components/leads/LeadInfoPanel";
import { LEAD_CONFIG, STATUS_META } from "../data/constants";
import { getFollowup, getPostponeDefaults } from "../utils/response";
import { useLeads } from "../context/LeadContext";
import { useOrg } from "../context/OrgContext";

export default function LeadDetail() {
  const { departmentId, leadId } = useParams();
  const { getDepartment } = useOrg();
  const { getLead, postponeLead, updateResponse } = useLeads();

  const [postponeOpen, setPostponeOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState(null);

  const department = getDepartment(departmentId);
  const lead = getLead(leadId);

  if (!lead) {
    return (
      <Card className="space-y-4 text-center">
        <p className="text-lg font-semibold text-text-strong">Lead not found</p>
        <p className="text-sm text-text-muted">
          This lead does not exist in this department or may have been deleted.
        </p>
        <Button
          as={Link}
          to={`/d/${departmentId}/leads`}
          variant="secondary"
          className="mx-auto"
        >
          Back to leads
        </Button>
      </Card>
    );
  }

  const status = STATUS_META[lead.status] || STATUS_META.active;
  const needsFollowupDate = lead.status === "postponed" && !getFollowup(lead);

  const openPostpone = (entry = null) => {
    setEditingResponse(entry);
    setPostponeOpen(true);
  };
  const closePostpone = () => {
    setPostponeOpen(false);
    setEditingResponse(null);
  };
  const submitPostpone = (values) => {
    if (editingResponse) updateResponse(lead.id, editingResponse.id, values);
    else postponeLead(lead.id, values);
    closePostpone();
  };

  return (
    <div className="space-y-4">
      <Button
        as={Link}
        to={`/d/${departmentId}/leads`}
        variant="ghost"
        size="sm"
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        All leads
      </Button>

      {needsFollowupDate && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-warning-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            This lead is postponed but has no follow-up date, so it will not
            show in Follow-ups.
          </p>
          <Button size="sm" className="shrink-0" onClick={() => openPostpone()}>
            <CalendarPlus className="h-4 w-4" />
            Set follow-up date
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar name={lead.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-text-strong">
                  {lead.name}
                </h1>
                <Badge tone={status.tone}>{status.label}</Badge>
                {department && <Badge tone="indigo">{department.name}</Badge>}
              </div>
              <p className="mt-1 text-sm text-text-muted">
                {LEAD_CONFIG.itemLabel}:{" "}
                <span className="font-medium text-text-strong">
                  {lead.course || "Not specified"}
                </span>
              </p>

              {/* Both phone numbers with direct tel: links */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm tabular-nums text-on-surface">
                <Phone className="h-3.5 w-3.5 text-text-muted" />
                <a
                  href={`tel:${lead.phone}`}
                  className="font-medium text-primary hover:text-on-hover hover:underline"
                  title="Call Phone 1"
                >
                  {lead.phone}
                </a>
                <span className="text-text-muted">·</span>
                {lead.phone2 ? (
                  <a
                    href={`tel:${lead.phone2}`}
                    className="font-medium text-primary hover:text-on-hover hover:underline"
                    title="Call Phone 2"
                  >
                    {lead.phone2}
                  </a>
                ) : (
                  <span className="text-text-muted">-</span>
                )}
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-text-strong">
              Update status
            </h2>
            <StatusChanger
              lead={lead}
              onPostpone={() => openPostpone()}
              onEditDetails={(entry) => openPostpone(entry)}
            />
          </Card>

          <Card className="space-y-5">
            <h2 className="text-sm font-semibold text-text-strong">
              Response history
            </h2>
            <ResponseSummary lead={lead} />
            <ResponseHistory lead={lead} />
          </Card>
        </div>

        <LeadInfoPanel lead={lead} onPostpone={() => openPostpone()} />
      </div>

      <Modal
        open={postponeOpen}
        onClose={closePostpone}
        title={editingResponse ? "Edit follow-up" : "Postpone follow-up"}
        description={`${lead.name} will be scheduled for a follow-up on the date you choose.`}
      >
        <PostponeForm
          initial={editingResponse || getPostponeDefaults(lead)}
          lead={lead}
          submitLabel={
            editingResponse ? "Save changes" : "Postpone and remind me"
          }
          onCancel={closePostpone}
          onSubmit={submitPostpone}
        />
      </Modal>
    </div>
  );
}
