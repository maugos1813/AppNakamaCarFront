import { apiRequest } from './http';
import type { ClientWithVehicles } from '../types';

interface ClientLoginResponse {
  accessToken: string;
  client: ClientWithVehicles;
}

export function clientLogin(email: string, password: string) {
  return apiRequest<ClientLoginResponse>('/client-auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function clientGetMe(token: string) {
  return apiRequest<ClientWithVehicles>('/client-auth/me', { token });
}

export function clientSetPassword(token: string, password: string) {
  return apiRequest<null>('/client-auth/set-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export function clientForgotPassword(email: string) {
  return apiRequest<null>('/client-auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
