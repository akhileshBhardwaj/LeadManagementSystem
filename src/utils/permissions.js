import { ROLES } from "../data/constants";

export const ACTIONS = {
  BUSINESS_MANAGE: "business:manage",
  BUSINESS_VIEW_ALL: "business:viewAll",
  ADMIN_MANAGE: "admin:manage",
  DEPARTMENT_MANAGE: "department:manage",
  EMPLOYEE_MANAGE: "employee:manage",
  DEPARTMENT_ACCESS: "department:access",
  LEADS_MANAGE: "leads:manage",
};

export function isSuperAdmin(user) {
  return user?.role === ROLES.SUPER_ADMIN;
}

export function isBusinessAdmin(user) {
  return user?.role === ROLES.BUSINESS_ADMIN;
}

export function isEmployee(user) {
  return user?.role === ROLES.EMPLOYEE;
}

export function isActive(user) {
  return Boolean(user) && user.active !== false;
}

// Departments a user is allowed to see and work in.
export function accessibleDepartments(user, departments = []) {
  if (!isActive(user)) return [];
  if (isSuperAdmin(user)) return departments;
  const ownActive = departments.filter(
    (department) =>
      department.businessId === user.businessId && department.active !== false,
  );
  if (isBusinessAdmin(user)) return ownActive;
  if (isEmployee(user)) {
    const assigned = user.departmentIds || [];
    return ownActive.filter((department) => assigned.includes(department.id));
  }
  return [];
}

export function canAccessDepartment(user, departmentId, context = {}) {
  if (!departmentId) return false;
  return accessibleDepartments(user, context.departments).some(
    (department) => department.id === departmentId,
  );
}

export function canAccessBusiness(user, businessId, context = {}) {
  if (!businessId || !isActive(user)) return false;
  if (isSuperAdmin(user)) {
    return (context.businesses || []).some(
      (business) => business.id === businessId,
    );
  }
  return user.businessId === businessId;
}

/**
 * Single permission helper used by routes, menus, buttons and context selectors.
 * @param {object|null} user current user
 * @param {string} action one of ACTIONS
 * @param {object} context { departmentId, businessId, departments, businesses }
 */
export function can(user, action, context = {}) {
  if (!isActive(user)) return false;

  switch (action) {
    case ACTIONS.BUSINESS_MANAGE:
    case ACTIONS.BUSINESS_VIEW_ALL:
    case ACTIONS.ADMIN_MANAGE:
      return isSuperAdmin(user);

    case ACTIONS.DEPARTMENT_MANAGE:
      if (isSuperAdmin(user)) return true;
      if (isBusinessAdmin(user)) {
        return !context.businessId || context.businessId === user.businessId;
      }
      return false;

    case ACTIONS.EMPLOYEE_MANAGE:
      return (
        isSuperAdmin(user) ||
        (isBusinessAdmin(user) &&
          (!context.businessId || context.businessId === user.businessId))
      );

    case ACTIONS.DEPARTMENT_ACCESS:
    case ACTIONS.LEADS_MANAGE:
      return canAccessDepartment(user, context.departmentId, context);

    default:
      return false;
  }
}

// Landing route for a role after login (or when hitting "/").
export function homePathFor(user, departments = []) {
  if (!isActive(user)) return "/login";
  if (isSuperAdmin(user)) return "/admin";
  if (isBusinessAdmin(user)) return "/business";
  const first = accessibleDepartments(user, departments)[0];
  return first ? `/d/${first.id}` : "/no-access";
}
