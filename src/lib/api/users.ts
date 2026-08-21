import { apiRequest } from './http';
import type { Paginated, Role, StaffUser } from '../types';

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
  phone?: string;
}

export interface UpdateUserInput {
  fullName?: string;
  phone?: string | null;
  roleId?: string;
  isActive?: boolean;
}

export interface UpdateMeInput {
  fullName?: string;
  phone?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function listUsers(
  token: string,
  params: { roleId?: string; isActive?: boolean; page?: number; pageSize?: number },
) {
  const query = new URLSearchParams();
  if (params.roleId) query.set('roleId', params.roleId);
  if (params.isActive !== undefined) query.set('isActive', String(params.isActive));
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 20));
  return apiRequest<Paginated<StaffUser>>(`/users?${query.toString()}`, { token });
}

export function getUser(token: string, id: string) {
  return apiRequest<StaffUser>(`/users/${id}`, { token });
}

export function createUser(token: string, input: CreateUserInput) {
  return apiRequest<StaffUser>('/users', { token, method: 'POST', body: JSON.stringify(input) });
}

export function updateUser(token: string, id: string, input: UpdateUserInput) {
  return apiRequest<StaffUser>(`/users/${id}`, { token, method: 'PATCH', body: JSON.stringify(input) });
}

export function listRoles(token: string) {
  return apiRequest<Role[]>('/users/roles', { token });
}

export function updateMe(token: string, input: UpdateMeInput) {
  return apiRequest<StaffUser>('/users/me', { token, method: 'PATCH', body: JSON.stringify(input) });
}

export function changeOwnPassword(token: string, input: ChangePasswordInput) {
  return apiRequest<null>('/users/me/password', { token, method: 'PATCH', body: JSON.stringify(input) });
}
