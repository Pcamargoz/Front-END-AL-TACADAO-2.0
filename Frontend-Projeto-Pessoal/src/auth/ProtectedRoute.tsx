import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useFornecedor } from "../context/FornecedorContext";
import { LoadingScreen } from "../components/ui/Spinner";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Protege rotas que exigem JWT de usuario (login).
 * Redireciona para /login se nao autenticado.
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * Protege rotas que exigem JWT + Fornecedor Token.
 * Redireciona para /empresas se nao tiver fornecedor token.
 */
export function ProtectedFornecedorRoute({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { loading, isAuthenticated } = useAuth();
  const { isInsideFornecedor } = useFornecedor();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isInsideFornecedor) {
    return <Navigate to="/empresas" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

interface GuestRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export function GuestRoute({ children, redirectTo = "/empresas" }: GuestRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Carregando..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
