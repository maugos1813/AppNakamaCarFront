import type { StaffRoleName } from '../types';

export interface NavItemConfig {
  label: string;
  href: string;
}

// What each role sees in the main navigation. Vehicles aren't a top-level
// section — they live inside each client's profile instead. Mi perfil isn't
// here either — the username in the header is the way in, everywhere.
const NAV_BY_ROLE: Record<StaffRoleName, NavItemConfig[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Clientes', href: '/clients' },
    { label: 'Ingresos', href: '/entries' },
    { label: 'Richiesta', href: '/work-requests' },
    { label: 'Facturación', href: '/invoices' },
    { label: 'Finanzas', href: '/finance' },
    { label: 'Usuarios', href: '/users' },
    { label: 'Materiales', href: '/materials' },
    { label: 'Vehículos Terminados', href: '/finished-vehicles' },
    { label: 'History Vehículos', href: '/vehicle-history' },
  ],
  // A mechanic inspects the vehicle and is the one who knows what actually
  // needs fixing, so they get full access to entries (create/document
  // damages, labor, parts, photos) — not just their assigned-stage board.
  // What stays admin-only lives inside EntryDetail itself (isAdmin-gated):
  // the estimate/pricing, invoicing, and entry-status/delete controls.
  // That full-access entry board is what the mechanic calls "Richiesta"
  // here — it's also where they log work that needs doing without a price
  // (the WorkRequestsSection on each entry); the admin-only cross-entry
  // queue at /work-requests isn't duplicated as a separate card for them.
  MECHANIC: [
    { label: 'PENDIENTES', href: '/jobs' },
    { label: 'Richiesta', href: '/entries' },
    { label: 'Materiales', href: '/materials' },
    { label: 'Vehículos Terminados', href: '/finished-vehicles' },
    { label: 'History Vehículos', href: '/vehicle-history' },
  ],
};

export function navItemsForRole(role: StaffRoleName): NavItemConfig[] {
  return NAV_BY_ROLE[role];
}

// Every role lands on the card-based launcher first — including ADMIN,
// whose stats dashboard is now one of the cards rather than the landing
// page itself.
export function homeForRole(_role: StaffRoleName): string {
  return '/home';
}

// Which roles may access a given route — deliberately separate from the nav
// list above: an ADMIN can still open /jobs (the shared board) even though
// it isn't in their nav, but a MECHANIC must never reach an ADMIN-only route.
const ROUTE_ACCESS: Record<string, StaffRoleName[]> = {
  '/home': ['ADMIN', 'MECHANIC'],
  '/dashboard': ['ADMIN'],
  '/clients': ['ADMIN'],
  '/vehicles': ['ADMIN'],
  '/entries': ['ADMIN', 'MECHANIC'],
  '/work-requests': ['ADMIN', 'MECHANIC'],
  '/invoices': ['ADMIN'],
  '/finance': ['ADMIN'],
  '/users': ['ADMIN'],
  '/jobs': ['ADMIN', 'MECHANIC'],
  '/profile': ['ADMIN', 'MECHANIC'],
  '/materials': ['ADMIN', 'MECHANIC'],
  '/finished-vehicles': ['ADMIN', 'MECHANIC'],
  '/vehicle-history': ['ADMIN', 'MECHANIC'],
};

export function allowedRolesForPath(pathname: string): StaffRoleName[] | undefined {
  const base = Object.keys(ROUTE_ACCESS).find((key) => pathname === key || pathname.startsWith(`${key}/`));
  return base ? ROUTE_ACCESS[base] : undefined;
}
