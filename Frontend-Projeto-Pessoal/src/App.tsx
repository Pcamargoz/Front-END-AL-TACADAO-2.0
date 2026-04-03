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

          {/* ===== Pending Approval Route (allows pending users) ===== */}
          <Route element={<ProtectedRoute allowPending />}>
            {/* Page for users waiting approval */}
            <Route path="/aguardando-empresa" element={<PendingCompanyPage />} />
          </Route>

          {/* ===== Protected Routes (Requires approved company) ===== */}
          <Route element={<ProtectedRoute />}>
            {/* Supplier Registration - para criar empresa manualmente */}
            <Route path="/fornecedor/cadastro" element={<SupplierRegisterPage />} />
          </Route>

          {/* ===== Dashboard Routes (With AdminLayout, requires company) ===== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              {/* Dashboard - acessível a todos autenticados com empresa */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Profile - any authenticated user with company */}
              <Route path="/perfil" element={<ProfilePage />} />
              
              {/* Produtos - precisa ter empresa */}
              <Route path="/estoque" element={<InventoryPage />} />
              
              {/* Fornecedores - qualquer autenticado com empresa pode ver/criar */}
              <Route path="/fornecedores" element={<SuppliersPage />} />
            </Route>
          </Route>

          {/* ===== Admin Routes (GERENTE Only) ===== */}
          <Route element={<ProtectedRoute requiredRole="GERENTE" />}>
            <Route element={<AdminLayout />}>
              {/* Admin Dashboard */}
              <Route path="/admin" element={<DashboardPage />} />
              {/* Gestão de Usuários - onde gerente aprova usuários pendentes */}
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
