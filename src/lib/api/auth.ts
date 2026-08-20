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

export function getMe(token: string) {
  return apiRequest<StaffUser>('/auth/me', { token });
}
