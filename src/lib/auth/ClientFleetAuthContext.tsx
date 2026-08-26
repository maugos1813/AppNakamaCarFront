'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clientGetMe, clientLogin as clientLoginRequest } from '@/lib/api/client-fleet-auth';
import { clearStoredFleetToken, getStoredFleetToken, storeFleetToken } from './clientFleetSession';
import type { ClientWithVehicles } from '@/lib/types';

type ClientAuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type ClientLoginResult = { ok: true } | { ok: false; status: number; message: string };

interface ClientFleetAuthContextValue {
  status: ClientAuthStatus;
  client: ClientWithVehicles | null;
  token: string | null;
  login: (email: string, password: string) => Promise<ClientLoginResult>;
  logout: () => void;
}

const ClientFleetAuthContext = createContext<ClientFleetAuthContextValue | null>(null);

export function ClientFleetAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ClientAuthStatus>('loading');
  const [client, setClient] = useState<ClientWithVehicles | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredFleetToken();
    if (!stored) {
      setStatus('unauthenticated');
      return;
    }
    clientGetMe(stored).then((result) => {
      if (result.ok) {
        setToken(stored);
        setClient(result.data);
        setStatus('authenticated');
      } else {
        clearStoredFleetToken();
        setStatus('unauthenticated');
      }
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<ClientLoginResult> => {
    const result = await clientLoginRequest(email, password);
    if (!result.ok) return result;
    storeFleetToken(result.data.accessToken);
    setToken(result.data.accessToken);
    setClient(result.data.client);
    setStatus('authenticated');
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    clearStoredFleetToken();
    setToken(null);
    setClient(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <ClientFleetAuthContext.Provider value={{ status, client, token, login, logout }}>
      {children}
    </ClientFleetAuthContext.Provider>
  );
}

export function useClientFleetAuth(): ClientFleetAuthContextValue {
  const ctx = useContext(ClientFleetAuthContext);
  if (!ctx) throw new Error('useClientFleetAuth must be used within a ClientFleetAuthProvider.');
  return ctx;
}
