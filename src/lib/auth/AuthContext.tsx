'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getMe, login as loginRequest, ssoLogin } from '@/lib/api/auth';
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
  updateUser: (user: StaffUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<StaffUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Llegó desde el portal de OneSystec con un ticket de un solo uso
    // (?sso=...): lo cambiamos por una sesión real acá, sin pedir password.
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('sso');
    if (ticket) {
      ssoLogin(ticket)
        .then((result) => {
          if (result.ok) {
            storeToken(result.data.accessToken);
            setToken(result.data.accessToken);
            setUser(result.data.user);
            setStatus('authenticated');
          } else {
            clearStoredToken();
            setStatus('unauthenticated');
          }
        })
        .finally(() => {
          params.delete('sso');
          const rest = params.toString();
          window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));
        });
      return;
    }

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

  const updateUser = useCallback((updated: StaffUser) => {
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, token, login, logout, updateUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider.');
  return ctx;
}
