import type { StaffRoleName } from '../types';

export interface NavItemConfig {
  label: string;
  href: string;
}

// What each role sees in the main navigation — matches the plan doc exactly:
// ADMIN gets the full back-office, MECHANIC gets only their work board.
const NAV_BY_ROLE: Record<StaffRoleName, NavItemConfig[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Clientes', href: '/clients' },
    { label: 'Vehículos', href: '/vehicles' },
    { label: 'Ingresos', href: '/entries' },
    { label: 'Facturación', href: '/invoices' },
    { label: 'Finanzas', href: '/finance' },
    { label: 'Usuarios', href: '/users' },
    { label: 'Mi perfil', href: '/profile' },
  ],
  MECHANIC: [
    { label: 'Mis trabajos', href: '/jobs' },
    { label: 'Mi perfil', href: '/profile' },
  ],
};

export function navItemsForRole(role: StaffRoleName): NavItemConfig[] {
  return NAV_BY_ROLE[role];
}

export function homeForRole(role: StaffRoleName): string {
  return role === 'MECHANIC' ? '/jobs' : '/dashboard';
}

// Which roles may access a given route — deliberately separate from the nav
// list above: an ADMIN can still open /jobs (the shared board) even though
// it isn't in their nav, but a MECHANIC must never reach an ADMIN-only route.
const ROUTE_ACCESS: Record<string, StaffRoleName[]> = {
  '/dashboard': ['ADMIN'],
  '/clients': ['ADMIN'],
  '/vehicles': ['ADMIN'],
  '/entries': ['ADMIN'],
  '/invoices': ['ADMIN'],
  '/finance': ['ADMIN'],
  '/users': ['ADMIN'],
  '/jobs': ['ADMIN', 'MECHANIC'],
  '/profile': ['ADMIN', 'MECHANIC'],
};

export function allowedRolesForPath(pathname: string): StaffRoleName[] | undefined {
  const base = Object.keys(ROUTE_ACCESS).find((key) => pathname === key || pathname.startsWith(`${key}/`));
  return base ? ROUTE_ACCESS[base] : undefined;
}
