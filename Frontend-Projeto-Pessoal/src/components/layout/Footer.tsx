import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";

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
                href="#"
                className="w-9 h-9 rounded-sm bg-[#1A1D24] flex items-center justify-center text-[#9CA3AF] hover:text-[#00FF87] hover:bg-[#00FF87]/10 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-sm bg-[#1A1D24] flex items-center justify-center text-[#9CA3AF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-sm bg-[#1A1D24] flex items-center justify-center text-[#9CA3AF] hover:text-[#00FF87] hover:bg-[#00FF87]/10 transition-colors"
              >
                <Twitter size={18} />
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
