import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/api/endpoints/auth';
import { hasValidToken, useAuthStore } from '@/stores/auth-store';

export function RequireAuth() {
  const location = useLocation();
  // Subscribe so logging in/out re-renders the guard
  const token = useAuthStore((s) => s.token);

  const { data: status, isLoading } = useQuery({
    queryKey: ['auth', 'status'],
    queryFn: authApi.status,
    staleTime: Infinity,
    enabled: !token,
  });

  if (hasValidToken()) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status?.enabled) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
