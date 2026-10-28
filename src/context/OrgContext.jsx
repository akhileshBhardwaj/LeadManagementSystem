import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ROLES } from "../data/constants";
import { STORAGE_KEYS, readArray, writeJSON } from "../utils/storage";
import { uid } from "../utils/response";

const OrgContext = createContext(null);

// Passwords are stored in plain text ONLY because this is a frontend-only demo
// with no server. Never store credentials like this in a real application.

export function OrgProvider({ children }) {
  const [businesses, setBusinesses] = useState(() =>
    readArray(STORAGE_KEYS.businesses),
  );
  const [departments, setDepartments] = useState(() =>
    readArray(STORAGE_KEYS.departments),
  );
  const [users, setUsers] = useState(() => readArray(STORAGE_KEYS.users));

  useEffect(() => {
    writeJSON(STORAGE_KEYS.businesses, businesses);
  }, [businesses]);
  useEffect(() => {
    writeJSON(STORAGE_KEYS.departments, departments);
  }, [departments]);
  useEffect(() => {
    writeJSON(STORAGE_KEYS.users, users);
  }, [users]);

  /* ----------------------------- selectors ----------------------------- */

  const getBusiness = useCallback(
    (id) => businesses.find((business) => business.id === id) || null,
    [businesses],
  );
  const getDepartment = useCallback(
    (id) => departments.find((department) => department.id === id) || null,
    [departments],
  );
  const getDepartmentsByBusiness = useCallback(
    (businessId) =>
      departments.filter((department) => department.businessId === businessId),
    [departments],
  );
  const getUsersByBusiness = useCallback(
    (businessId) => users.filter((user) => user.businessId === businessId),
    [users],
  );
  const getBusinessAdmins = useCallback(
    () => users.filter((user) => user.role === ROLES.BUSINESS_ADMIN),
    [users],
  );
  const getEmployees = useCallback(
    (businessId) =>
      users.filter(
        (user) =>
          user.role === ROLES.EMPLOYEE &&
          (!businessId || user.businessId === businessId),
      ),
    [users],
  );

  const isUsernameTaken = useCallback(
    (username, exceptId = null) => {
      const value = String(username || "")
        .trim()
        .toLowerCase();
      if (!value) return false;
      return users.some(
        (user) =>
          user?.id !== exceptId &&
          typeof user?.username === "string" &&
          user.username.trim().toLowerCase() === value,
      );
    },
    [users],
  );

  const isDepartmentNameTaken = useCallback(
    (businessId, name, exceptId = null) => {
      const value = String(name || "")
        .trim()
        .toLowerCase();
      if (!value) return false;
      return departments.some(
        (department) =>
          department?.id !== exceptId &&
          department?.businessId === businessId &&
          typeof department?.name === "string" &&
          department.name.trim().toLowerCase() === value,
      );
    },
    [departments],
  );

  /* ----------------------------- businesses ----------------------------- */

  const addBusiness = useCallback((values) => {
    const business = {
      id: uid(),
      name: values.name.trim(),
      description: values.description?.trim() || "",
      active: values.active !== false,
      createdAt: new Date().toISOString(),
    };
    setBusinesses((prev) => [business, ...prev]);
    return business;
  }, []);

  const updateBusiness = useCallback((id, patch) => {
    setBusinesses((prev) =>
      prev.map((business) =>
        business.id === id ? { ...business, ...patch, id } : business,
      ),
    );
  }, []);

  const deleteBusiness = useCallback((id) => {
    setBusinesses((prev) => prev.filter((business) => business.id !== id));
    setDepartments((prev) =>
      prev.filter((department) => department.businessId !== id),
    );
    setUsers((prev) =>
      prev.filter(
        (user) => user.role === ROLES.SUPER_ADMIN || user.businessId !== id,
      ),
    );
  }, []);

  /* ----------------------------- departments ---------------------------- */

  const addDepartment = useCallback((businessId, values) => {
    const department = {
      id: uid(),
      businessId,
      name: values.name.trim(),
      description: values.description?.trim() || "",
      active: values.active !== false,
      createdAt: new Date().toISOString(),
    };
    setDepartments((prev) => [...prev, department]);
    return department;
  }, []);

  const updateDepartment = useCallback((id, patch) => {
    setDepartments((prev) =>
      prev.map((department) =>
        department.id === id ? { ...department, ...patch, id } : department,
      ),
    );
  }, []);

  const deleteDepartment = useCallback((id) => {
    setDepartments((prev) => prev.filter((department) => department.id !== id));
    setUsers((prev) =>
      prev.map((user) =>
        (user.departmentIds || []).includes(id)
          ? {
              ...user,
              departmentIds: user.departmentIds.filter((item) => item !== id),
            }
          : user,
      ),
    );
  }, []);

  /* -------------------------------- users ------------------------------- */

  const addUser = useCallback(
    (values) => {
      const username = String(values.username || "")
        .trim()
        .toLowerCase();
      if (!username) throw new Error("Username is required.");
      if (
        users.some(
          (user) =>
            String(user.username || "")
              .trim()
              .toLowerCase() === username,
        )
      ) {
        throw new Error(
          "This username is already in use. Usernames must be unique across all businesses.",
        );
      }
      const user = {
        id: uid(),
        name: String(values.name || "").trim(),
        username,
        password: values.password,
        role: values.role,
        businessId: values.businessId || null,
        departmentIds: values.departmentIds || [],
        active: values.active !== false,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, user]);
      return user;
    },
    [users],
  );

  const updateUser = useCallback(
    (id, patch) => {
      const existing = users.find((user) => user.id === id);
      if (!existing) return;
      const username =
        patch.username === undefined
          ? existing.username
          : String(patch.username || "")
              .trim()
              .toLowerCase();
      if (!username) throw new Error("Username is required.");
      if (
        patch.username !== undefined &&
        users.some(
          (user) =>
            user.id !== id &&
            String(user.username || "")
              .trim()
              .toLowerCase() === username,
        )
      ) {
        throw new Error(
          "This username is already in use. Usernames must be unique across all businesses.",
        );
      }
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, ...patch, username, id } : user,
        ),
      );
    },
    [users],
  );

  const deleteUser = useCallback((id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      businesses,
      departments,
      users,
      getBusiness,
      getDepartment,
      getDepartmentsByBusiness,
      getUsersByBusiness,
      getBusinessAdmins,
      getEmployees,
      isUsernameTaken,
      isDepartmentNameTaken,
      addBusiness,
      updateBusiness,
      deleteBusiness,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addUser,
      updateUser,
      deleteUser,
    }),
    [
      businesses,
      departments,
      users,
      getBusiness,
      getDepartment,
      getDepartmentsByBusiness,
      getUsersByBusiness,
      getBusinessAdmins,
      getEmployees,
      isUsernameTaken,
      isDepartmentNameTaken,
      addBusiness,
      updateBusiness,
      deleteBusiness,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addUser,
      updateUser,
      deleteUser,
    ],
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) throw new Error("useOrg must be used inside an OrgProvider");
  return context;
}
