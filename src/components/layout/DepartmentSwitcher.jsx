import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Check, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useOutsideClick from "../../hooks/useOutsideClick";
import { cx } from "../../utils/format";

export default function DepartmentSwitcher() {
  const { accessibleDepartments, activeDepartment, setActiveDepartment } =
    useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  useOutsideClick(ref, () => setOpen(false), open);

  // Only useful when the user actually has more than one department.
  if (accessibleDepartments.length < 2) return null;

  const pick = (departmentId) => {
    setActiveDepartment(departmentId);
    setOpen(false);
    navigate(`/d/${departmentId}`);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch department"
        className="flex h-10 max-w-32 items-center sm:max-w-44 gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-on-surface transition-colors hover:bg-hover-bg hover:text-on-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring"
      >
        <Building2 className="h-4 w-4 shrink-0 text-text-muted" />
        <span className="truncate">
          {activeDepartment?.name || "Select department"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-12 z-40 max-h-72 w-56 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-xl"
        >
          {accessibleDepartments.map((department) => (
            <li key={department.id}>
              <button
                type="button"
                role="option"
                aria-selected={department.id === activeDepartment?.id}
                onClick={() => pick(department.id)}
                className={cx(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  department.id === activeDepartment?.id
                    ? "bg-primary-soft font-semibold text-primary"
                    : "text-on-surface hover:bg-hover-bg hover:text-on-hover",
                )}
              >
                <span className="min-w-0 flex-1 truncate">
                  {department.name}
                </span>
                {department.id === activeDepartment?.id && (
                  <Check className="h-4 w-4 shrink-0" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
