import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  ChevronRight,
  LogOut,
  Zap,
  User,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { to: "/home",         icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/usuarios",     icon: Users,           label: "Usuários"     },
  { to: "/fornecedores", icon: Truck,           label: "Fornecedores" },
  { to: "/estoque",      icon: Package,         label: "Estoque"      },
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
              end={to === "/home"}
              className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
            >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  className="nav-icon"
                  style={isActive ? { color: "#00f0ff" } : {}}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="bottom-nav-item">
          <LogOut size={20} style={{ color: "rgba(244,63,94,0.6)" }} />
          <span style={{ color: "rgba(244,63,94,0.6)" }}>Sair</span>
        </button>
      </nav>
    );
  }

  /* ── Desktop: collapsible sidebar ── */
  return (
    <motion.aside
      className="sidebar"
      animate={{ width: expanded ? 220 : 60 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-5 border-b border-white/5 overflow-hidden">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center animate-pulse-glow"
          style={{ background: "linear-gradient(135deg,#00c8d4,#6d28d9)" }}
        >
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="text-sm font-bold gradient-text-cyan whitespace-nowrap">NUCLEUS</span>
              <p className="text-xs text-slate-600 whitespace-nowrap">Control Center</p>
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
            end={to === "/home"}
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
                <Icon size={18} className="sidebar-icon flex-shrink-0" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
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
      <div className="px-2 pb-4 border-t border-white/5 pt-3 overflow-hidden">
        {/* User info */}
        <div className="sidebar-item cursor-default select-none mb-1">
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#00c8d4,#6d28d9)" }}
          >
            <User size={12} className="text-white" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-xs font-medium text-slate-300 truncate">{user?.nome || user?.login}</p>
                <p className="text-[10px] text-slate-600 truncate">{user?.roles?.[0]}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="sidebar-item w-full text-left">
          <LogOut size={16} className="flex-shrink-0 text-rose-500/60" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-rose-500/60 whitespace-nowrap text-sm"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button onClick={onToggle} className="sidebar-item w-full text-left mt-1">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronRight size={16} className="flex-shrink-0" />
          </motion.div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap text-xs"
              >
                Recolher
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
