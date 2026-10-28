import Modal from "../ui/Modal";
import ResponseSummary from "./ResponseSummary";
import ResponseHistory from "./ResponseHistory";
import { getInteractionCount } from "../../utils/response";
import { pluralize } from "../../utils/format";

export default function ResponseModal({ open, lead, onClose }) {
  if (!lead) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Responses — ${lead.name}`}
      description={`${pluralize(getInteractionCount(lead), "interaction")} recorded for this lead`}
    >
      <div className="space-y-6">
        <ResponseSummary lead={lead} />
        <ResponseHistory lead={lead} />
      </div>
    </Modal>
  );
}
