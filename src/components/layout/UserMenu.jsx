import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Badge from "../ui/Badge";
import { useAuth } from "../../context/AuthContext";
import useOutsideClick from "../../hooks/useOutsideClick";
import { ROLE_META, ROLES } from "../../data/constants";

export default function UserMenu() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  useOutsideClick(ref, () => setOpen(false), open);

  const meta = ROLE_META[currentUser?.role] || ROLE_META[ROLES.EMPLOYEE];

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        className="flex items-center gap-2 rounded-xl p-1.5 text-sm font-medium text-on-surface hover:bg-hover-bg hover:text-on-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary">
          {currentUser?.name
            ? currentUser.name.slice(0, 2).toUpperCase()
            : "??"}
        </span>
        <span className="hidden max-w-32 truncate text-xs font-medium text-text-strong sm:inline-block">
          {currentUser?.name || "User"}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-40 w-60 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
        >
          <div className="border-b border-border px-3 py-3">
            <p className="truncate text-sm font-semibold text-text-strong">
              {currentUser?.name}
            </p>
            <p className="truncate text-xs text-text-muted">
              @{currentUser?.username}
            </p>
            <span className="mt-2 inline-block">
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-hover-bg hover:text-on-hover"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
