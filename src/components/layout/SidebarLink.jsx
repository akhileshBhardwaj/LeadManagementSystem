import { NavLink, useLocation } from "react-router-dom";
import { cx } from "../../utils/format";

const TONES = {
  parent:
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring",
  child:
    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring",
};

const ACTIVE = {
  parent: "sidebar-link-active font-semibold",
  child: "sidebar-link-active font-semibold",
};

const IDLE = {
  parent: "sidebar-link-idle",
  child: "sidebar-link-idle",
};

export default function SidebarLink({
  to,
  label,
  icon: Icon,
  end = false,
  badge = 0,
  tone = "parent",
  onClose,
}) {
  const location = useLocation();
  const IconSize = tone === "parent" ? "h-5 w-5" : "h-3.5 w-3.5";

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      className={() =>
        cx(
          TONES[tone],
          isActive(location.pathname, to, end) ? ACTIVE[tone] : IDLE[tone],
        )
      }
    >
      {Icon ? <Icon className={cx(IconSize, "shrink-0")} /> : null}
      <span className="flex-1 truncate">{label}</span>
      {badge > 0 && (
        <span className="rounded-full bg-danger-soft px-1.5 py-0.5 text-[10px] font-semibold text-on-danger-soft">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function isActive(pathname, to, end) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}
