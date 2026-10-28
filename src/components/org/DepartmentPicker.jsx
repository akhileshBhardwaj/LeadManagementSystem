export default function DepartmentPicker({
  departments = [],
  value = [],
  onChange,
  error,
}) {
  const toggle = (departmentId) => {
    onChange(
      value.includes(departmentId)
        ? value.filter((item) => item !== departmentId)
        : [...value, departmentId],
    );
  };

  return (
    <div className="space-y-1.5">
      <p className="block text-sm font-medium text-on-surface">
        Department access (optional)
      </p>

      {departments.length === 0 ? (
        <p className="rounded-xl bg-page px-3 py-2 text-xs text-text-muted">
          No departments exist yet. Create one from Settings → Departments, then
          edit this employee to grant access.
        </p>
      ) : (
        <div className="grid max-h-52 gap-2 overflow-y-auto rounded-xl border border-border p-3 sm:grid-cols-2">
          {departments.map((department) => (
            <label
              key={department.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-on-surface"
            >
              <input
                type="checkbox"
                checked={value.includes(department.id)}
                onChange={() => toggle(department.id)}
                className="h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary-ring"
              />
              <span className="truncate">{department.name}</span>
            </label>
          ))}
        </div>
      )}

      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
