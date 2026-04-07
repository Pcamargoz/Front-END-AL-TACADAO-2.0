import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, LogOut, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../../hooks/useCart";

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
    { to: "/", label: "Início", exact: true },
    { to: "/produtos", label: "Produtos" },
  ];

  return (
    <>
      <header className="navbar" role="banner">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", flex: 1 }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }} aria-label="AL-TACADÃO - Página inicial">
            <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-accent)" }}>
              <span style={{ fontSize: "13px", fontWeight: "var(--font-weight-semibold)", color: "#fff", letterSpacing: "var(--tracking-tight)" }}>AT</span>
            </div>
            <span className="hidden sm\:inline" style={{ fontSize: "17px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", letterSpacing: "var(--tracking-tight)" }}>
              AL-TACADÃO
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md\:flex" style={{ alignItems: "center", gap: "var(--space-1)", marginLeft: "var(--space-4)" }} aria-label="Navegação principal">
            {navLinks.map(({ to, label, exact }) => (
              <NavLink key={to} to={to} end={exact} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Desktop Search */}
        <div className="hidden lg\:flex" style={{ alignItems: "center", flex: 1, maxWidth: "320px", margin: "0 var(--space-6)" }}>
          <form onSubmit={handleSearch} style={{ width: "100%", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-quaternary)" }} />
            <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field" style={{ paddingLeft: "38px", height: "36px", fontSize: "14px", borderRadius: "var(--radius-md)" }} />
          </form>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          {/* Mobile Search */}
          <button onClick={() => setSearchOpen(!searchOpen)} className="lg\:hidden btn btn-ghost btn-icon" aria-label="Buscar">
            <Search size={20} />
          </button>

          {/* Cart */}
          <Link to="/carrinho" className="btn btn-ghost btn-icon" style={{ position: "relative", minWidth: "44px", minHeight: "44px" }} aria-label="Carrinho">
            <ShoppingBag size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems > 99 ? "99+" : totalItems}</span>}
          </Link>

          {/* User */}
          {isAuthenticated ? (
            <div style={{ position: "relative" }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "0 var(--space-3)" }} aria-label="Menu do usuário">
                <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", background: "var(--color-accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={16} style={{ color: "var(--color-accent)" }} />
                </div>
                <span className="hidden sm\:inline" style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>{user?.nome || user?.login}</span>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute", right: 0, top: "100%", marginTop: "var(--space-2)", minWidth: "220px",
                        background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", zIndex: 50, padding: "var(--space-2)",
                      }}
                    >
                      {/* User Info */}
                      <div style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-divider)", margin: "0 var(--space-2)" }}>
                        <p style={{ fontSize: "15px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }} className="truncate">{user?.nome || user?.login}</p>
                        <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }} className="truncate">{user?.email}</p>
                        <span className="badge badge-accent" style={{ marginTop: "var(--space-2)" }}>{user?.roles?.[0]}</span>
                      </div>

                      {/* Menu Items */}
                      <div style={{ padding: "var(--space-1)" }}>
                        <Link to="/empresas" onClick={() => setUserMenuOpen(false)}
                          style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) var(--space-3)", fontSize: "14px", color: "var(--color-text-secondary)", borderRadius: "var(--radius-md)", transition: "all var(--duration-fast)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-hover)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}>
                          <Building2 size={18} /> Minhas Empresas
                        </Link>
                        <button onClick={handleLogout}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) var(--space-3)", fontSize: "14px", color: "var(--color-error)", borderRadius: "var(--radius-md)", transition: "all var(--duration-fast)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-error-bg)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <LogOut size={18} /> Sair
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: "14px" }}>Entrar</Link>
              <Link to="/cadastro" className="btn btn-primary btn-sm">Cadastrar</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md\:hidden btn btn-ghost btn-icon" aria-label="Menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="lg\:hidden"
            style={{ position: "fixed", top: "var(--navbar-height)", left: 0, right: 0, zIndex: 50, background: "var(--color-bg-primary)", borderBottom: "1px solid var(--color-border)", padding: "var(--space-4)" }}>
            <form onSubmit={handleSearch} style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-quaternary)" }} />
              <input type="text" placeholder="Buscar produtos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field" style={{ paddingLeft: "38px" }} autoFocus />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, background: "var(--color-overlay)", backdropFilter: "blur(4px)", zIndex: 40 }} className="md\:hidden" onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md\:hidden" style={{ position: "fixed", inset: 0, top: "var(--navbar-height)", zIndex: 50, background: "var(--color-bg-primary)" }}>
              <nav style={{ display: "flex", flexDirection: "column", padding: "var(--space-6)", gap: "var(--space-2)" }}>
                {navLinks.map(({ to, label, exact }) => (
                  <NavLink key={to} to={to} end={exact} onClick={() => setMobileMenuOpen(false)}
                    style={{ padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-lg)", fontSize: "17px", fontWeight: 500 }}
                    className={({ isActive }) => isActive
                      ? "nav-link"
                      : "nav-link"
                    }>
                    {({ isActive }) => (
                      <span style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)" }}>{label}</span>
                    )}
                  </NavLink>
                ))}

                <hr className="divider" />

                {isAuthenticated ? (
                  <>
                    <Link to="/empresas" onClick={() => setMobileMenuOpen(false)}
                      style={{ padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-lg)", fontSize: "17px", fontWeight: 500, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <Building2 size={20} /> Minhas Empresas
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      style={{ padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-lg)", fontSize: "17px", fontWeight: 500, color: "var(--color-error)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <LogOut size={20} /> Sair
                    </button>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary w-full">Entrar</Link>
                    <Link to="/cadastro" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary w-full">Cadastrar</Link>
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
