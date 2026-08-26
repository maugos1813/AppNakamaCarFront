import { apiRequest } from './http';
import type { Client, ClientWithVehicles, Paginated } from '../types';

export interface ClientInput {
  isCompany: boolean;
  fullName: string;
  companyName?: string;
  fiscalCode?: string;
  vatNumber?: string;
  email?: string;
  phone: string;
  addressLine?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
  notes?: string;
}

export function listClients(token: string, params: { search?: string; page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 20));
  return apiRequest<Paginated<Client>>(`/clients?${query.toString()}`, { token });
}

export function getClient(token: string, id: string) {
  return apiRequest<ClientWithVehicles>(`/clients/${id}`, { token });
}

export function createClient(token: string, input: ClientInput) {
  return apiRequest<Client>('/clients', { token, method: 'POST', body: JSON.stringify(input) });
}

export function updateClient(token: string, id: string, input: Partial<ClientInput>) {
  return apiRequest<Client>(`/clients/${id}`, { token, method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteClient(token: string, id: string) {
  return apiRequest<null>(`/clients/${id}`, { token, method: 'DELETE' });
}

export function enableClientPortal(token: string, id: string) {
  return apiRequest<ClientWithVehicles>(`/clients/${id}/enable-portal`, { token, method: 'POST' });
}
