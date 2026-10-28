import { useState } from "react";
import Button from "../ui/Button";
import { Input, Select } from "../ui/Field";
import DepartmentPicker from "./DepartmentPicker";

export default function UserForm({
  role,
  businesses = null,
  departments = null,
  initial = null,
  isUsernameTaken,
  onSubmit,
  onCancel,
  submitLabel = "Save user",
}) {
  const isEdit = Boolean(initial);
  const [values, setValues] = useState({
    name: initial?.name || "",
    username: initial?.username || "",
    password: "",
    businessId: initial?.businessId || businesses?.[0]?.id || "",
    departmentIds: initial?.departmentIds || [],
  });
  const [errors, setErrors] = useState({});
  const availableDepartments = businesses
    ? departments?.filter(
        (department) => department.businessId === values.businessId,
      )
    : departments;

  const setField = (key) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const name = values.name.trim();
    const username = values.username.trim();
    const next = {};

    if (!name) next.name = "Name is required";
    if (!username) next.username = "Username is required";
    else if (isUsernameTaken?.(username, initial?.id)) {
      next.username =
        "This username is already used by an account in another business or role";
    }
    if (!isEdit && !values.password) next.password = "Password is required";
    else if (isEdit && values.password && values.password.length < 4) {
      next.password = "Password must be at least 4 characters";
    }
    if (businesses && !values.businessId) next.businessId = "Select a business";
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      name,
      username,
      role,
      departmentIds: values.departmentIds,
    };
    if (values.password) payload.password = values.password;
    if (businesses) payload.businessId = values.businessId;
    try {
      onSubmit(payload);
    } catch (error) {
      setErrors({
        form:
          error?.message || "Could not save this account. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {errors.form && (
        <p
          role="alert"
          className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {errors.form}
        </p>
      )}
      <Input
        label="Full name"
        value={values.name}
        onChange={setField("name")}
        error={errors.name}
        placeholder="e.g. Riya Verma"
        required
      />
      <Input
        label="Username"
        value={values.username}
        onChange={setField("username")}
        error={errors.username}
        placeholder="e.g. riya.verma"
        hint="Usernames must be unique across all businesses."
        autoComplete="off"
        required
      />
      <Input
        label={isEdit ? "Reset password" : "Password"}
        type="text"
        value={values.password}
        onChange={setField("password")}
        error={errors.password}
        hint={isEdit ? "Leave blank to keep the current password." : undefined}
        placeholder={isEdit ? "New password (optional)" : "Set a password"}
        required={!isEdit}
      />

      {businesses && (
        <Select
          label="Business"
          value={values.businessId}
          onChange={(event) => {
            const businessId = event.target.value;
            setValues((prev) => ({
              ...prev,
              businessId,
              departmentIds: prev.departmentIds.filter((id) =>
                departments?.some(
                  (department) =>
                    department.id === id &&
                    department.businessId === businessId,
                ),
              ),
            }));
          }}
          error={errors.businessId}
          required
        >
          <option value="">Select a business</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </Select>
      )}

      {departments && (
        <DepartmentPicker
          departments={availableDepartments}
          value={values.departmentIds}
          onChange={(departmentIds) =>
            setValues((prev) => ({ ...prev, departmentIds }))
          }
          error={errors.departmentIds}
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
