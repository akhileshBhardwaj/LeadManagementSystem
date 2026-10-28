import {
  Building2,
  ChartColumn,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  X,
  Sun,
  Moon,
} from "lucide-react";
import SidebarLink from "./SidebarLink";
import SidebarGroup from "./SidebarGroup";
import { useAuth } from "../../context/AuthContext";
import { useLeads } from "../../context/LeadContext";
import { useOrg } from "../../context/OrgContext";
import { ROLES } from "../../data/constants";
import { getFollowups, groupFollowups } from "../../utils/response";
import { cx } from "../../utils/format";
import { useTheme } from "../../context/ThemeContext";

function dueByDepartment(leads) {
  const groups = groupFollowups(getFollowups(leads));
  const due = [...groups.overdue, ...groups.today];
  return due.reduce((acc, item) => {
    const id = item.lead.departmentId;
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
}

export default function Sidebar({ open, onClose }) {
  const { currentUser, accessibleDepartments: departments } = useAuth();
  const { getBusiness } = useOrg();
  const { accessibleLeads } = useLeads();

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const role = currentUser?.role;
  const business = currentUser?.businessId
    ? getBusiness(currentUser.businessId)
    : null;
  const dueCounts = dueByDepartment(accessibleLeads);
  const showDepartmentNavigation =
    role !== ROLES.SUPER_ADMIN && departments.length > 0;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cx(
          "fixed inset-0 z-40 bg-overlay backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-label="Main navigation"
        className={cx(
          "sidebar fixed inset-y-0 left-0 z-40 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col border-r transition-transform duration-200 ease-out lg:w-64 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl sidebar-logo text-on-primary shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold leading-tight text-sidebar-text-strong">
              Lead Manager
              <span className="block text-xs font-normal text-sidebar-text-muted">
                Multi-business CRM
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-1.5 text-sidebar-text-muted hover:bg-hover-bg hover:text-on-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {role === ROLES.EMPLOYEE && business && (
          <div className="mx-3 mt-3 flex items-center gap-3 rounded-2xl border border-border bg-sidebar-hover-bg px-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info text-on-info shadow-md">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              
              <span
                className="block truncate text-sm font-semibold text-sidebar-text-strong"
                title={business.name}
              >
                {business.name}
              </span>
            </span>
          </div>
        )}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4 overscroll-contain">
          {role === ROLES.SUPER_ADMIN && (
            <>
              <SidebarLink
                to="/admin"
                end
                icon={LayoutDashboard}
                label="Dashboard"
                onClose={onClose}
              />
              <div className="pt-3 pb-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-text-muted">
                  Settings
                </p>
              </div>
              <SidebarLink
                to="/admin/businesses"
                icon={Building2}
                label="Businesses"
                onClose={onClose}
              />
              <SidebarLink
                to="/admin/users"
                icon={ShieldCheck}
                label="Business Admins"
                onClose={onClose}
              />
              <SidebarLink
                to="/admin/employees"
                icon={UserRound}
                label="Employees"
                onClose={onClose}
              />
              <SidebarLink
                to="/admin/leads"
                icon={ChartColumn}
                label="Leads"
                onClose={onClose}
              />
            </>
          )}

          {role === ROLES.BUSINESS_ADMIN && (
            <>
              <SidebarLink
                to="/business"
                end
                icon={LayoutDashboard}
                label="Dashboard"
                onClose={onClose}
              />
              <div className="pt-3 pb-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-text-muted">
                  Settings
                </p>
              </div>
              <SidebarLink
                to="/business/departments"
                icon={Building2}
                label="Departments"
                onClose={onClose}
              />
              <SidebarLink
                to="/business/employees"
                icon={Users}
                label="Employees"
                onClose={onClose}
              />
            </>
          )}

          {showDepartmentNavigation && (
            <>
              <div className="pt-3 pb-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-text-muted">
                  Departments
                </p>
              </div>
              <div className="space-y-1">
                {departments.map((department) => (
                  <SidebarGroup
                    key={department.id}
                    department={department}
                    dueCount={dueCounts[department.id] || 0}
                    onClose={onClose}
                  />
                ))}
              </div>
            </>
          )}
        </nav>

        <div className="sidebar-footer border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-xs">
          <button
            type="button"
            aria-label="Toggle theme"
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={toggleTheme}
            className="sidebar-theme-toggle mb-3 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {isDark ? "Light mode" : "Dark mode"}
            </span>
            <span
              aria-hidden="true"
              className={`theme-switch ${isDark ? "is-on" : ""}`}
            />
          </button>
      
        </div>
      </aside>
    </>
  );
}
