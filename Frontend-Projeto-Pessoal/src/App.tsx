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

          {/* ===== Protected Routes ===== */}
          <Route element={<ProtectedRoute />}>
            {/* Supplier Registration (Any authenticated user) */}
            <Route path="/fornecedor/cadastro" element={<SupplierRegisterPage />} />
          </Route>

          {/* ===== Admin Routes (AdminLayout + Manager Only) ===== */}
          <Route element={<ProtectedRoute requiredRole="GERENTE" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/usuarios" element={<UsersPage />} />
              <Route path="/admin/produtos" element={<InventoryPage />} />
              <Route path="/admin/fornecedores" element={<SuppliersPage />} />
              {/* Legacy redirects */}
              <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
              <Route path="/users" element={<Navigate to="/admin/usuarios" replace />} />
              <Route path="/inventory" element={<Navigate to="/admin/produtos" replace />} />
              <Route path="/suppliers" element={<Navigate to="/admin/fornecedores" replace />} />
            </Route>
          </Route>

          {/* ===== Catch-all ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
