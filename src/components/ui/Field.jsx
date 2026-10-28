import { useId } from "react";
import { cx } from "../../utils/format";

const CONTROL =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-strong shadow-sm transition placeholder:text-text-muted hover:border-border focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-ring";
const CONTROL_ERROR =
  "border-border focus:border-danger focus:ring-primary-ring";

export default function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className = "",
  children,
}) {
  return (
    <div className={cx("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-semibold text-on-surface"
        >
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-semibold text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ label, error, hint, id, className = "", ...props }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  return (
    <Field label={label} htmlFor={fieldId} error={error} hint={hint}>
      <input
        id={fieldId}
        aria-invalid={error ? "true" : undefined}
        className={cx(CONTROL, error && CONTROL_ERROR, className)}
        {...props}
      />
    </Field>
  );
}

export function Select({
  label,
  error,
  hint,
  id,
  className = "",
  children,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  return (
    <Field label={label} htmlFor={fieldId} error={error} hint={hint}>
      <select
        id={fieldId}
        aria-invalid={error ? "true" : undefined}
        className={cx(CONTROL, "pr-8", error && CONTROL_ERROR, className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className = "",
  rows = 3,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  return (
    <Field label={label} htmlFor={fieldId} error={error} hint={hint}>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={error ? "true" : undefined}
        className={cx(CONTROL, "resize-y", error && CONTROL_ERROR, className)}
        {...props}
      />
    </Field>
  );
}
