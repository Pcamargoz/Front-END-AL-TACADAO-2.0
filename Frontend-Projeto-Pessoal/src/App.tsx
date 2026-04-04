import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { FornecedorProvider } from "./context/FornecedorContext";
import { ProtectedRoute, ProtectedFornecedorRoute } from "./auth/ProtectedRoute";
import { CartProvider } from "./hooks/useCart";

// Layouts
import { StoreLayout } from "./components/layout/StoreLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Public Pages
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

// Protected Pages (JWT only)
import { EmpresasPage } from "./pages/EmpresasPage";
import { EmpresaCadastrarPage } from "./pages/EmpresaCadastrarPage";

// Protected Pages (JWT + Fornecedor Token)
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { InventoryPage } from "./pages/InventoryPage";
import { EmpresaUsuariosPage } from "./pages/EmpresaUsuariosPage";

export default function App() {
  return (
    <AuthProvider>
      <FornecedorProvider>
        <CartProvider>
          <Routes>
            {/* ===== Auth Routes (No Layout) ===== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            {/* Legacy redirect */}
            <Route path="/register" element={<Navigate to="/cadastro" replace />} />

            {/* ===== Public Store Routes (StoreLayout) ===== */}
            <Route element={<StoreLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/produtos/:id" element={<ProductDetailPage />} />
              <Route path="/carrinho" element={<CartPage />} />
            </Route>

            {/* ===== JWT obrigatório: Lista e cadastro de empresas ===== */}
            <Route element={<ProtectedRoute />}>
              <Route path="/empresas" element={<EmpresasPage />} />
              <Route path="/empresas/cadastrar" element={<EmpresaCadastrarPage />} />
            </Route>

            {/* ===== JWT + Fornecedor Token: Painel da empresa ===== */}
            <Route element={<ProtectedFornecedorRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/empresas/:id/painel" element={<DashboardPage />} />
                <Route path="/empresas/:id/painel/estoque" element={<InventoryPage />} />
                <Route path="/empresas/:id/painel/usuarios" element={<EmpresaUsuariosPage />} />
                <Route path="/empresas/:id/painel/perfil" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* ===== Legacy Redirects ===== */}
            <Route path="/admin" element={<Navigate to="/empresas" replace />} />
            <Route path="/admin/*" element={<Navigate to="/empresas" replace />} />
            <Route path="/dashboard" element={<Navigate to="/empresas" replace />} />
            <Route path="/fornecedores" element={<Navigate to="/empresas" replace />} />
            <Route path="/fornecedor/cadastro" element={<Navigate to="/empresas/cadastrar" replace />} />
            <Route path="/estoque" element={<Navigate to="/empresas" replace />} />
            <Route path="/perfil" element={<Navigate to="/empresas" replace />} />
            <Route path="/aguardando-empresa" element={<Navigate to="/empresas" replace />} />

            {/* ===== Catch-all ===== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </FornecedorProvider>
    </AuthProvider>
  );
}
