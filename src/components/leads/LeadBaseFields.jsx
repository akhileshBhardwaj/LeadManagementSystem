import { Input } from "../ui/Field";

export default function LeadBaseFields({
  values,
  errors,
  onChange,
  itemLabel = "Position / Service",
  itemPlaceholder = "",
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Contact person"
        value={values.name}
        onChange={onChange("name")}
        error={errors.name}
        placeholder="e.g. Aarav Sharma"
        required
      />
      <Input
        label={itemLabel}
        value={values.course}
        onChange={onChange("course")}
        placeholder={itemPlaceholder || `e.g. ${itemLabel}`}
      />
      <Input
        label="Phone 1 (Primary)"
        type="tel"
        inputMode="numeric"
        maxLength={10}
        value={values.phone}
        onChange={onChange("phone")}
        error={errors.phone}
        placeholder="10 digit primary number"
        required
      />
      <Input
        label="Phone 2 (Alternate, optional)"
        type="tel"
        inputMode="numeric"
        maxLength={10}
        value={values.phone2}
        onChange={onChange("phone2")}
        error={errors.phone2}
        placeholder="10 digit alternate number"
      />
      <Input
        label="Location"
        value={values.location}
        onChange={onChange("location")}
        placeholder="Area, city"
      />
      <Input
        label="Budget minimum (₹)"
        type="number"
        min="0"
        step="1000"
        value={values.budgetMin}
        onChange={onChange("budgetMin")}
        error={errors.budgetMin}
        placeholder="e.g. 100000"
      />
      <Input
        label="Budget maximum (₹)"
        type="number"
        min="0"
        step="1000"
        value={values.budgetMax}
        onChange={onChange("budgetMax")}
        error={errors.budgetMax}
        placeholder="e.g. 150000"
        className="sm:col-span-2"
      />
    </div>
  );
}
