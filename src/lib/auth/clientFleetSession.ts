const TOKEN_KEY = 'nakamacar-fleet-client-token';

export function getStoredFleetToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function storeFleetToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredFleetToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
