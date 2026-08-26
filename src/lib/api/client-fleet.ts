import { apiRequest } from './http';
import { env } from '../env';
import type { ApiResult } from './client-portal';
import type { FleetVehicleEntry, Paginated, TrackingSummary } from '../types';

export function listFleetVehicles(token: string, params: { page?: number; pageSize?: number } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  const qs = query.toString();
  return apiRequest<Paginated<FleetVehicleEntry>>(`/client-fleet/vehicles${qs ? `?${qs}` : ''}`, { token });
}

export function getFleetEntry(token: string, entryId: string) {
  return apiRequest<TrackingSummary>(`/client-fleet/entries/${entryId}`, { token });
}

export function approveFleetEstimate(token: string, entryId: string) {
  return apiRequest<unknown>(`/client-fleet/entries/${entryId}/estimate/approve`, { token, method: 'POST' });
}

export function rejectFleetEstimate(token: string, entryId: string, reason: string) {
  return apiRequest<unknown>(`/client-fleet/entries/${entryId}/estimate/reject`, {
    token,
    method: 'POST',
    body: JSON.stringify(reason ? { reason } : {}),
  });
}

export function uploadFleetReceipt(token: string, entryId: string, file: File) {
  const formData = new FormData();
  formData.append('receipt', file);
  return apiRequest<unknown>(`/client-fleet/entries/${entryId}/invoice/receipt`, { token, method: 'POST', body: formData });
}

export function requestFleetOfficePayment(token: string, entryId: string) {
  return apiRequest<unknown>(`/client-fleet/entries/${entryId}/invoice/pay-at-office`, { token, method: 'POST' });
}

// The PDF endpoint returns a raw file, not the { success, data } JSON
// envelope apiRequest expects — and needs the Bearer header a plain <a>
// can't send, so this fetches it directly and triggers a blob download.
export async function downloadFleetInvoicePdf(
  token: string,
  entryId: string,
  invoiceNumber: string,
): Promise<ApiResult<null>> {
  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}/client-fleet/entries/${entryId}/invoice/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return { ok: false, status: 0, message: 'Impossibile contattare il server. Controlla la connessione.' };
  }

  if (!res.ok) {
    let message = 'Impossibile scaricare la fattura.';
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // non-JSON error body, keep the generic message
    }
    return { ok: false, status: res.status, message };
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fattura-${invoiceNumber.replace('/', '-')}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return { ok: true, data: null };
}
