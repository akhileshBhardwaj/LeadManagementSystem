import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CalendarClock,
  ChevronDown,
  LayoutDashboard,
  Users,
} from "lucide-react";
import SidebarLink from "./SidebarLink";
import { cx } from "../../utils/format";

const PATHS = { leads: "leads", followups: "followups" };

export default function SidebarGroup({ department, dueCount = 0, onClose }) {
  const location = useLocation();
  const base = `/d/${department.id}`;
  const isCurrentArea =
    location.pathname === base || location.pathname.startsWith(`${base}/`);

  const [openOverride, setOpenOverride] = useState(null);
  const isOpen = openOverride !== null ? openOverride : isCurrentArea;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpenOverride(!isOpen)}
        aria-expanded={isOpen}
        className={cx(
          "flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring",
          isCurrentArea
            ? "sidebar-link-active font-semibold"
            : "sidebar-link-idle hover:bg-hover-bg hover:text-on-hover",
        )}
      >
        <span className="min-w-0 truncate">{department.name}</span>
        <span className="flex shrink-0 items-center gap-2">
          {dueCount > 0 && (
            <span
              title={`${dueCount} follow-ups due in ${department.name}`}
              className="rounded-full bg-danger px-2 py-0.5 text-[11px] font-semibold text-on-danger ring-1 ring-inset ring-primary-ring"
            >
              {dueCount}
            </span>
          )}
          <ChevronDown
            className={cx(
              "h-4 w-4 text-text-muted transition-transform duration-200",
              isOpen ? "rotate-180 text-sidebar-text-strong" : "",
            )}
          />
        </span>
      </button>

      {isOpen && (
        <div className="ml-4 space-y-1 border-l border-border pl-3 pt-1">
          <SidebarLink
            to={base}
            end
            tone="child"
            icon={LayoutDashboard}
            label="Dashboard"
            onClose={onClose}
          />
          <SidebarLink
            to={`${base}/${PATHS.leads}`}
            tone="child"
            icon={Users}
            label="Leads"
            onClose={onClose}
          />
          <SidebarLink
            to={`${base}/${PATHS.followups}`}
            tone="child"
            icon={CalendarClock}
            label="Follow-ups"
            badge={dueCount}
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
}
