const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY = 86400000;

export function toISODate(value = new Date()) {
  const d = new Date(value);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${date}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function shiftISODate(days) {
  return toISODate(new Date(Date.now() + days * DAY));
}

export function parseISODate(iso) {
  if (!iso) return null;
  const [year, month, day] = String(iso).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function formatDate(iso) {
  const d = parseISODate(iso);
  if (!d) return "—";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(value) {
  if (!value) return "—";
  const [hourText, minuteText] = String(value).split(":");
  const hour = Number(hourText);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const shown = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(shown).padStart(2, "0")}:${String(Number(minuteText) || 0).padStart(2, "0")} ${suffix}`;
}

export function formatDateTime(value) {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return "—";
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${formatTime(`${hours}:${minutes}`)}`;
}

export function diffInDays(iso) {
  const target = parseISODate(iso);
  const today = parseISODate(todayISO());
  if (!target || !today) return 0;
  return Math.round((target - today) / DAY);
}

export function isToday(iso) {
  return Boolean(iso) && iso === todayISO();
}

export function isOverdue(iso) {
  return Boolean(iso) && diffInDays(iso) < 0;
}

export function isPastDate(iso) {
  return Boolean(iso) && diffInDays(iso) < 0;
}

export function relativeDay(iso) {
  const days = diffInDays(iso);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `In ${days} days`;
}

export function sortByISODate(list, selector, direction = "asc") {
  const factor = direction === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    const left = selector(a) || "";
    const right = selector(b) || "";
    return left < right ? -factor : left > right ? factor : 0;
  });
}
