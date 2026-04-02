import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../../hooks/useCart";

export function Navbar() {
  const { user, isAuthenticated, isManager, logout } = useAuth();
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
    { to: "/", label: "Início", exact: true },
    { to: "/produtos", label: "Produtos" },
    { to: "/categorias", label: "Categorias" },
  ];

  return (
    <>
      <header className="navbar">
        <div className="flex items-center gap-4 flex-1">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-[#00FF87]">
              <span className="font-display text-xl text-[#090B10] tracking-wide">AT</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl tracking-wide text-[#F5F5F5]">
                AL-TACADÃO
              </span>
              <p className="text-[10px] text-[#4B5563] tracking-widest uppercase">
                Suplementos B2B
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-8">
            {navLinks.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Desktop Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="w-full relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 py-2 bg-[#111318] text-sm"
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="lg:hidden btn btn-ghost btn-icon"
          >
            <Search size={20} />
          </button>

          {/* Cart */}
          <Link to="/carrinho" className="btn btn-ghost btn-icon relative">
            <ShoppingCart size={20} />
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
              >
                <div className="w-8 h-8 rounded-sm bg-[#00FF87]/10 border border-[#00FF87]/25 flex items-center justify-center">
                  <User size={16} className="text-[#00FF87]" />
                </div>
                <span className="hidden sm:block text-sm text-[#9CA3AF]">
                  {user?.nome || user?.login}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-[#111318] border border-[#1A1D24] rounded-sm shadow-xl z-50"
                    >
                      <div className="p-3 border-b border-[#1A1D24]">
                        <p className="text-sm font-medium text-[#F5F5F5]">{user?.nome || user?.login}</p>
                        <p className="text-xs text-[#4B5563]">{user?.email}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm bg-[#00FF87]/10 text-[#00FF87]">
                          {user?.roles?.[0]}
                        </span>
                      </div>
                      <div className="p-1">
                        {isManager && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-[#9CA3AF] hover:text-[#F5F5F5] hover:bg-[#1A1D24] rounded-sm transition-colors"
                          >
                            <LayoutDashboard size={16} />
                            Painel Admin
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-sm transition-colors"
                        >
                          <LogOut size={16} />
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
              <Link to="/login" className="btn btn-ghost text-sm">
                Entrar
              </Link>
              <Link to="/cadastro" className="btn btn-primary text-sm">
                Cadastrar
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden btn btn-ghost btn-icon"
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
            className="lg:hidden fixed top-[72px] left-0 right-0 z-50 bg-[#090B10] border-b border-[#1A1D24] p-4"
          >
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
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
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="md:hidden fixed inset-0 top-[72px] z-50 bg-[#090B10]"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navLinks.map(({ to, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-3 px-4 rounded-sm text-lg font-medium transition-colors ${
                      isActive
                        ? "bg-[#00FF87]/10 text-[#00FF87]"
                        : "text-[#9CA3AF] hover:bg-[#1A1D24]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <div className="divider" />
              {isAuthenticated ? (
                <>
                  {isManager && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3 px-4 rounded-sm text-lg font-medium text-[#9CA3AF] hover:bg-[#1A1D24] flex items-center gap-3"
                    >
                      <LayoutDashboard size={20} />
                      Painel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="py-3 px-4 rounded-sm text-lg font-medium text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center gap-3"
                  >
                    <LogOut size={20} />
                    Sair
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
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
        )}
      </AnimatePresence>
    </>
  );
}
