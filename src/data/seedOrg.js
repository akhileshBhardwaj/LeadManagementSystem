import { ROLES } from "./constants";

// Passwords are stored in plain text ONLY because this is a frontend-only demo
// with no server. Never do this in a real application.

export const DEMO_BUSINESS_ID = "biz-demo";
export const DEMO_DEPARTMENT_ID = "dept-demo-hiring";

const createdAt = new Date().toISOString();

export const seedBusinesses = [
  {
    id: DEMO_BUSINESS_ID,
    name: "Demo Business",
    description: "Sample business created automatically for the offline demo.",
    active: true,
    createdAt,
  },
];

// New businesses start without departments. Business admins create what they need.
export const seedDepartments = [];

export const seedUsers = [
  {
    id: "user-super-admin",
    name: "Super Admin",
    username: "super",
    password: "super",
    role: ROLES.SUPER_ADMIN,
    businessId: null,
    departmentIds: [],
    active: true,
    createdAt,
  },
  {
    id: "user-business-admin",
    name: "Demo Business Admin",
    username: "bizadmin",
    password: "admin123",
    role: ROLES.BUSINESS_ADMIN,
    businessId: DEMO_BUSINESS_ID,
    departmentIds: [],
    active: true,
    createdAt,
  },
  {
    id: "user-employee",
    name: "Demo Employee",
    username: "employee",
    password: "emp123",
    role: ROLES.EMPLOYEE,
    businessId: DEMO_BUSINESS_ID,
    departmentIds: [],
    active: true,
    createdAt,
  },
];
