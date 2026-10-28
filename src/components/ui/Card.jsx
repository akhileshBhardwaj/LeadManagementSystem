import { cx } from "../../utils/format";
const PADDING = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };
export default function Card({
  as: Tag = "div",
  padding = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <Tag
      className={cx(
        "rounded-2xl border border-border bg-surface shadow-(--shadow-soft)",
        PADDING[padding],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
