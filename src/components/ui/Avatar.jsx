import { cx, initials } from "../../utils/format";
const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};
export default function Avatar({ name, size = "md", className = "" }) {
  const tone =
    [...String(name || "")].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    6;
  return (
    <span
      aria-hidden="true"
      data-avatar-tone={tone}
      className={cx(
        "user-avatar inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-border",
        SIZES[size] || SIZES.md,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
