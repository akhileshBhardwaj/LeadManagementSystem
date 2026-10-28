import { useState } from "react";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Field";

export default function DepartmentForm({
  initial = null,
  isNameTaken,
  onSubmit,
  onCancel,
  submitLabel = "Create department",
}) {
  const [values, setValues] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const name = values.name.trim();
    const next = {};
    if (!name) next.name = "Department name is required";
    else if (isNameTaken?.(name, initial?.id)) {
      next.name = "A department with this name already exists in your business";
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ name, description: values.description.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Input
        label="Department name"
        value={values.name}
        onChange={setField("name")}
        error={errors.name}
        placeholder="e.g. Sales"
        required
      />
      <Textarea
        label="Description"
        rows={3}
        value={values.description}
        onChange={setField("description")}
        placeholder="What does this department handle?"
      />

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
