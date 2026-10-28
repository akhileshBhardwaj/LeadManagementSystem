import { Input, Textarea } from "../ui/Field";
import { todayISO } from "../../utils/date";

export default function LeadFollowFields({
  values,
  errors,
  onChange,
  primaryPhone = "",
  secondaryPhone = "",
}) {
  return (
    <div className="animate-fade-in space-y-4 rounded-2xl bg-warning-soft p-4 ring-1 ring-inset ring-primary-ring">
      <div>
        <h3 className="text-sm font-semibold text-warning">
          Follow-up details
        </h3>
        <p className="text-xs text-warning">
          This lead will appear on the Follow-ups page on the chosen date.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Next follow-up date"
          type="date"
          min={todayISO()}
          value={values.nextDate}
          onChange={onChange("nextDate")}
          error={errors.nextDate}
          required
        />
        <Input
          label="Time"
          type="time"
          value={values.time}
          onChange={onChange("time")}
          error={errors.time}
          required
        />
        <Input
          label="Person to talk to"
          value={values.person}
          onChange={onChange("person")}
          error={errors.person}
          placeholder="e.g. Rahul or Manager"
          required
        />
        <div>
          <Input
            label="Mobile no"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={values.mobile}
            onChange={onChange("mobile")}
            error={errors.mobile}
            placeholder="10 digit number"
          />
          {secondaryPhone && (
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              <span className="text-text-muted">Quick set:</span>
              <button
                type="button"
                onClick={() =>
                  onChange("mobile")({ target: { value: primaryPhone } })
                }
                className="text-primary hover:text-on-hover hover:underline font-medium"
              >
                Phone 1
              </button>
              <span className="text-text-muted">|</span>
              <button
                type="button"
                onClick={() =>
                  onChange("mobile")({ target: { value: secondaryPhone } })
                }
                className="text-primary hover:text-on-hover hover:underline font-medium"
              >
                Phone 2 ({secondaryPhone})
              </button>
            </div>
          )}
        </div>
        <Input
          label="Location"
          value={values.location}
          onChange={onChange("location")}
          placeholder="Area, city"
          className="sm:col-span-2"
        />
      </div>

      <Textarea
        label="Note"
        rows={2}
        value={values.note}
        onChange={onChange("note")}
        placeholder="Optional note about this follow-up"
      />
    </div>
  );
}
