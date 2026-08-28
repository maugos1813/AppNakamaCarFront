import { apiRequest } from './http';
import type { EntryWorkRequest, Paginated, StaffWorkRequest, WorkRequestStatus } from '../types';

export function listWorkRequestsByEntry(token: string, entryId: string) {
  return apiRequest<EntryWorkRequest[]>(`/entries/${entryId}/work-requests`, { token });
}

export function createWorkRequest(token: string, entryId: string, description: string) {
  return apiRequest<EntryWorkRequest>(`/entries/${entryId}/work-requests`, {
    token,
    method: 'POST',
    body: JSON.stringify({ description }),
  });
}

export function updateWorkRequest(token: string, id: string, description: string) {
  return apiRequest<EntryWorkRequest>(`/work-requests/${id}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({ description }),
  });
}

export function setWorkRequestStatus(token: string, id: string, status: WorkRequestStatus) {
  return apiRequest<EntryWorkRequest>(`/work-requests/${id}/status`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteWorkRequest(token: string, id: string) {
  return apiRequest<null>(`/work-requests/${id}`, { token, method: 'DELETE' });
}

export function listWorkRequests(token: string, params: { status?: WorkRequestStatus; page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 20));
  return apiRequest<Paginated<StaffWorkRequest>>(`/work-requests?${query.toString()}`, { token });
}
