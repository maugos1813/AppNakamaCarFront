import { env } from '../env';
import type { TrackingSummary } from '../types';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

async function request<T>(token: string, path: string, init?: RequestInit): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}/client/${encodeURIComponent(token)}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        // A FormData body needs the browser to set its own multipart
        // boundary — an explicit Content-Type here would break the upload.
        ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...init?.headers,
      },
    });
  } catch {
    return { ok: false, status: 0, message: 'Impossibile contattare il server. Controlla la connessione.' };
  }

  let body: { success: boolean; message: string; data?: T } | null = null;
  try {
    body = await res.json();
  } catch {
    // A non-JSON body (e.g. an upstream 502) still needs to surface as a handled error.
  }

  if (!res.ok || !body?.success) {
    return { ok: false, status: res.status, message: body?.message ?? 'Si è verificato un errore imprevisto.' };
  }

  return { ok: true, data: body.data as T };
}

export function getTrackingSummary(token: string) {
  return request<TrackingSummary>(token, '');
}

export function approveEstimate(token: string) {
  return request<unknown>(token, '/estimate/approve', { method: 'POST' });
}

export function rejectEstimate(token: string, reason: string) {
  return request<unknown>(token, '/estimate/reject', {
    method: 'POST',
    body: JSON.stringify(reason ? { reason } : {}),
  });
}

export function getInvoicePdfUrl(token: string) {
  return `${env.apiUrl}/client/${encodeURIComponent(token)}/invoice/pdf`;
}

export function uploadPaymentReceipt(token: string, file: File) {
  const formData = new FormData();
  formData.append('receipt', file);
  return request<unknown>(token, '/invoice/receipt', { method: 'POST', body: formData });
}

export function requestOfficePayment(token: string) {
  return request<unknown>(token, '/invoice/pay-at-office', { method: 'POST' });
}
