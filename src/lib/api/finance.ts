import { apiRequest } from './http';
import type { FinanceSummary, OverdueInvoice } from '../types';

export function getFinanceSummary(token: string, params: { from?: string; to?: string } = {}) {
  const query = new URLSearchParams();
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  const qs = query.toString();
  return apiRequest<FinanceSummary>(`/finance/summary${qs ? `?${qs}` : ''}`, { token });
}

export function getOverdueInvoices(token: string) {
  return apiRequest<OverdueInvoice[]>('/finance/overdue', { token });
}
