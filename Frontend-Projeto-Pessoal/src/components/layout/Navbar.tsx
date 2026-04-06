import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, LogOut, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../../hooks/useCart";

/* Apple Style Navbar Component */
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Inicio", exact: true },
    { to: "/produtos", label: "Produtos" },
  ];

  return (
    <>
       <header className="navbar min-h-[56px] lg:min-h-[48px]">
        <div className="flex items-center gap-6 flex-1">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-accent)]">
              <span className="text-sm font-semibold text-white tracking-tight">AT</span>
            </div>
            <span className="hidden sm:block text-[17px] font-semibold text-[var(--color-text-primary)] tracking-tight">
              AL-TACADAO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) => 
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Desktop Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-sm mx-6">
          <form onSubmit={handleSearch} className="w-full relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-[14px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-subtle)]"
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="lg:hidden btn btn-ghost btn-icon"
            aria-label="Buscar"
          >
            <Search size={20} />
          </button>

          {/* Cart */}
           <Link to="/carrinho" className="btn btn-ghost btn-icon relative min-w-[44px] min-h-[44px]" aria-label="Carrinho">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems > 99 ? "99+" : totalItems}</span>
            )}
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 btn btn-ghost px-3"
                aria-label="Menu do usuario"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center">
                  <User size={16} className="text-[var(--color-accent)]" />
                </div>
                <span className="hidden sm:block text-[14px] text-[var(--color-text-secondary)]">
                  {user?.nome || user?.login}
                </span>
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 min-w-[220px] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 p-2"
                    >
                      {/* User Info */}
                      <div className="px-3 py-3 border-b border-[var(--color-divider)] mx-2">
                        <p className="text-[15px] font-medium text-[var(--color-text-primary)] truncate">
                          {user?.nome || user?.login}
                        </p>
                        <p className="text-[13px] text-[var(--color-text-tertiary)] truncate">
                          {user?.email}
                        </p>
                        <span className="inline-block mt-2 text-[11px] font-semibold tracking-wider uppercase px-2 py-1 rounded-md bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                          {user?.roles?.[0]}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="p-1">
                        <Link
                          to="/empresas"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-[14px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-all duration-150"
                        >
                          <Building2 size={18} />
                          Minhas Empresas
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] text-[var(--color-error)] hover:bg-[var(--color-error-bg)] rounded-lg transition-all duration-150"
                        >
                          <LogOut size={18} />
                          Sair
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost text-[14px]">
                Entrar
              </Link>
              <Link to="/cadastro" className="btn btn-primary btn-sm">
                Cadastrar
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden btn btn-ghost btn-icon"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed top-[48px] left-0 right-0 z-50 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] p-4"
          >
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)]" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
                autoFocus
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-0 top-[56px] z-50 bg-[var(--color-bg-primary)]"
            >
            <nav className="flex flex-col p-6 gap-2">
              {navLinks.map(({ to, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-3 px-4 rounded-xl text-[17px] font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              
              <div className="divider" />
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/empresas"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 px-4 rounded-xl text-[17px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] flex items-center gap-3"
                  >
                    <Building2 size={20} />
                    Minhas Empresas
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="py-3 px-4 rounded-xl text-[17px] font-medium text-[var(--color-error)] hover:bg-[var(--color-error-bg)] flex items-center gap-3"
                  >
                    <LogOut size={20} />
                    Sair
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary w-full"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/cadastro"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary w-full"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
