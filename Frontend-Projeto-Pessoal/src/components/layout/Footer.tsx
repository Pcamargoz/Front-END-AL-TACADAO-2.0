import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0C10] border-t border-[#1A1D24]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-[#00FF87]">
                <span className="font-display text-xl text-[#090B10] tracking-wide">AT</span>
              </div>
              <div>
                <span className="font-display text-xl tracking-wide text-[#F5F5F5]">
                  AL-TACADÃO
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#9CA3AF] mb-4 max-w-xs">
              Sua distribuidora B2B de suplementos premium. Qualidade e preços competitivos para sua loja.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-[#1A1D24] flex items-center justify-center text-[#9CA3AF] hover:text-[#00FF87] hover:bg-[#00FF87]/10 transition-colors"
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
                className="w-9 h-9 rounded-sm bg-[#1A1D24] flex items-center justify-center text-[#9CA3AF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
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
                className="w-9 h-9 rounded-sm bg-[#1A1D24] flex items-center justify-center text-[#9CA3AF] hover:text-[#00FF87] hover:bg-[#00FF87]/10 transition-colors"
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
            <h4 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-4">
              Navegação
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Início" },
                { to: "/produtos", label: "Produtos" },
                { to: "/categorias", label: "Categorias" },
                { to: "/sobre", label: "Sobre Nós" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-[#9CA3AF] hover:text-[#00FF87] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conta */}
          <div>
            <h4 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-4">
              Minha Conta
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/login", label: "Entrar" },
                { to: "/cadastro", label: "Cadastrar" },
                { to: "/carrinho", label: "Carrinho" },
                { to: "/pedidos", label: "Meus Pedidos" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-[#9CA3AF] hover:text-[#00FF87] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-4">
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#00FF87] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#9CA3AF]">
                  Av. Paulista, 1000 - São Paulo, SP
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[#00FF87] flex-shrink-0" />
                <a
                  href="tel:+5511999999999"
                  className="text-sm text-[#9CA3AF] hover:text-[#00FF87] transition-colors"
                >
                  (11) 99999-9999
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[#00FF87] flex-shrink-0" />
                <a
                  href="mailto:contato@altacadao.com.br"
                  className="text-sm text-[#9CA3AF] hover:text-[#00FF87] transition-colors"
                >
                  contato@altacadao.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#1A1D24] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4B5563]">
            © {currentYear} AL-TACADÃO. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/termos" className="text-xs text-[#4B5563] hover:text-[#9CA3AF] transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-xs text-[#4B5563] hover:text-[#9CA3AF] transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
