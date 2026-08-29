import { apiRequest } from './http';
import type {
  EntryEstimate,
  FuelLevel,
  JobEntry,
  Paginated,
  SignatureType,
  StaffNotification,
  StaffOtherCost,
  VehicleEntryStatus,
} from '../types';

export interface CreateEntryInput {
  vehicleId: string;
  odometerReading: number;
  fuelLevel: FuelLevel;
  exteriorConditionNotes?: string;
  hasSpareTire?: boolean;
  hasDocuments?: boolean;
  estimatedCompletionDate?: string;
}

export type UpdateEntryInput = Partial<Omit<CreateEntryInput, 'vehicleId'>>;

export function listEntries(
  token: string,
  params: {
    status?: VehicleEntryStatus;
    vehicleId?: string;
    clientId?: string;
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  },
) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.vehicleId) query.set('vehicleId', params.vehicleId);
  if (params.clientId) query.set('clientId', params.clientId);
  if (params.search) query.set('search', params.search);
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 20));
  return apiRequest<Paginated<JobEntry>>(`/entries?${query.toString()}`, { token });
}

export function createEntry(token: string, input: CreateEntryInput) {
  return apiRequest<JobEntry>('/entries', { token, method: 'POST', body: JSON.stringify(input) });
}

export function updateEntry(token: string, entryId: string, input: UpdateEntryInput) {
  return apiRequest<JobEntry>(`/entries/${entryId}`, { token, method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteEntry(token: string, entryId: string) {
  return apiRequest<null>(`/entries/${entryId}`, { token, method: 'DELETE' });
}

export function changeEntryStatus(token: string, entryId: string, status: VehicleEntryStatus, notes?: string) {
  return apiRequest<JobEntry>(`/entries/${entryId}/status`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
}

export function captureSignature(
  token: string,
  entryId: string,
  input: { type: SignatureType; signerName: string; imageDataUrl: string },
) {
  return apiRequest<JobEntry>(`/entries/${entryId}/signature`, { token, method: 'PATCH', body: JSON.stringify(input) });
}

export function requestEstimateApproval(token: string, entryId: string) {
  return apiRequest<JobEntry>(`/entries/${entryId}/estimate/request-approval`, { token, method: 'PATCH' });
}

export function getEntryEstimate(token: string, entryId: string) {
  return apiRequest<EntryEstimate>(`/entries/${entryId}/estimate`, { token });
}

export function listOtherCosts(token: string, entryId: string) {
  return apiRequest<StaffOtherCost[]>(`/entries/${entryId}/costs`, { token });
}

export function createOtherCost(
  token: string,
  entryId: string,
  input: { description: string; amount: number; category?: string },
) {
  return apiRequest<StaffOtherCost>(`/entries/${entryId}/costs`, { token, method: 'POST', body: JSON.stringify(input) });
}

export function updateOtherCost(
  token: string,
  id: string,
  input: Partial<{ description: string; amount: number; category: string | null }>,
) {
  return apiRequest<StaffOtherCost>(`/costs/${id}`, { token, method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteOtherCost(token: string, id: string) {
  return apiRequest<null>(`/costs/${id}`, { token, method: 'DELETE' });
}

export function listNotifications(token: string, entryId: string) {
  return apiRequest<StaffNotification[]>(`/entries/${entryId}/notifications`, { token });
}
