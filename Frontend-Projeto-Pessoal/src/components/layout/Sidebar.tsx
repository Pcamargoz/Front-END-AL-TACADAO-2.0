import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Package, 
  Users, 
  Settings, 
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Início", exact: true },
  { to: "/produtos", icon: Package, label: "Produtos" },
  { to: "/usuarios", icon: Users, label: "Usuários" },
  { to: "/configuracoes", icon: Settings, label: "Configurações" },
];

interface SidebarProps {
  expanded?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ expanded = true, onToggle, isMobile = false }: SidebarProps) {
  const location = useLocation();
  
  // Mobile: bottom navigation
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300
                ${isActive ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "text-tertiary hover:text-secondary hover:bg-surface-secondary"}
              `}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    );
  }

  // Desktop: collapsible sidebar
  return (
    <motion.aside
      className="fixed top-0 left-0 bottom-0 z-40 bg-surface border-r border-border flex flex-col shadow-lg"
      animate={{ width: expanded ? 256 : 72 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-border overflow-hidden">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
          <span className="text-lg font-bold text-white">AT</span>
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
              <span className="text-title-sm text-primary font-semibold whitespace-nowrap">
                AL-TACADÃO
              </span>
              <p className="text-caption text-tertiary tracking-wider uppercase whitespace-nowrap font-medium">
                Sistema
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-hidden">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => {
          const isCurrentActive = exact ? location.pathname === to : location.pathname.startsWith(to);
          
          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `
                relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm" 
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
            {/* Active indicator */}
            {isCurrentActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </NavLink>
        );
        })}
      </nav>

      {/* Bottom Section */}
      {onToggle && (
        <div className="px-3 pb-4 pt-3 border-t border-border overflow-hidden">
          {/* Collapse Toggle */}
          <button 
            onClick={onToggle} 
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-secondary hover:bg-surface-secondary hover:text-primary transition-all duration-200"
          >
            <motion.div 
              animate={{ rotate: expanded ? 180 : 0 }} 
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex-shrink-0"
            >
              <ChevronRight size={18} />
            </motion.div>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-body-sm font-medium whitespace-nowrap"
                >
                  Recolher
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}
    </motion.aside>
  );
}
