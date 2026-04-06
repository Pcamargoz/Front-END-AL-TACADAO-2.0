import { Home, Package, ShoppingBag, Building2 } from "lucide-react";
import { NavLink } from "react-router-dom";

export function BottomNavigation() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="bottom-nav-item">
        <Home size={20} />
        Início
      </NavLink>
      <NavLink to="/produtos" className="bottom-nav-item">
        <Package size={20} />
        Produtos
      </NavLink>
      <NavLink to="/carrinho" className="bottom-nav-item">
        <ShoppingBag size={20} />
        Carrinho
      </NavLink>
      <NavLink to="/empresas" className="bottom-nav-item">
        <Building2 size={20} />
        Empresas
      </NavLink>
    </nav>
  );
}