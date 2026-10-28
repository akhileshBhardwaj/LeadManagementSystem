import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Sun, Moon } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import DepartmentSwitcher from "./DepartmentSwitcher";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { ROLES } from "../../data/constants";

export default function Topbar({ onMenuClick, dueCount = 0 }) {
  const { currentUser, activeDepartment } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const darkMode = theme === "dark";
  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;
  const isDepartmentWorkspace = /^\/d\/[^/]+(?:\/|$)/.test(pathname);
  const showDepartmentTools = !isSuperAdmin || isDepartmentWorkspace;
  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term || !activeDepartment) return;
    navigate(`/d/${activeDepartment.id}/leads?q=${encodeURIComponent(term)}`);
    setQuery("");
  };
  return (
    <header className="topbar sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="icon-button shrink-0 rounded-xl p-2 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="order-1 min-w-0 flex-1 md:max-w-64">
          <Breadcrumb />
        </div>
        <div className="order-2 flex shrink-0 items-center gap-1 sm:order-3 sm:ml-auto sm:gap-2">
          {showDepartmentTools && <DepartmentSwitcher />}
          <button
            type="button"
            aria-label="Toggle theme"
            title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            onClick={toggleTheme}
            className="theme-toggle icon-button"
          >
            <span aria-hidden="true">
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </span>
          </button>
          {showDepartmentTools && !isSuperAdmin && (
            <NotificationBell dueCount={dueCount} />
          )}
          <UserMenu />
        </div>
        {showDepartmentTools && (
          <form
            onSubmit={submitSearch}
            className="relative order-3 w-full sm:order-2 sm:min-w-0 sm:flex-1"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={!activeDepartment}
              aria-label="Search leads in the active department"
              placeholder={
                activeDepartment
                  ? `Search leads in ${activeDepartment.name}...`
                  : "Open a department to search leads"
              }
              className="h-10 w-full rounded-xl border border-border bg-surface-muted pl-9 pr-3 text-sm text-on-surface placeholder:text-text-muted transition-colors focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </form>
        )}
      </div>
    </header>
  );
}
