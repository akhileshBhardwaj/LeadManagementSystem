import { useEffect, useRef } from "react";
import {
  LEGACY_NOTIFIED_KEY,
  notifiedKey,
  readJSON,
  writeJSON,
} from "../utils/storage";
import { getFollowups, isDueToday } from "../utils/response";

function readNotified(userId) {
  const stored = readJSON(notifiedKey(userId), null);
  if (Array.isArray(stored)) return new Set(stored);
  const legacy = readJSON(LEGACY_NOTIFIED_KEY, null);
  return new Set(Array.isArray(legacy) ? legacy : []);
}

// Browser notifications only cover the departments this signed-in user may open.
export default function useReminders(
  leads,
  userId,
  departments = [],
  enabled = true,
) {
  const notifiedRef = useRef(null);
  const requestedRef = useRef(false);
  if (notifiedRef.current === null) notifiedRef.current = readNotified(userId);

  useEffect(() => {
    if (
      !enabled ||
      typeof window === "undefined" ||
      !("Notification" in window)
    )
      return undefined;
    if (!requestedRef.current && Notification.permission === "default") {
      requestedRef.current = true;
      Notification.requestPermission().catch(() => {});
    }

    const names = new Map(departments.map((item) => [item.id, item.name]));
    const check = () => {
      if (Notification.permission !== "granted") return;
      getFollowups(leads).forEach((followup) => {
        if (!isDueToday(followup.nextDate)) return;
        const key = `${followup.leadId}:${followup.responseId}`;
        if (notifiedRef.current.has(key)) return;
        const department =
          names.get(followup.lead.departmentId) || "Department";
        try {
          new Notification(`Talk to this lead today · ${department}`, {
            body: `${followup.lead.name} — ${followup.lead.course || "Not set"}${followup.person ? ` · ${followup.person}` : ""}`,
            tag: key,
          });
          notifiedRef.current.add(key);
          writeJSON(notifiedKey(userId), [...notifiedRef.current]);
        } catch {
          // notification might be blocked by the platform
        }
      });
    };

    check();
    const timer = window.setInterval(check, 60000);
    return () => window.clearInterval(timer);
  }, [leads, userId, departments, enabled]);
}
