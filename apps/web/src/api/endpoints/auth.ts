import { api } from '../client';

export interface AuthStatus {
  enabled: boolean;
}

export interface LoginResult {
  token: string;
  expiresAt: number;
}

export const authApi = {
  status: () => api.get<AuthStatus>('/auth/status').then((r) => r.data),

  login: (username: string, password: string) =>
    api.post<LoginResult>('/auth/login', { username, password }).then((r) => r.data),
};
