import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrg } from "../context/OrgContext";
import { homePathFor } from "../utils/permissions";

// Sends "/" to the landing page that matches the signed-in user's role.
export default function HomeRedirect() {
  const { currentUser } = useAuth();
  const { departments } = useOrg();

  return <Navigate to={homePathFor(currentUser, departments)} replace />;
}
