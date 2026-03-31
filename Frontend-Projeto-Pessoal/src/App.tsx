import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { FornecedoresPage } from "./pages/FornecedoresPage";
import { EstoquePage } from "./pages/EstoquePage";
import { LoginPage } from "./pages/LoginPage";
import { CadastroPage } from "./pages/CadastroPage";
import { UsuariosPage } from "./pages/UsuariosPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth (public) */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

        {/* App (protected — AppLayout handles redirect) */}
        <Route element={<AppLayout />}>
          <Route path="/"             element={<Navigate to="/home" replace />} />
          <Route path="/home"         element={<DashboardPage />} />
          <Route path="/usuarios"     element={<UsuariosPage />} />
          <Route path="/fornecedores" element={<FornecedoresPage />} />
          <Route path="/estoque"      element={<EstoquePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  );
}
