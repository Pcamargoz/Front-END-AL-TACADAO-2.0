import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
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

// Protected Pages
import { SupplierRegisterPage } from "./pages/SupplierRegisterPage";
import { PendingCompanyPage } from "./pages/PendingCompanyPage";
import { ProfilePage } from "./pages/ProfilePage";

// Admin Pages
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { InventoryPage } from "./pages/InventoryPage";
import { SuppliersPage } from "./pages/SuppliersPage";

export default function App() {
  return (
    <AuthProvider>
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

          {/* ===== Protected Routes (Any authenticated user) ===== */}
          <Route element={<ProtectedRoute />}>
            {/* Supplier Registration */}
            <Route path="/fornecedor/cadastro" element={<SupplierRegisterPage />} />
            {/* Page for users waiting company linkage */}
            <Route path="/aguardando-empresa" element={<PendingCompanyPage />} />
          </Route>

          {/* ===== Dashboard Routes (With AdminLayout) ===== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              {/* Dashboard - acessível a todos autenticados */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Profile - any authenticated user */}
              <Route path="/perfil" element={<ProfilePage />} />
              
              {/* Produtos - precisa ter empresa para criar, mas pode ver */}
              <Route path="/estoque" element={<InventoryPage />} />
              
              {/* Fornecedores - qualquer autenticado pode ver/criar */}
              <Route path="/fornecedores" element={<SuppliersPage />} />
            </Route>
          </Route>

          {/* ===== Admin Routes (GERENTE Only) ===== */}
          <Route element={<ProtectedRoute requiredRole="GERENTE" />}>
            <Route element={<AdminLayout />}>
              {/* Admin Dashboard */}
              <Route path="/admin" element={<DashboardPage />} />
              {/* Gestão de Usuários */}
              <Route path="/admin/usuarios" element={<UsersPage />} />
              {/* Produtos (admin view) */}
              <Route path="/admin/produtos" element={<InventoryPage />} />
              {/* Fornecedores (admin view) */}
              <Route path="/admin/fornecedores" element={<SuppliersPage />} />
            </Route>
          </Route>

          {/* ===== Legacy Redirects ===== */}
          <Route path="/users" element={<Navigate to="/admin/usuarios" replace />} />
          <Route path="/inventory" element={<Navigate to="/estoque" replace />} />
          <Route path="/suppliers" element={<Navigate to="/fornecedores" replace />} />

          {/* ===== Catch-all ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
