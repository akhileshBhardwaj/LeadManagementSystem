import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrg } from "../context/OrgContext";
import { homePathFor } from "../utils/permissions";

// Guards a route area by role. Users who are signed in but not allowed here go
// back to the landing page of their own role.
export default function RoleRoute({ roles, children }) {
  const { currentUser } = useAuth();
  const { departments } = useOrg();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(currentUser.role)) {
    return <Navigate to={homePathFor(currentUser, departments)} replace />;
  }

  return children;
}
