// Entity detail/edit URLs use a query param (?id=), not a dynamic path
// segment (/x/[id]) — a static-exported app (Capacitor/Android) has no
// server to resolve arbitrary path segments at request time, since every
// possible id would need to be known at build time. Centralized here so the
// convention only has to be decided once.
export function clientDetailPath(id: string): string {
  return `/clients/detail?id=${id}`;
}

export function clientEditPath(id: string): string {
  return `/clients/edit?id=${id}`;
}

export function vehicleDetailPath(id: string): string {
  return `/vehicles/detail?id=${id}`;
}

export function vehicleEditPath(id: string): string {
  return `/vehicles/edit?id=${id}`;
}

export function entryDetailPath(id: string): string {
  return `/entries/detail?id=${id}`;
}

export function invoiceDetailPath(id: string): string {
  return `/invoices/detail?id=${id}`;
}

export function jobDetailPath(id: string): string {
  return `/jobs/detail?id=${id}`;
}

export function userEditPath(id: string): string {
  return `/users/edit?id=${id}`;
}
