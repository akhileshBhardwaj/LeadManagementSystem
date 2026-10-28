import { ROLES } from "../data/constants";
import {
  DEMO_BUSINESS_ID,
  DEMO_DEPARTMENT_ID,
  seedBusinesses,
  seedDepartments,
  seedUsers,
} from "../data/seedOrg";
import {
  LEGACY_LEADS_KEY,
  STORAGE_KEYS,
  hasKey,
  readArray,
  writeJSON,
} from "./storage";

// Legacy leads carried a `category` field that no longer exists in the
// department-based model, so it is dropped while the scope is attached.
function scopeLead(lead) {
  const next = {
    ...lead,
    businessId: DEMO_BUSINESS_ID,
    departmentId: DEMO_DEPARTMENT_ID,
  };
  delete next.category;
  return next;
}

// Runs once before the app renders. Fresh demo data starts without departments
// or sample leads; existing legacy records are preserved during migration.
export function runMigration() {
  // Restore required demo records even when a previous run saved empty arrays.
  // Do not create a department here: admins add departments explicitly.
  const storedBusinesses = readArray(STORAGE_KEYS.businesses);
  const businesses = storedBusinesses.filter(
    (item) =>
      item && typeof item.id === "string" && typeof item.name === "string",
  );
  const nextBusinesses = [...businesses];
  for (const business of seedBusinesses) {
    if (!nextBusinesses.some((item) => item.id === business.id)) {
      nextBusinesses.push(business);
    }
  }
  if (
    !hasKey(STORAGE_KEYS.businesses) ||
    JSON.stringify(businesses) !== JSON.stringify(storedBusinesses) ||
    nextBusinesses.length !== businesses.length
  ) {
    writeJSON(STORAGE_KEYS.businesses, nextBusinesses);
  }

  const storedDepartments = readArray(STORAGE_KEYS.departments);
  const departments = storedDepartments.filter(
    (item) =>
      item &&
      typeof item.id === "string" &&
      typeof item.businessId === "string" &&
      typeof item.name === "string",
  );
  if (
    !hasKey(STORAGE_KEYS.departments) ||
    departments.length !== storedDepartments.length
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
        Object.values(ROLES).includes(user.role),
    )
    .map((user) => ({
      ...user,
      departmentIds: Array.isArray(user.departmentIds)
        ? user.departmentIds.filter((id) => typeof id === "string")
        : [],
    }));
  const nextUsers = [...users];

  // Keep the configured root account in sync with seedOrg.js on existing browsers.
  // This changes only the Super Admin's credentials and preserves all other records.
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
    const username = user.username.toLowerCase();
    if (
      !nextUsers.some(
        (item) =>
          typeof item?.username === "string" &&
          item.username.trim().toLowerCase() === username,
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

  if (hasKey(STORAGE_KEYS.leads)) {
    // Already migrated: only backfill missing scope fields.
    const storedLeads = readArray(STORAGE_KEYS.leads);
    let changed = false;
    const leads = storedLeads.filter(
      (lead) => lead && typeof lead === "object" && typeof lead.id === "string",
    );
    if (leads.length !== storedLeads.length) changed = true;
    const patched = leads.map((lead) => {
      if (lead.businessId && lead.departmentId && !("category" in lead))
        return lead;
      changed = true;
      return scopeLead(lead);
    });
    if (changed) writeJSON(STORAGE_KEYS.leads, patched);
    return;
  }

  const legacyLeads = readArray(LEGACY_LEADS_KEY).filter(
    (lead) => lead && typeof lead === "object" && typeof lead.id === "string",
  );
  const source = legacyLeads;
  writeJSON(STORAGE_KEYS.leads, source.map(scopeLead));
}
