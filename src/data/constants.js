export const STATUS_OPTIONS = ["active", "inactive", "postponed", "converted"];

export const STATUS_META = {
  active: { label: "Active", tone: "sky" },
  inactive: { label: "Inactive", tone: "slate" },
  postponed: { label: "Postponed", tone: "amber" },
  converted: { label: "Converted", tone: "emerald" },
};

export const RESPONSE_TYPE_META = {
  active: { label: "Active", tone: "sky" },
  inactive: { label: "Inactive", tone: "slate" },
  postponed: { label: "Postponed", tone: "amber" },
  converted: { label: "Converted", tone: "emerald" },
};

export const REFERENCE_OPTIONS = [
  "Ads",
  "Local Banner",
  "Cold Calling",
  "Google",
];

export const DEFAULT_RESPONSE_TYPE = "postponed";

// Roles used across the whole app (routes, menus and permission checks).
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  BUSINESS_ADMIN: "business_admin",
  EMPLOYEE: "employee",
};

export const ROLE_META = {
  [ROLES.SUPER_ADMIN]: { label: "Super Admin", tone: "indigo" },
  [ROLES.BUSINESS_ADMIN]: { label: "Business Admin", tone: "sky" },
  [ROLES.EMPLOYEE]: { label: "Employee", tone: "slate" },
};

// Lead fields are identical in every department, so one shared config supplies
// the labels used by the lead components.
export const LEAD_CONFIG = {
  label: "Lead",
  itemLabel: "Course / Position / Service",
};
