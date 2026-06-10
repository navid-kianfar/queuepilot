import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Lock, User } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { isAxiosError } from 'axios';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/input';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: status } = useQuery({
    queryKey: ['auth', 'status'],
    queryFn: authApi.status,
    staleTime: Infinity,
  });

  // No auth configured — the app is open, skip the login screen
  useEffect(() => {
    if (status && !status.enabled) {
      navigate('/', { replace: true });
    }
  }, [status, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const { token, expiresAt } = await authApi.login(username, password);
      setAuth(token, expiresAt);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== '/login' ? from : '/', { replace: true });
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 401
          ? 'Invalid username or password'
          : 'Login failed — is the server reachable?',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo className="h-12 w-12" />
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-foreground">QueuePilot</h1>
            <p className="text-xs text-muted-foreground">Sign in to manage your queues</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <Input
            label="Username"
            icon={<User className="h-3.5 w-3.5" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            autoFocus
            required
          />
          <Input
            label="Password"
            type="password"
            icon={<Lock className="h-3.5 w-3.5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
