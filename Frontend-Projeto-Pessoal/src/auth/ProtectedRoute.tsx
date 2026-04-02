import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth, type UserRole } from "./AuthContext";
import { LoadingScreen } from "../components/ui/Spinner";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se requer role específica (ex: GERENTE para admin)
  if (requiredRole && role !== requiredRole) {
    // Redireciona usuário não-gerente para o catálogo
    return <Navigate to="/produtos" replace />;
  }

  // Se children foi passado diretamente, renderiza; caso contrário, usa Outlet
  return children ? <>{children}</> : <Outlet />;
}

interface GuestRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export function GuestRoute({ children, redirectTo = "/" }: GuestRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Carregando..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
