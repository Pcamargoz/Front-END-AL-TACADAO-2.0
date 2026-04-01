import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/users",     icon: Users,           label: "Users"       },
  { to: "/suppliers", icon: Truck,           label: "Suppliers"   },
  { to: "/inventory", icon: Package,         label: "Inventory"   },
];

interface Props {
  expanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export function Sidebar({ expanded, onToggle, isMobile }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  /* ── Mobile: bottom navigation bar ── */
  if (isMobile) {
    return (
      <nav className="bottom-nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
          >
            {({ isActive }) => (
              <>
                <Icon size={19} style={isActive ? { color: "#E8A020" } : {}} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="bottom-nav-item">
          <LogOut size={19} style={{ color: "rgba(229,72,77,0.6)" }} />
          <span style={{ color: "rgba(229,72,77,0.6)" }}>Sign out</span>
        </button>
      </nav>
    );
  }

  /* ── Desktop: collapsible sidebar ── */
  return (
    <motion.aside
      className="sidebar"
      animate={{ width: expanded ? 220 : 60 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-5 overflow-hidden"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#E8A020" }}
        >
          <span
            style={{
              fontFamily: "'Barlow Condensed', system-ui, sans-serif",
              fontWeight: 700, fontSize: "0.8rem", color: "#0E0E10", letterSpacing: "0.02em",
            }}
          >
            AT
          </span>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <span style={{
                fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                fontWeight: 700, fontSize: "0.95rem", color: "#EFEFEF",
                letterSpacing: "0.04em", whiteSpace: "nowrap",
              }}>
                AL-TACADAO
              </span>
              <p style={{ fontSize: "0.65rem", color: "#3C3C44", whiteSpace: "nowrap", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Management
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-hidden">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-indicator"
                    className="sidebar-indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon size={17} className="flex-shrink-0" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.13 }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 pt-3 overflow-hidden"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {/* User info */}
        <div className="sidebar-item cursor-default select-none mb-1">
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(232,160,32,0.15)", border: "1px solid rgba(232,160,32,0.2)" }}
          >
            <User size={11} style={{ color: "#E8A020" }} />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden min-w-0"
              >
                <p className="truncate" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#A1A1AA" }}>
                  {user?.nome || user?.login}
                </p>
                <p className="truncate" style={{ fontSize: "0.65rem", color: "#3C3C44", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {user?.roles?.[0]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="sidebar-item w-full text-left">
          <LogOut size={15} className="flex-shrink-0" style={{ color: "rgba(229,72,77,0.55)" }} />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap text-sm"
                style={{ color: "rgba(229,72,77,0.55)" }}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button onClick={onToggle} className="sidebar-item w-full text-left mt-1">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.28 }}>
            <ChevronRight size={15} className="flex-shrink-0" />
          </motion.div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
