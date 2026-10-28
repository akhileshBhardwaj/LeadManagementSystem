import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrg } from "../context/OrgContext";
import { ACTIONS, can } from "../utils/permissions";
import NoAccess from "../pages/auth/NoAccess";

// Every /d/:departmentId/* route passes through here. Users without access to
// the department get the "No access" page instead of the requested screen.
export default function DepartmentRoute({ children }) {
  const { departmentId } = useParams();
  const { currentUser, setActiveDepartment } = useAuth();
  const { departments } = useOrg();

  const allowed = can(currentUser, ACTIONS.DEPARTMENT_ACCESS, {
    departmentId,
    departments,
  });

  useEffect(() => {
    if (allowed) setActiveDepartment(departmentId);
  }, [allowed, departmentId, setActiveDepartment]);

  if (!allowed) return <NoAccess />;
  return children;
}
