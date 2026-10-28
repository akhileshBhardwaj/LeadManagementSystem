import { cx } from "../../utils/format";
const VARIANTS = {
  primary: "ui-btn-primary",
  secondary: "ui-btn-secondary",
  ghost: "ui-btn-ghost",
  danger: "ui-btn-danger",
};
const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "h-10 w-10",
};
export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <Tag
      type={Tag === "button" ? type : undefined}
      className={cx(base, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  );
}
