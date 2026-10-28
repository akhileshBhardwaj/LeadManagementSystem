import { ROLES } from "../data/constants";
import { seedBusinesses, seedDepartments, seedUsers } from "../data/seedOrg";

import {
  LEGACY_LEADS_KEY,
  STORAGE_KEYS,
  hasKey,
  readArray,
  writeJSON,
} from "./storage";

const DEMO_BUSINESS_ID = "biz-demo";
const DEMO_DEPARTMENT_ID = "dept-demo-hiring";

function removeDemoLeadScope(lead) {
  const next = { ...lead };
  delete next.category;
  return next;
}

// Runs before the app renders. Removes the old demo organisation without
// clearing real businesses, users or leads saved in this browser.
export function runMigration() {
  const storedBusinesses = readArray(STORAGE_KEYS.businesses);
  const businesses = storedBusinesses.filter(
    (item) =>
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      item.id !== DEMO_BUSINESS_ID,
  );
  const nextBusinesses = [...businesses];
  for (const business of seedBusinesses) {
    if (business.id === DEMO_BUSINESS_ID) continue;
    if (!nextBusinesses.some((item) => item.id === business.id)) {
      nextBusinesses.push(business);
    }
  }
  if (
    !hasKey(STORAGE_KEYS.businesses) ||
    JSON.stringify(businesses) !== JSON.stringify(storedBusinesses) ||
    JSON.stringify(nextBusinesses) !== JSON.stringify(businesses)
  ) {
    writeJSON(STORAGE_KEYS.businesses, nextBusinesses);
  }

  const storedDepartments = readArray(STORAGE_KEYS.departments);
  const departments = storedDepartments.filter(
    (item) =>
      item &&
      typeof item.id === "string" &&
      typeof item.businessId === "string" &&
      typeof item.name === "string" &&
      item.businessId !== DEMO_BUSINESS_ID &&
      item.id !== DEMO_DEPARTMENT_ID,
  );
  if (
    !hasKey(STORAGE_KEYS.departments) ||
    JSON.stringify(departments) !== JSON.stringify(storedDepartments)
  ) {
    writeJSON(
      STORAGE_KEYS.departments,
      departments.length ? departments : seedDepartments,
    );
  }

  const storedUsers = readArray(STORAGE_KEYS.users);
  const users = storedUsers
    .filter(
      (user) =>
        user &&
        typeof user === "object" &&
        typeof user.id === "string" &&
        typeof user.name === "string" &&
        typeof user.username === "string" &&
        typeof user.password === "string" &&
        Object.values(ROLES).includes(user.role) &&
        user.businessId !== DEMO_BUSINESS_ID,
    )
    .map((user) => ({
      ...user,
      departmentIds: Array.isArray(user.departmentIds)
        ? user.departmentIds.filter(
            (id) => id !== DEMO_DEPARTMENT_ID && typeof id === "string",
          )
        : [],
    }));
  const nextUsers = [...users];

  // Sync the configured Super Admin credentials while preserving its other settings.
  const seedSuperAdmin = seedUsers.find(
    (user) => user.role === ROLES.SUPER_ADMIN,
  );
  if (seedSuperAdmin) {
    const existingSuperAdmin =
      nextUsers.find((user) => user.id === seedSuperAdmin.id) ||
      nextUsers.find((user) => user.role === ROLES.SUPER_ADMIN);
    const usernameTakenByAnotherUser = nextUsers.some(
      (user) =>
        user.id !== existingSuperAdmin?.id &&
        user.username.trim().toLowerCase() ===
          seedSuperAdmin.username.toLowerCase(),
    );
    if (existingSuperAdmin && !usernameTakenByAnotherUser) {
      const index = nextUsers.findIndex(
        (user) => user.id === existingSuperAdmin.id,
      );
      nextUsers[index] = {
        ...existingSuperAdmin,
        username: seedSuperAdmin.username,
        password: seedSuperAdmin.password,
      };
    }
  }

  for (const user of seedUsers) {
    if (user.businessId === DEMO_BUSINESS_ID) continue;
    const username = user.username.toLowerCase();
    if (
      !nextUsers.some(
        (item) => item.username?.trim().toLowerCase() === username,
      )
    ) {
      nextUsers.push(user);
    }
  }
  if (
    !hasKey(STORAGE_KEYS.users) ||
    JSON.stringify(users) !== JSON.stringify(storedUsers) ||
    JSON.stringify(nextUsers) !== JSON.stringify(users)
  ) {
    writeJSON(STORAGE_KEYS.users, nextUsers);
  }

  const cleanLeads = (items) =>
    items
      .filter(
        (lead) =>
          lead &&
          typeof lead === "object" &&
          typeof lead.id === "string" &&
          lead.businessId !== DEMO_BUSINESS_ID &&
          lead.departmentId !== DEMO_DEPARTMENT_ID,
      )
      .map(removeDemoLeadScope);

  if (hasKey(STORAGE_KEYS.leads)) {
    const storedLeads = readArray(STORAGE_KEYS.leads);
    const leads = cleanLeads(storedLeads);
    if (JSON.stringify(leads) !== JSON.stringify(storedLeads)) {
      writeJSON(STORAGE_KEYS.leads, leads);
    }
    return;
  }

  const legacyLeads = readArray(LEGACY_LEADS_KEY);
  writeJSON(STORAGE_KEYS.leads, cleanLeads(legacyLeads));
}
