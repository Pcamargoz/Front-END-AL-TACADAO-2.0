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
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/users", icon: Users, label: "Users" },
  { to: "/suppliers", icon: Truck, label: "Suppliers" },
  { to: "/inventory", icon: Package, label: "Inventory" },
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

  /* Mobile: bottom navigation bar */
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all
                ${isActive ? "text-accent" : "text-tertiary hover:text-secondary"}
              `}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
          <button 
            onClick={handleLogout} 
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-red-500/70"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-medium">Sign out</span>
          </button>
        </div>
      </nav>
    );
  }

  /* Desktop: collapsible sidebar */
  return (
    <motion.aside
      className="fixed top-0 left-0 bottom-0 z-40 bg-surface border-r border-border flex flex-col"
      animate={{ width: expanded ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border overflow-hidden">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <span className="text-lg font-semibold text-white">AT</span>
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
              <span className="text-title-sm text-primary whitespace-nowrap">
                AL-TACADAO
              </span>
              <p className="text-caption text-tertiary tracking-wider uppercase whitespace-nowrap">
                Management
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-hidden">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) => `
              relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              ${isActive 
                ? "bg-accent/10 text-accent" 
                : "text-secondary hover:bg-surface-secondary hover:text-primary"
              }
            `}
          >
            <Icon size={20} className="flex-shrink-0" />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-body-sm font-medium whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 border-t border-border overflow-hidden">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-surface-secondary flex items-center justify-center">
            <User size={16} className="text-secondary" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden min-w-0"
              >
                <p className="truncate text-body-sm font-medium text-primary">
                  {user?.nome || user?.login}
                </p>
                <p className="truncate text-caption text-tertiary uppercase tracking-wider">
                  {user?.roles?.[0]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500/80 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-body-sm font-medium whitespace-nowrap"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button 
          onClick={onToggle} 
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-secondary hover:bg-surface-secondary hover:text-primary transition-all duration-200 mt-1"
        >
          <motion.div 
            animate={{ rotate: expanded ? 180 : 0 }} 
            transition={{ duration: 0.3 }}
          >
            <ChevronRight size={18} className="flex-shrink-0" />
          </motion.div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-body-sm font-medium whitespace-nowrap"
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
