import { useState } from "react";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Field";

export default function BusinessForm({
  initial = null,
  onSubmit,
  onCancel,
  submitLabel = "Create business",
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
    const next = {};
    if (!values.name.trim()) next.name = "Business name is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Input
        label="Business name"
        value={values.name}
        onChange={setField("name")}
        error={errors.name}
        placeholder="e.g. Acme Recruiters"
        required
      />
      <Textarea
        label="Description"
        rows={3}
        value={values.description}
        onChange={setField("description")}
        placeholder="What does this business do?"
      />

      {!initial && (
        <p className="rounded-xl bg-page px-3 py-2 text-xs text-text-muted">
          No department is created automatically. The business admin can add
          departments after setup.
        </p>
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
