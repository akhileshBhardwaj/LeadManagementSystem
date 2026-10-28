import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useOrg } from "../context/OrgContext";
import { homePathFor } from "../utils/permissions";

export default function NotFound() {
  const { currentUser } = useAuth();
  const { departments } = useOrg();
  const home = homePathFor(currentUser, departments);

  return (
    <Card className="mx-auto max-w-lg space-y-4 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Compass className="h-6 w-6" />
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-text-strong">
        404
      </h1>
      <p className="text-sm text-text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex justify-center gap-2">
        <Button as={Link} to={home}>
          Go to my dashboard
        </Button>
      </div>
    </Card>
  );
}
