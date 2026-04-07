import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Dumbbell size={18} color="#fff" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
              }}
            >
              AL-TACADÃO
            </span>
          </div>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-tertiary)", lineHeight: "1.6", maxWidth: "280px" }}>
            A plataforma B2B líder em distribuição de suplementos esportivos de alta performance.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ fontSize: "13px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
            Navegação
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[
              { to: "/", label: "Início" },
              { to: "/produtos", label: "Produtos" },
              { to: "/login", label: "Acessar conta" },
              { to: "/cadastro", label: "Criar conta" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  fontSize: "var(--text-body-sm)",
                  color: "var(--color-text-tertiary)",
                  transition: "color var(--duration-fast) var(--ease-out)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-tertiary)")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contato */}
        <div>
          <h4 style={{ fontSize: "13px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
            Contato
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", fontSize: "var(--text-body-sm)", color: "var(--color-text-tertiary)" }}>
            <span>contato@altacadao.com.br</span>
            <span>(11) 99999-9999</span>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p style={{ fontSize: "var(--text-caption)", color: "var(--color-text-quaternary)" }}>
          © {year} AL-TACADÃO. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
