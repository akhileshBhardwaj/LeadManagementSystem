import { useState } from "react";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Field";
import { isPastDate, todayISO } from "../../utils/date";

const EMPTY = {
  spokenWith: "",
  note: "",
  nextDate: "",
  time: "",
  person: "",
  mobile: "",
  location: "",
};

function Section({ title, hint, children }) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-strong">{title}</h3>
        {hint && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export default function PostponeForm({
  initial = null,
  lead = null,
  onSubmit,
  onCancel,
  submitLabel = "Save follow-up",
}) {
  const [values, setValues] = useState(() => {
    const base = { ...EMPTY, ...(initial || {}) };
    if (!base.mobile && lead?.phone) {
      base.mobile = lead.phone;
    }
    return base;
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next = {};
    if (!values.spokenWith.trim()) next.spokenWith = "Enter who spoke with you";
    if (!values.nextDate) next.nextDate = "Next follow-up date is required";
    else if (isPastDate(values.nextDate))
      next.nextDate = "Date cannot be in the past";
    if (!values.time) next.time = "Time is required";
    if (!values.person.trim()) next.person = "Person is required";
    if (values.mobile && !/^\d{10}$/.test(values.mobile.trim()))
      next.mobile = "Mobile number must be 10 digits";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      spokenWith: values.spokenWith.trim(),
      note: values.note.trim(),
      nextDate: values.nextDate,
      time: values.time,
      person: values.person.trim(),
      mobile: values.mobile.trim(),
      location: values.location.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Section
        title="This conversation"
        hint="Who talked to you this time and what they said."
      >
        <Input
          label="Who spoke with you"
          value={values.spokenWith}
          onChange={setField("spokenWith")}
          error={errors.spokenWith}
          placeholder="e.g. Candidate or Decision Maker"
          required
        />
        <Textarea
          label="Reason / Note"
          value={values.note}
          onChange={setField("note")}
          placeholder="Why was it postponed? e.g. Will confirm after client discussion"
        />
      </Section>

      <Section
        title="Next follow-up"
        hint="When and with whom you will talk next."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Next follow-up date"
            type="date"
            min={todayISO()}
            value={values.nextDate}
            onChange={setField("nextDate")}
            error={errors.nextDate}
            required
          />
          <Input
            label="Time"
            type="time"
            value={values.time}
            onChange={setField("time")}
            error={errors.time}
            required
          />
          <Input
            label="Person to talk to"
            value={values.person}
            onChange={setField("person")}
            error={errors.person}
            placeholder="e.g. Contact person or Manager"
            required
          />
          <div>
            <Input
              label="Mobile no"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={values.mobile}
              onChange={setField("mobile")}
              error={errors.mobile}
              placeholder="10 digit number"
            />
            {lead?.phone2 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-text-muted">Switch to:</span>
                <button
                  type="button"
                  onClick={() =>
                    setValues((prev) => ({ ...prev, mobile: lead.phone }))
                  }
                  className="rounded bg-surface-muted px-1.5 py-0.5 text-primary hover:bg-hover-bg hover:text-on-hover font-medium"
                >
                  Phone 1 ({lead.phone})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValues((prev) => ({ ...prev, mobile: lead.phone2 }))
                  }
                  className="rounded bg-surface-muted px-1.5 py-0.5 text-primary hover:bg-hover-bg hover:text-on-hover font-medium"
                >
                  Phone 2 ({lead.phone2})
                </button>
              </div>
            )}
          </div>
        </div>
        <Input
          label="Location"
          value={values.location}
          onChange={setField("location")}
          placeholder="Area, city"
        />
      </Section>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
