import { useState } from "react";
import { Outlet, NavLink, useNavigate, useParams, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ChevronRight,
  LogOut,
  User,
  Store,
  Building2,
  DoorOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { useFornecedor } from "../../context/FornecedorContext";
import { useIsMobile } from "../../hooks/useIsMobile";

function useNavItems() {
  const { id } = useParams();
  const fornecedorId = id;
  const base = `/empresas/${fornecedorId}/painel`;

  return [
    { to: base, icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: `${base}/estoque`, icon: Package, label: "Estoque" },
    { to: `${base}/usuarios`, icon: Users, label: "Usuários" },
    { to: `${base}/perfil`, icon: User, label: "Perfil" },
  ];
}

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

function AdminSidebar({ expanded, onToggle, isMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const { nome: fornecedorNome, role, sairFornecedor } = useFornecedor();
  const navigate = useNavigate();
  const navItems = useNavItems();

  const handleLogout = async () => {
    sairFornecedor();
    await logout();
    navigate("/login");
  };

  const handleSairEmpresa = () => {
    sairFornecedor();
    navigate("/empresas");
  };

  // Mobile: bottom navigation
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
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
            onClick={handleSairEmpresa} 
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-amber-500/70"
          >
            <DoorOpen size={20} />
            <span className="text-[10px] font-medium">Sair</span>
          </button>
        </div>
      </nav>
    );
  }

  // Desktop: collapsible sidebar
  return (
    <motion.aside
      className="fixed top-0 left-0 bottom-0 z-40 bg-surface border-r border-border flex flex-col"
      animate={{ width: expanded ? 256 : 72 }}
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
                AL-TACADÃO
              </span>
              <p className="text-caption text-tertiary tracking-wider uppercase whitespace-nowrap">
                Painel Admin
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fornecedor Info */}
      {fornecedorNome && (
        <div className="px-3 py-4 border-b border-border overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Building2 size={16} className="text-accent" />
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
                    {fornecedorNome}
                  </p>
                  <p className="truncate text-caption text-accent uppercase tracking-wider">
                    {role}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-hidden">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
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

        <div className="my-3 border-t border-border" />

        {/* Link para Loja */}
        <Link 
          to="/" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-secondary hover:bg-surface-secondary hover:text-primary transition-all duration-200"
        >
          <Store size={20} className="flex-shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-body-sm font-medium whitespace-nowrap"
              >
                Ver Loja
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
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
                  {user?.roles?.[0] ?? "USUARIO"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sair da Empresa */}
        <button 
          onClick={handleSairEmpresa} 
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-500/80 hover:bg-amber-500/10 transition-all duration-200"
        >
          <DoorOpen size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-body-sm font-medium whitespace-nowrap"
              >
                Sair da Empresa
              </motion.span>
            )}
          </AnimatePresence>
        </button>

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
                Sair
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
    <div className="min-h-screen bg-surface">
      <AdminSidebar
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        isMobile={isMobile}
      />

      <motion.main
        className="min-h-screen"
        animate={{
          marginLeft: isMobile ? 0 : expanded ? 256 : 72,
          paddingBottom: isMobile ? 80 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
