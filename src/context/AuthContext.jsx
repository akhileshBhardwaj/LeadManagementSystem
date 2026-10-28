import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useOrg } from "./OrgContext";
import { STORAGE_KEYS, readJSON, removeKey, writeJSON } from "../utils/storage";
import { accessibleDepartments } from "../utils/permissions";
import { findUserByUsername } from "../utils/auth";
const AuthContext = createContext(null);

// Passwords are compared in plain text ONLY because this is a frontend-only
// demo. Never authenticate like this with a real backend.

export function AuthProvider({ children }) {
  const { users, departments, getBusiness } = useOrg();
  const [session, setSession] = useState(() =>
    readJSON(STORAGE_KEYS.session, null),
  );

  useEffect(() => {
    if (session?.userId) writeJSON(STORAGE_KEYS.session, session);
    else removeKey(STORAGE_KEYS.session);
  }, [session]);

  // The signed-in user, resolved live so deactivations take effect immediately.
  const currentUser = useMemo(() => {
    if (!session?.userId) return null;
    const found = users.find((user) => user.id === session.userId);
    if (!found || found.active === false) return null;
    if (found.businessId) {
      const business = getBusiness(found.businessId);
      if (!business || business.active === false) return null;
    }
    return found;
  }, [session, users, getBusiness]);

  const accessible = useMemo(
    () => accessibleDepartments(currentUser, departments),
    [currentUser, departments],
  );

  const activeDepartment = useMemo(() => {
    if (!currentUser) return null;
    const chosen = accessible.find(
      (department) => department.id === session?.activeDepartmentId,
    );
    return chosen || accessible[0] || null;
  }, [currentUser, accessible, session]);

  const login = useCallback(
    (username, password) => {
      const value = String(username || "")
        .trim()
        .toLowerCase();
      const secret = String(password || "");
      if (!value || !secret)
        throw new Error("Username and password are both required.");

      const user = findUserByUsername(users, value);
      if (!user) throw new Error("No account found with that username.");
      if (user.password !== secret)
        throw new Error("Incorrect password. Please try again.");
      if (user.active === false)
        throw new Error(
          "This account has been deactivated. Contact your administrator.",
        );

      if (user.businessId) {
        const business = getBusiness(user.businessId);
        if (!business) throw new Error("Your business no longer exists.");
        if (business.active === false)
          throw new Error(
            `${business.name} is deactivated, so you cannot sign in right now.`,
          );
      }

      const firstDepartment = accessibleDepartments(user, departments)[0];
      setSession({
        userId: user.id,
        activeDepartmentId: firstDepartment ? firstDepartment.id : null,
      });
      return user;
    },
    [users, departments, getBusiness],
  );

  const logout = useCallback(() => setSession(null), []);

  const setActiveDepartment = useCallback((departmentId) => {
    setSession((prev) => ({
      userId: prev?.userId || null,
      activeDepartmentId: departmentId,
    }));
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      activeDepartment,
      accessibleDepartments: accessible,
      login,
      logout,
      setActiveDepartment,
    }),
    [
      currentUser,
      activeDepartment,
      accessible,
      login,
      logout,
      setActiveDepartment,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
