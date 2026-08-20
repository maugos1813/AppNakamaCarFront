'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getMe, login as loginRequest } from '@/lib/api/auth';
import { clearStoredToken, getStoredToken, storeToken } from './session';
import type { StaffUser } from '@/lib/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type LoginResult = { ok: true } | { ok: false; status: number; message: string };

interface AuthContextValue {
  status: AuthStatus;
  user: StaffUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<StaffUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setStatus('unauthenticated');
      return;
    }
    getMe(stored).then((result) => {
      if (result.ok) {
        setToken(stored);
        setUser(result.data);
        setStatus('authenticated');
      } else {
        clearStoredToken();
        setStatus('unauthenticated');
      }
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const result = await loginRequest(email, password);
    if (!result.ok) return result;
    storeToken(result.data.accessToken);
    setToken(result.data.accessToken);
    setUser(result.data.user);
    setStatus('authenticated');
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return <AuthContext.Provider value={{ status, user, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider.');
  return ctx;
}
