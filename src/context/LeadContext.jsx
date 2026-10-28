import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { STATUS_OPTIONS } from "../data/constants";
import { STORAGE_KEYS, readArray, writeJSON } from "../utils/storage";
import { normalizeLead, normalizeResponse, uid } from "../utils/response";
import { useOrg } from "./OrgContext";
import { useAuth } from "./AuthContext";
import { accessibleDepartments, can, ACTIONS } from "../utils/permissions";

const LeadContext = createContext(null);

export function LeadProvider({ children }) {
  const { departments } = useOrg();
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState(() =>
    readArray(STORAGE_KEYS.leads).map(normalizeLead),
  );

  useEffect(() => {
    writeJSON(STORAGE_KEYS.leads, leads);
  }, [leads]);

  // Data is always filtered through the caller's accessible departments so a
  // selector can never leak leads from another business or department.
  const accessibleIds = useMemo(
    () =>
      new Set(
        accessibleDepartments(currentUser, departments).map((item) => item.id),
      ),
    [currentUser, departments],
  );

  const accessibleLeads = useMemo(
    () => leads.filter((lead) => accessibleIds.has(lead.departmentId)),
    [leads, accessibleIds],
  );

  const canUseDepartment = useCallback(
    (departmentId) =>
      can(currentUser, ACTIONS.LEADS_MANAGE, { departmentId, departments }),
    [currentUser, departments],
  );

  const getLeadsByDepartment = useCallback(
    (departmentId) => {
      if (!departmentId || !accessibleIds.has(departmentId)) return [];
      return leads.filter((lead) => lead.departmentId === departmentId);
    },
    [leads, accessibleIds],
  );

  const getLead = useCallback(
    (id) => {
      const found = leads.find((lead) => lead.id === id);
      if (!found || !accessibleIds.has(found.departmentId)) return null;
      return found;
    },
    [leads, accessibleIds],
  );

  const businessIdFor = useCallback(
    (departmentId) =>
      departments.find((item) => item.id === departmentId)?.businessId || null,
    [departments],
  );

  const addLead = useCallback(
    (departmentId, values, initialResponse = null) => {
      if (!canUseDepartment(departmentId)) return null;
      const lead = normalizeLead({
        ...values,
        id: uid(),
        businessId: businessIdFor(departmentId),
        departmentId,
        status: values.status || "active",
        responses: initialResponse ? [normalizeResponse(initialResponse)] : [],
        createdAt: new Date().toISOString(),
      });
      setLeads((prev) => [lead, ...prev]);
      return lead;
    },
    [canUseDepartment, businessIdFor],
  );

  const importLeads = useCallback(
    (departmentId, rows) => {
      if (!canUseDepartment(departmentId)) return 0;
      const businessId = businessIdFor(departmentId);
      const created = rows.map((values) =>
        normalizeLead({
          ...values,
          id: uid(),
          businessId,
          departmentId,
          responses: [],
          createdAt: new Date().toISOString(),
        }),
      );
      setLeads((prev) => [...created, ...prev]);
      return created.length;
    },
    [canUseDepartment, businessIdFor],
  );

  const updateLead = useCallback(
    (id, patch, initialResponse = null) => {
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== id) return lead;
          if (!accessibleIds.has(lead.departmentId)) return lead;
          const next = normalizeLead({ ...lead, ...patch, id });
          if (!initialResponse) return next;
          return {
            ...next,
            responses: [...next.responses, normalizeResponse(initialResponse)],
          };
        }),
      );
    },
    [accessibleIds],
  );

  const deleteLead = useCallback(
    (id) => {
      setLeads((prev) =>
        prev.filter(
          (lead) => !(lead.id === id && accessibleIds.has(lead.departmentId)),
        ),
      );
    },
    [accessibleIds],
  );

  const addResponse = useCallback(
    (id, payload) => {
      const entry = normalizeResponse({
        id: uid(),
        createdAt: new Date().toISOString(),
        ...payload,
      });
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== id || !accessibleIds.has(lead.departmentId))
            return lead;
          return {
            ...lead,
            status: STATUS_OPTIONS.includes(entry.type)
              ? entry.type
              : lead.status,
            responses: [...lead.responses, entry],
          };
        }),
      );
      return entry;
    },
    [accessibleIds],
  );

  const changeStatus = useCallback(
    (id, status, note = "", spokenWith = "") =>
      addResponse(id, { type: status, note, spokenWith }),
    [addResponse],
  );

  const postponeLead = useCallback(
    (id, values) => addResponse(id, { type: "postponed", ...values }),
    [addResponse],
  );

  const updateResponse = useCallback(
    (id, responseId, patch) => {
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== id || !accessibleIds.has(lead.departmentId))
            return lead;
          return {
            ...lead,
            responses: lead.responses.map((item) =>
              item.id === responseId ? { ...item, ...patch } : item,
            ),
          };
        }),
      );
    },
    [accessibleIds],
  );

  // Cascade helpers used when a department or a whole business is deleted.
  const deleteLeadsByDepartment = useCallback((departmentId) => {
    setLeads((prev) =>
      prev.filter((lead) => lead.departmentId !== departmentId),
    );
  }, []);

  const deleteLeadsByBusiness = useCallback((businessId) => {
    setLeads((prev) => prev.filter((lead) => lead.businessId !== businessId));
  }, []);

  const value = useMemo(
    () => ({
      accessibleLeads,
      accessibleIds,
      getLead,
      getLeadsByDepartment,
      addLead,
      importLeads,
      updateLead,
      deleteLead,
      addResponse,
      changeStatus,
      postponeLead,
      updateResponse,
      deleteLeadsByDepartment,
      deleteLeadsByBusiness,
    }),
    [
      accessibleLeads,
      accessibleIds,
      getLead,
      getLeadsByDepartment,
      addLead,
      importLeads,
      updateLead,
      deleteLead,
      addResponse,
      changeStatus,
      postponeLead,
      updateResponse,
      deleteLeadsByDepartment,
      deleteLeadsByBusiness,
    ],
  );

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
}

// The provider and its consumer hook intentionally live together.
// oxlint-disable-next-line react/only-export-components
export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) throw new Error("useLeads must be used inside a LeadProvider");
  return context;
}
