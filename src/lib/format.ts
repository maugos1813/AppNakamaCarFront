const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

// Locale controls the month/day names, not just punctuation — "gennaio" vs
// "enero" — so date formatting takes an explicit locale. Defaults to Italian
// for the Client Portal's existing call sites; staff-facing screens pass
// 'es-ES' explicitly (see lib/staffLabels.ts for why the two surfaces differ).
export function formatCurrency(value: number | string): string {
  return currencyFormatter.format(typeof value === 'string' ? Number(value) : value);
}

export function formatDate(value: string | null | undefined, locale: string = 'it-IT'): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined, locale: string = 'it-IT'): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function clientDisplayName(client: { isCompany: boolean; fullName: string; companyName: string | null }): string {
  return client.isCompany && client.companyName ? client.companyName : client.fullName;
}
