import { Building2, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOrg } from "../../context/OrgContext";
import { ROLES } from "../../data/constants";

const CRUMB = "truncate text-sm font-medium text-text-muted";
const CURRENT = "truncate text-sm font-semibold text-text-strong";

export default function Breadcrumb() {
  const { currentUser, activeDepartment } = useAuth();
  const { getBusiness } = useOrg();
  const { pathname } = useLocation();
  const role = currentUser?.role;
  const isPlatformPage =
    role === ROLES.SUPER_ADMIN && !/^\/d\/[^/]+(?:\/|$)/.test(pathname);
  const department = isPlatformPage ? null : activeDepartment;
  const business = department
    ? getBusiness(department.businessId)
    : getBusiness(currentUser?.businessId);

  if (!department) {
    if (role === ROLES.SUPER_ADMIN)
      return <span className={CURRENT}>Platform</span>;
    if (business)
      return (
        <span className="flex min-w-0 items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-accent" />
          <span
            className="truncate text-sm font-semibold text-text-strong"
            title={business.name}
          >
            {business.name}
          </span>
        </span>
      );
    return <span className={CURRENT}>Department</span>;
  }

  const businessTo =
    role === ROLES.SUPER_ADMIN && business
      ? `/admin/businesses/${business.id}`
      : role === ROLES.BUSINESS_ADMIN
        ? "/business"
        : null;

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
      {business &&
        (businessTo ? (
          <Link
            to={businessTo}
            className={`${CRUMB} hover:text-on-hover`}
            title={business.name}
          >
            {business.name}
          </Link>
        ) : (
          <span
            className={`${CRUMB} font-semibold text-primary`}
            title={business.name}
          >
            {business.name}
          </span>
        ))}
      {business && (
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      )}
      <span className={CURRENT} title={department.name}>
        {department.name}
      </span>
    </nav>
  );
}
