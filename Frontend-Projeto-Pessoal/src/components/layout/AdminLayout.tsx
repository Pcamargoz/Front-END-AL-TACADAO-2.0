import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ChevronRight,
  LogOut,
  User,
  Store,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";

const NAV_ITEMS = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/usuarios", icon: Users, label: "Usuários" },
  { to: "/admin/produtos", icon: Package, label: "Produtos" },
];

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

function AdminSidebar({ expanded, onToggle, isMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Mobile: bottom navigation
  if (isMobile) {
    return (
      <nav className="bottom-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} style={isActive ? { color: "#00FF87" } : {}} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <Link to="/" className="bottom-nav-item">
          <Store size={20} />
          <span>Loja</span>
        </Link>
        <button onClick={handleLogout} className="bottom-nav-item">
          <LogOut size={20} className="text-[#EF4444]/60" />
          <span className="text-[#EF4444]/60">Sair</span>
        </button>
      </nav>
    );
  }

  // Desktop: collapsible sidebar
  return (
    <motion.aside
      className="sidebar"
      animate={{ width: expanded ? 240 : 64 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 overflow-hidden"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-sm flex items-center justify-center bg-[#00FF87]">
          <span className="font-display text-lg text-[#090B10] tracking-wide">AT</span>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <span className="font-display text-lg text-[#F5F5F5] tracking-wide whitespace-nowrap">
                AL-TACADÃO
              </span>
              <p className="text-[10px] text-[#4B5563] tracking-widest uppercase whitespace-nowrap">
                Painel Admin
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-hidden">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="admin-sidebar-indicator"
                    className="sidebar-indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
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

        <div className="divider my-2" />

        {/* Link para Loja */}
        <Link
          to="/"
          className="sidebar-item"
        >
          <Store size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Ver Loja
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </nav>

      {/* Bottom */}
      <div
        className="px-2 pb-4 pt-3 overflow-hidden"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* User info */}
        <div className="sidebar-item cursor-default select-none mb-2">
          <div
            className="flex-shrink-0 w-7 h-7 rounded-sm flex items-center justify-center"
            style={{ background: "rgba(0,255,135,0.15)", border: "1px solid rgba(0,255,135,0.25)" }}
          >
            <User size={12} className="text-[#00FF87]" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden min-w-0"
              >
                <p className="truncate text-sm font-medium text-[#9CA3AF]">
                  {user?.nome || user?.login}
                </p>
                <p className="truncate text-[10px] text-[#00FF87] tracking-wider uppercase">
                  Gerente
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="sidebar-item w-full text-left">
          <LogOut size={16} className="flex-shrink-0 text-[#EF4444]/60" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap text-sm text-[#EF4444]/60"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button onClick={onToggle} className="sidebar-item w-full text-left mt-1">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.28 }}>
            <ChevronRight size={16} className="flex-shrink-0" />
          </motion.div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm whitespace-nowrap"
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

export function AdminLayout() {
  const [expanded, setExpanded] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="app-layout relative bg-[#090B10]">
      <AdminSidebar
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        isMobile={isMobile}
      />

      <motion.main
        className="relative min-h-screen"
        animate={{
          paddingLeft: isMobile ? 0 : expanded ? 240 : 64,
          paddingBottom: isMobile ? 64 : 0,
        }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
