// Every collection lives under a single, versioned localStorage key so old
// data can be migrated safely (see utils/migrate.js).
const VERSION = "v2";

export const STORAGE_KEYS = {
  users: `lms:users:${VERSION}`,
  businesses: `lms:businesses:${VERSION}`,
  departments: `lms:departments:${VERSION}`,
  leads: `lms:leads:${VERSION}`,
  session: `lms:session:${VERSION}`,
};

// Keys written by the previous (single-company) version of the app.
export const LEGACY_LEADS_KEY = "lms:leads:v1";
export const LEGACY_NOTIFIED_KEY = "lms:notified:v1";

export function notifiedKey(userId) {
  return `lms:notified:${VERSION}:${userId || "guest"}`;
}

export function hasKey(key) {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    // Corrupt or unavailable storage: fall back to the caller's default.
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Storage might be full or blocked (private mode). Keep state in memory.
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // nothing to do when storage is unavailable
  }
}

export function readArray(key, fallback = []) {
  const value = readJSON(key, fallback);
  return Array.isArray(value) ? value : fallback;
}
