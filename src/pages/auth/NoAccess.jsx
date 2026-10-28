import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useOrg } from "../../context/OrgContext";
import { homePathFor } from "../../utils/permissions";

export default function NoAccess() {
  const { currentUser } = useAuth();
  const { departments } = useOrg();
  const home = homePathFor(currentUser, departments);
  const canGoHome = home !== "/no-access";

  return (
    <Card className="mx-auto max-w-lg space-y-4 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <ShieldAlert className="h-6 w-6" />
      </span>
      <h1 className="text-lg font-semibold tracking-tight text-text-strong">
        No access
      </h1>
      <p className="text-sm text-text-muted">
        {currentUser?.role === "employee" &&
        !currentUser.departmentIds?.some((id) =>
          departments.some(
            (department) => department.id === id && department.active !== false,
          ),
        )
          ? "No department has been assigned to your account yet. Ask your business administrator to assign one."
          : "You do not have permission to open this department. Ask your business administrator to assign it to you."}
      </p>
      {canGoHome && (
        <div className="flex justify-center">
          <Button as={Link} to={home}>
            Go to my dashboard
          </Button>
        </div>
      )}
    </Card>
  );
}
