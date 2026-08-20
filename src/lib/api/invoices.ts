import { apiRequest } from './http';
import { env } from '../env';
import type { InvoiceStatus, Paginated, PaymentMethod, StaffInvoice, StaffInvoiceDetail, StaffPayment } from '../types';

export interface CreateInvoiceInput {
  taxRate?: number;
  dueDate?: string;
  notes?: string;
}

export interface CreatePaymentInput {
  amount: number;
  method: PaymentMethod;
  paidAt?: string;
  reference?: string;
}

export function listInvoices(
  token: string,
  params: { clientId?: string; status?: InvoiceStatus; page?: number; pageSize?: number },
) {
  const query = new URLSearchParams();
  if (params.clientId) query.set('clientId', params.clientId);
  if (params.status) query.set('status', params.status);
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 20));
  return apiRequest<Paginated<StaffInvoice>>(`/invoices?${query.toString()}`, { token });
}

export function getInvoice(token: string, invoiceId: string) {
  return apiRequest<StaffInvoiceDetail>(`/invoices/${invoiceId}`, { token });
}

export function createInvoiceForEntry(token: string, entryId: string, input: CreateInvoiceInput) {
  return apiRequest<StaffInvoice>(`/entries/${entryId}/invoice`, { token, method: 'POST', body: JSON.stringify(input) });
}

export function issueInvoice(token: string, invoiceId: string) {
  return apiRequest<StaffInvoice>(`/invoices/${invoiceId}/issue`, { token, method: 'PATCH' });
}

export function cancelInvoice(token: string, invoiceId: string) {
  return apiRequest<StaffInvoice>(`/invoices/${invoiceId}/cancel`, { token, method: 'PATCH' });
}

export function recordPayment(token: string, invoiceId: string, input: CreatePaymentInput) {
  return apiRequest<StaffPayment>(`/invoices/${invoiceId}/payments`, {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// The PDF route requires the staff Bearer token, so it can't be a plain
// <a href> like the public Client Portal's equivalent — the browser has no
// way to attach an Authorization header to a normal link navigation.
export async function downloadInvoicePdf(
  token: string,
  invoiceId: string,
  invoiceNumber: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}/invoices/${invoiceId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return { ok: false, message: 'No se pudo contactar al servidor. Revisa tu conexión.' };
  }

  if (!res.ok) {
    let message = 'No se pudo descargar la factura.';
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // non-JSON error body, keep the generic message
    }
    return { ok: false, message };
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `factura-${invoiceNumber.replace('/', '-')}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return { ok: true };
}
