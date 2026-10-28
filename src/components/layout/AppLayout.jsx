import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useLeads } from "../../context/LeadContext";
import { useAuth } from "../../context/AuthContext";
import useReminders from "../../hooks/useReminders";
import { getFollowups, groupFollowups } from "../../utils/response";
import { ROLES } from "../../data/constants";

export default function AppLayout() {
  const { accessibleLeads } = useLeads();
  const { currentUser, accessibleDepartments } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;

  // Lead reminders belong to business users; platform admins monitor business totals.
  useReminders(
    accessibleLeads,
    currentUser?.id,
    accessibleDepartments,
    !isSuperAdmin,
  );
  const groups = groupFollowups(getFollowups(accessibleLeads));
  const dueCount = isSuperAdmin
    ? 0
    : groups.overdue.length + groups.today.length;

  return (
    <div className="min-h-screen bg-page text-on-page">
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setDrawerOpen(true)} dueCount={dueCount} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
