import { apiRequest } from './http';
import type {
  DamageSeverity,
  HistoryEvent,
  JobEntry,
  LaborItemStatus,
  PartStatus,
  PhotoCategory,
  RepairStageDetail,
  RepairStageStatus,
  StaffDamage,
  StaffLaborItem,
  StaffPart,
  StaffPhoto,
} from '../types';

export function listActiveEntries(token: string) {
  return apiRequest<{ items: JobEntry[]; total: number }>('/entries?status=IN_PROGRESS&pageSize=100', { token });
}

export function getEntry(token: string, entryId: string) {
  return apiRequest<JobEntry>(`/entries/${entryId}`, { token });
}

export function updateStage(token: string, stageId: string, status: RepairStageStatus) {
  return apiRequest<RepairStageDetail>(`/stages/${stageId}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function listDamages(token: string, entryId: string) {
  return apiRequest<StaffDamage[]>(`/entries/${entryId}/damages`, { token });
}

export function createDamage(
  token: string,
  entryId: string,
  input: { area: string; description: string; severity: DamageSeverity },
) {
  return apiRequest<StaffDamage>(`/entries/${entryId}/damages`, { token, method: 'POST', body: JSON.stringify(input) });
}

export function listLaborItems(token: string, entryId: string) {
  return apiRequest<StaffLaborItem[]>(`/entries/${entryId}/labor`, { token });
}

export function updateLaborItem(
  token: string,
  id: string,
  input: Partial<{ description: string; hours: number; hourlyRate: number }>,
) {
  return apiRequest<StaffLaborItem>(`/labor/${id}`, { token, method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteLaborItem(token: string, id: string) {
  return apiRequest<null>(`/labor/${id}`, { token, method: 'DELETE' });
}

export function createLaborItem(
  token: string,
  entryId: string,
  input: { description: string; hours: number; hourlyRate: number; status?: LaborItemStatus },
) {
  return apiRequest<StaffLaborItem>(`/entries/${entryId}/labor`, { token, method: 'POST', body: JSON.stringify(input) });
}

export function listParts(token: string, entryId: string) {
  return apiRequest<StaffPart[]>(`/entries/${entryId}/parts`, { token });
}

export function updatePart(
  token: string,
  id: string,
  input: Partial<{ name: string; partNumber: string | null; quantity: number; unitCost: number; unitPrice: number }>,
) {
  return apiRequest<StaffPart>(`/parts/${id}`, { token, method: 'PATCH', body: JSON.stringify(input) });
}

export function deletePart(token: string, id: string) {
  return apiRequest<null>(`/parts/${id}`, { token, method: 'DELETE' });
}

export function createPart(
  token: string,
  entryId: string,
  input: {
    name: string;
    partNumber?: string;
    quantity: number;
    unitCost: number;
    unitPrice: number;
    status?: PartStatus;
  },
) {
  return apiRequest<StaffPart>(`/entries/${entryId}/parts`, { token, method: 'POST', body: JSON.stringify(input) });
}

export function listPhotos(token: string, entryId: string) {
  return apiRequest<StaffPhoto[]>(`/entries/${entryId}/photos`, { token });
}

export function uploadPhoto(
  token: string,
  entryId: string,
  input: { file: File; category: PhotoCategory; caption?: string },
) {
  const formData = new FormData();
  formData.append('photo', input.file);
  formData.append('category', input.category);
  if (input.caption) formData.append('caption', input.caption);

  return apiRequest<StaffPhoto>(`/entries/${entryId}/photos`, { token, method: 'POST', body: formData });
}

export function getHistory(token: string, entryId: string) {
  return apiRequest<HistoryEvent[]>(`/entries/${entryId}/history`, { token });
}
