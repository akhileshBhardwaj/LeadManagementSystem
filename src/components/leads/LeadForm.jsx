import { useState } from "react";
import Button from "../ui/Button";
import { Select } from "../ui/Field";
import LeadBaseFields from "./LeadBaseFields";
import LeadFollowFields from "./LeadFollowFields";
import { useFollowFields } from "../../hooks/useFollowFields";
import {
  LEAD_CONFIG,
  REFERENCE_OPTIONS,
  STATUS_META,
  STATUS_OPTIONS,
} from "../../data/constants";

const EMPTY = {
  name: "",
  phone: "",
  phone2: "",
  course: "",
  location: "",
  budgetMin: "",
  budgetMax: "",
  reference: "Google",
  status: STATUS_OPTIONS[0],
};

export default function LeadForm({
  initial = null,
  onSubmit,
  onCancel,
  submitLabel = "Save lead",
}) {
  const [values, setValues] = useState({
    ...EMPTY,
    ...(initial || {}),
  });
  const [errors, setErrors] = useState({});
  const follow = useFollowFields();

  // The inline follow-up section only shows when the status is actually being
  // changed to "postponed" (a lead already postponed keeps its existing entry).
  const willPostpone =
    values.status === "postponed" && initial?.status !== "postponed";

  const setField = (key) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const setStatus = (event) => {
    const status = event.target.value;
    setValues((prev) => ({ ...prev, status }));
    follow.syncForStatus(status, values);
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Name is required";

    // Phone 1 validation (required, exactly 10 digits)
    const p1 = values.phone.trim();
    if (!p1) next.phone = "Phone 1 is required";
    else if (!/^\d{10}$/.test(p1)) next.phone = "Phone 1 must be 10 digits";

    // Phone 2 validation (optional, exactly 10 digits, must be different from Phone 1)
    const p2 = values.phone2?.trim() || "";
    if (p2) {
      if (!/^\d{10}$/.test(p2)) next.phone2 = "Phone 2 must be 10 digits";
      else if (p1 && p2 === p1)
        next.phone2 = "Phone 2 must be different from Phone 1";
    }

    const min = Number(values.budgetMin) || 0;
    const max = Number(values.budgetMax) || 0;
    if (min < 0 || max < 0) next.budgetMin = "Budget cannot be negative";
    else if (max > 0 && max < min)
      next.budgetMax =
        "Maximum budget must be greater than or equal to minimum";
    setErrors(next);
    const baseOk = Object.keys(next).length === 0;
    if (!willPostpone) return baseOk;
    return follow.validate() && baseOk;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(
      {
        name: values.name.trim(),
        phone: values.phone.trim(),
        phone2: values.phone2?.trim() || "",
        course: values.course.trim(),
        location: values.location.trim(),
        budgetMin: Number(values.budgetMin) || 0,
        budgetMax: Number(values.budgetMax) || 0,
        reference: values.reference,
        status: values.status,
      },
      willPostpone ? follow.buildResponse() : null,
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <LeadBaseFields
        values={values}
        errors={errors}
        onChange={setField}
        itemLabel={LEAD_CONFIG.itemLabel}
      />

      <Select
        label="Reference"
        value={values.reference}
        onChange={setField("reference")}
      >
        {REFERENCE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>

      <Select
        label="Status"
        value={values.status}
        onChange={setStatus}
        hint="Choosing Postponed reveals the follow-up details below."
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {STATUS_META[option].label}
          </option>
        ))}
      </Select>

      {willPostpone && (
        <LeadFollowFields
          values={follow.follow}
          errors={follow.errors}
          onChange={follow.setFollowField}
          primaryPhone={values.phone.trim()}
          secondaryPhone={values.phone2?.trim() || ""}
        />
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
