import { apiRequest } from './http';
import type { DashboardActivityEvent, DashboardSummary } from '../types';

export function getDashboardSummary(token: string) {
  return apiRequest<DashboardSummary>('/dashboard/summary', { token });
}

export function getDashboardActivity(token: string, limit = 20) {
  return apiRequest<DashboardActivityEvent[]>(`/dashboard/activity?limit=${limit}`, { token });
}
