const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "—";
  return inr.format(amount);
}

export function formatBudget(min, max) {
  const from = Number(min) || 0;
  const to = Number(max) || 0;
  if (!from && !to) return "—";
  if (from && to) return `${formatINR(from)} – ${formatINR(to)}`;
  if (to) return `Up to ${formatINR(to)}`;
  return `${formatINR(from)}+`;
}

export function initials(name) {
  const parts = String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

export function pluralize(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function cx(...values) {
  return values.filter(Boolean).join(" ");
}
