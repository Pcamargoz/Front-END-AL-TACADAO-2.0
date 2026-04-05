import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-tertiary border-t border-border">
      <div className="container-apple-wide py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent">
                <span className="text-lg font-semibold text-white tracking-tight">AT</span>
              </div>
              <span className="text-lg font-semibold text-primary tracking-tight">
                AL-TACADÃO
              </span>
            </Link>
            <p className="text-body-sm text-secondary mb-6 max-w-xs">
              Sua distribuidora B2B de suplementos premium. Qualidade e preços competitivos para sua loja.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-tertiary hover:text-accent hover:bg-accent/10 transition-all duration-200"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-tertiary hover:text-accent hover:bg-accent/10 transition-all duration-200"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-tertiary hover:text-accent hover:bg-accent/10 transition-all duration-200"
                aria-label="Twitter"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-caption font-semibold text-primary uppercase tracking-wider mb-5">
              Navegação
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Início" },
                { to: "/produtos", label: "Produtos" },
                { to: "/categorias", label: "Categorias" },
                { to: "/sobre", label: "Sobre Nós" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-body-sm text-secondary hover:text-accent transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conta */}
          <div>
            <h4 className="text-caption font-semibold text-primary uppercase tracking-wider mb-5">
              Minha Conta
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/login", label: "Entrar" },
                { to: "/cadastro", label: "Cadastrar" },
                { to: "/carrinho", label: "Carrinho" },
                { to: "/pedidos", label: "Meus Pedidos" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-body-sm text-secondary hover:text-accent transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-caption font-semibold text-primary uppercase tracking-wider mb-5">
              Contato
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <span className="text-body-sm text-secondary">
                  Av. Paulista, 1000 - São Paulo, SP
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-accent flex-shrink-0" />
                <a
                  href="tel:+5511999999999"
                  className="text-body-sm text-secondary hover:text-accent transition-colors"
                >
                  (11) 99999-9999
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-accent flex-shrink-0" />
                <a
                  href="mailto:contato@altacadao.com.br"
                  className="text-body-sm text-secondary hover:text-accent transition-colors"
                >
                  contato@altacadao.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-caption text-tertiary">
            © {currentYear} AL-TACADÃO. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/termos" className="text-caption text-tertiary hover:text-secondary transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-caption text-tertiary hover:text-secondary transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
