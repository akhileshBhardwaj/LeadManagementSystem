import { cx } from "../../utils/format";
const TONES = {
  slate: "badge-slate",
  indigo: "badge-indigo",
  sky: "badge-sky",
  amber: "badge-amber",
  emerald: "badge-emerald",
  rose: "badge-rose",
};
export default function Badge({ tone = "slate", className = "", children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        TONES[tone] || TONES.slate,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current opacity-75"
      />
      {children}
    </span>
  );
}
