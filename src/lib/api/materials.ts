import { apiRequest } from './http';
import type { InventoryItem, MaterialRequestStatus, Paginated, StaffMaterialRequest } from '../types';

export function listInventoryItems(token: string) {
  return apiRequest<InventoryItem[]>('/inventory-items', { token });
}

export function createInventoryItem(
  token: string,
  input: { name: string; unit: string; quantity: number; minQuantity?: number; notes?: string },
) {
  return apiRequest<InventoryItem>('/inventory-items', { token, method: 'POST', body: JSON.stringify(input) });
}

export function updateInventoryItem(
  token: string,
  id: string,
  input: Partial<{ name: string; unit: string; quantity: number; minQuantity: number | null; notes: string | null }>,
) {
  return apiRequest<InventoryItem>(`/inventory-items/${id}`, { token, method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteInventoryItem(token: string, id: string) {
  return apiRequest<null>(`/inventory-items/${id}`, { token, method: 'DELETE' });
}

export function listMaterialRequests(
  token: string,
  params: { status?: MaterialRequestStatus; page?: number; pageSize?: number },
) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 20));
  return apiRequest<Paginated<StaffMaterialRequest>>(`/material-requests?${query.toString()}`, { token });
}

export function createMaterialRequest(token: string, input: { description: string; quantity: number }) {
  return apiRequest<StaffMaterialRequest>('/material-requests', { token, method: 'POST', body: JSON.stringify(input) });
}

export function setMaterialRequestStatus(token: string, id: string, status: MaterialRequestStatus) {
  return apiRequest<StaffMaterialRequest>(`/material-requests/${id}/status`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteMaterialRequest(token: string, id: string) {
  return apiRequest<null>(`/material-requests/${id}`, { token, method: 'DELETE' });
}
