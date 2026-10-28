import { ROLES } from "./constants";

const createdAt = new Date().toISOString();

// Start with no sample business, departments or demo accounts.
export const seedBusinesses = [];
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
];
