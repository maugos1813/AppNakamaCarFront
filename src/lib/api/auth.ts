import { apiRequest } from './http';
import type { StaffUser } from '../types';

interface LoginResponse {
  accessToken: string;
  user: StaffUser;
}

export function login(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Cambia un ticket de single sign-on de OneSystec por una sesión real acá, sin
// password — ver AuthContext.tsx.
export function ssoLogin(ticket: string) {
  return apiRequest<LoginResponse>('/auth/sso', {
    method: 'POST',
    body: JSON.stringify({ ticket }),
  });
}

export function getMe(token: string) {
  return apiRequest<StaffUser>('/auth/me', { token });
}

export function forgotPassword(email: string) {
  return apiRequest<null>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string) {
  return apiRequest<null>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}
