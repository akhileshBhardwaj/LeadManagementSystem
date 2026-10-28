import { DEFAULT_RESPONSE_TYPE, STATUS_OPTIONS } from "../data/constants";
import {
  diffInDays,
  isOverdue,
  isToday,
  sortByISODate,
  todayISO,
} from "./date";

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeResponse(entry = {}) {
  return {
    ...entry,
    id: entry.id || uid(),
    type: entry.type || DEFAULT_RESPONSE_TYPE,
    note: entry.note || "",
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

export function normalizeLead(lead = {}) {
  return {
    budgetMin: 0,
    budgetMax: 0,
    course: "",
    location: "",
    reference: "",
    ...lead,
    phone: lead.phone ? String(lead.phone).trim() : "",
    phone2: lead.phone2 ? String(lead.phone2).trim() : "",
    businessId: lead.businessId || null,
    departmentId: lead.departmentId || null,
    createdAt: lead.createdAt || new Date().toISOString(),
    status: STATUS_OPTIONS.includes(lead.status) ? lead.status : "active",
    responses: Array.isArray(lead.responses)
      ? lead.responses.map(normalizeResponse)
      : [],
  };
}

function byCreatedAsc(a, b) {
  const left = a.createdAt || "";
  const right = b.createdAt || "";
  return left < right ? -1 : left > right ? 1 : 0;
}

export function getResponses(lead) {
  return (lead?.responses || []).map(normalizeResponse).sort(byCreatedAsc);
}

export function getPostponeEntries(lead) {
  return getResponses(lead).filter((entry) => entry.type === "postponed");
}

export function getPostponeCount(lead) {
  return getPostponeEntries(lead).length;
}

export function getLatestPostpone(lead) {
  const entries = getPostponeEntries(lead);
  return entries.length ? entries[entries.length - 1] : null;
}

// Prefill for a brand new postpone entry: reuse the last entry's contact details
// but always leave the date and time empty so the user must choose them.
export function getPostponeDefaults(lead) {
  const latest = getLatestPostpone(lead);
  return {
    nextDate: "",
    time: "",
    person: latest?.person || lead?.name || "",
    mobile: latest?.mobile || lead?.phone || "",
    location: latest?.location || lead?.location || "",
    note: "",
  };
}

export function getConvertedEntry(lead) {
  return getResponses(lead).find((entry) => entry.type === "converted") || null;
}

export function getInteractionCount(lead) {
  return getResponses(lead).length;
}

export function buildTimeline(lead) {
  let counter = 0;
  const numbered = getResponses(lead).map((entry) => {
    if (entry.type !== "postponed") return entry;
    counter += 1;
    return { ...entry, postponeNo: counter };
  });
  return numbered.reverse();
}

export function getFollowup(lead) {
  if (!lead || lead.status !== "postponed") return null;
  const latest = getLatestPostpone(lead);
  if (!latest || !latest.nextDate) return null;
  return {
    leadId: lead.id,
    responseId: latest.id,
    lead,
    nextDate: latest.nextDate,
    time: latest.time || "",
    person: latest.person || "",
    mobile: latest.mobile || "",
    location: latest.location || "",
    note: latest.note || "",
  };
}

export function getFollowups(leads) {
  return leads.map(getFollowup).filter(Boolean);
}

// Postponed leads that have no postpone entry with a date yet - they would
// otherwise be invisible on the Follow-ups page.
export function getPostponedWithoutDate(leads) {
  return leads.filter(
    (lead) => lead.status === "postponed" && !getFollowup(lead),
  );
}

export function groupFollowups(followups) {
  const sorted = sortByISODate(followups, (item) => item.nextDate);
  return {
    overdue: sorted.filter((item) => isOverdue(item.nextDate)),
    today: sorted.filter((item) => isToday(item.nextDate)),
    upcoming: sorted.filter((item) => diffInDays(item.nextDate) > 0),
  };
}

export function countByStatus(leads) {
  const counts = {
    total: leads.length,
    active: 0,
    inactive: 0,
    postponed: 0,
    converted: 0,
  };
  leads.forEach((lead) => {
    if (counts[lead.status] !== undefined) counts[lead.status] += 1;
  });
  return counts;
}

export function getSourceBreakdown(leads) {
  const map = new Map();
  leads.forEach((lead) => {
    const key = lead.reference || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

export function isDueToday(iso) {
  return Boolean(iso) && (iso === todayISO() || isOverdue(iso));
}
