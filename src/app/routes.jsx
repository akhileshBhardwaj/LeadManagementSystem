import AppLayout from "../components/layout/AppLayout";
import { ROLES } from "../data/constants";
import Dashboard from "../pages/Dashboard";
import Followups from "../pages/Followups";
import LeadDetail from "../pages/LeadDetail";
import Leads from "../pages/Leads";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminEmployees from "../pages/admin/AdminEmployees";
import AdminLeads from "../pages/admin/AdminLeads";
import BusinessAdmins from "../pages/admin/BusinessAdmins";
import BusinessDetail from "../pages/admin/BusinessDetail";
import Businesses from "../pages/admin/Businesses";
import NoAccess from "../pages/auth/NoAccess";
import BusinessDashboard from "../pages/business/BusinessDashboard";
import Departments from "../pages/business/Departments";
import Employees from "../pages/business/Employees";
import DepartmentRoute from "./DepartmentRoute";
import HomeRedirect from "./HomeRedirect";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const SUPER_ADMIN_ONLY = [ROLES.SUPER_ADMIN];
const BUSINESS_ADMIN_ONLY = [ROLES.BUSINESS_ADMIN];

function departmentPage(element) {
  return <DepartmentRoute>{element}</DepartmentRoute>;
}

const routes = [
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        path: "admin",
        element: (
          <RoleRoute roles={SUPER_ADMIN_ONLY}>
            <AdminDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "admin/businesses",
        element: (
          <RoleRoute roles={SUPER_ADMIN_ONLY}>
            <Businesses />
          </RoleRoute>
        ),
      },
      {
        path: "admin/businesses/:businessId",
        element: (
          <RoleRoute roles={SUPER_ADMIN_ONLY}>
            <BusinessDetail />
          </RoleRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <RoleRoute roles={SUPER_ADMIN_ONLY}>
            <BusinessAdmins />
          </RoleRoute>
        ),
      },
      {
        path: "admin/employees",
        element: (
          <RoleRoute roles={SUPER_ADMIN_ONLY}>
            <AdminEmployees />
          </RoleRoute>
        ),
      },
      {
        path: "admin/leads",
        element: (
          <RoleRoute roles={SUPER_ADMIN_ONLY}>
            <AdminLeads />
          </RoleRoute>
        ),
      },
      {
        path: "business",
        element: (
          <RoleRoute roles={BUSINESS_ADMIN_ONLY}>
            <BusinessDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "business/departments",
        element: (
          <RoleRoute roles={BUSINESS_ADMIN_ONLY}>
            <Departments />
          </RoleRoute>
        ),
      },
      {
        path: "business/employees",
        element: (
          <RoleRoute roles={BUSINESS_ADMIN_ONLY}>
            <Employees />
          </RoleRoute>
        ),
      },
      { path: "d/:departmentId", element: departmentPage(<Dashboard />) },
      { path: "d/:departmentId/leads", element: departmentPage(<Leads />) },
      {
        path: "d/:departmentId/leads/:leadId",
        element: departmentPage(<LeadDetail />),
      },
      {
        path: "d/:departmentId/followups",
        element: departmentPage(<Followups />),
      },
      { path: "no-access", element: <NoAccess /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default routes;
