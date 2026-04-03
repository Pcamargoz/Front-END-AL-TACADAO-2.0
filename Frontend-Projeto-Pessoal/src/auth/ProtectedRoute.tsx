import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth, type UserRole } from "./AuthContext";
import { LoadingScreen } from "../components/ui/Spinner";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: UserRole;
  requireCompany?: boolean;
  allowPending?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  requireCompany = false,
  allowPending = false,
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { loading, isAuthenticated, isManager, hasCompany, isPendingApproval } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se requer role específica (ex: GERENTE para admin)
  if (requiredRole === "GERENTE" && !isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se usuário está pendente de aprovação e a rota não permite pendentes
  // Redireciona para página de aguardando aprovação
  if (isPendingApproval && !allowPending) {
    // Permite acesso à página de aguardando aprovação
    if (location.pathname !== "/aguardando-empresa") {
      return <Navigate to="/aguardando-empresa" replace />;
    }
  }

  // Se requer empresa vinculada (para criar produtos, etc.)
  if (requireCompany && !hasCompany) {
    return <Navigate to="/aguardando-empresa" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

interface GuestRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export function GuestRoute({ children, redirectTo = "/dashboard" }: GuestRouteProps) {
  const { isAuthenticated, loading, isManager, isPendingApproval } = useAuth();

  if (loading) {
    return <LoadingScreen message="Carregando..." />;
  }

  if (isAuthenticated) {
    // Se está pendente, vai para página de aguardando
    if (isPendingApproval) {
      return <Navigate to="/aguardando-empresa" replace />;
    }
    // Gerente vai para admin, usuário comum vai para dashboard
    const dest = isManager ? "/admin" : redirectTo;
    return <Navigate to={dest} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
