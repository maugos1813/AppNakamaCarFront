// One representative icon per nav destination, keyed by href so the home
// launcher can stay driven entirely by navItemsForRole() — add a nav item
// and it just needs an entry here, no separate icon-picking logic anywhere.
const ICONS: Record<string, React.ReactNode> = {
  '/dashboard': (
    <>
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M12 20V4M20 20v-6" />
    </>
  ),
  '/clients': (
    <>
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 20c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5M15.5 8a3.5 3.5 0 1 1 0 7c-.4 0-.78-.05-1.15-.14M17 13.5c3 .3 4.5 2.5 4.5 6.5"
      />
    </>
  ),
  '/entries': (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 3.5h6M8.5 10h7M8.5 13.5h7M8.5 17h4.5" />
    </>
  ),
  '/invoices': (
    <>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M6 3h12v18l-2.5-1.6L13 21l-1-1.6-1 1.6-2.5-1.6L6 21V3Z"
      />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 8h6M9 11.5h6" />
    </>
  ),
  '/work-requests': (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 3.5h6" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 9v4.2" />
      <circle cx="12" cy="16.3" r="0.15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  '/materials': (
    <>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z"
      />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3.5 7.5v9L12 21l8.5-4.5v-9M12 12v9" />
    </>
  ),
  '/finished-vehicles': (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M7 6V4.5h10V6" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m8 12.5 2.5 2.5L16 9.5" />
    </>
  ),
  '/vehicle-history': (
    <>
      <circle cx="11" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M11 7.5V12l3 2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="m19.5 20.5-2.6-2.6" />
    </>
  ),
  '/finance': (
    <>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M14.5 9.3c-.4-.7-1.3-1.2-2.5-1.2-1.5 0-2.7.8-2.7 2s1.2 1.7 2.7 1.9c1.5.2 2.7.7 2.7 2s-1.2 2-2.7 2c-1.2 0-2.1-.5-2.5-1.2M12 6.7v1.2M12 16.1v1.2"
      />
    </>
  ),
  '/users': (
    <>
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M2.5 20c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5" />
      <circle cx="18" cy="7" r="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M18 4v.7M18 8.7v.7M20.4 5.6l-.6.35M16.2 8.05l-.6.35M20.4 8.4l-.6-.35M16.2 5.95l-.6-.35"
      />
    </>
  ),
  '/profile': (
    <>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" />
    </>
  ),
  '/jobs': (
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.7 6.3 3 3-8.4 8.4-3.7.7.7-3.7 8.4-8.4Zm2.6-2.6 3 3M9 19.5l-4.8.9.9-4.8"
    />
  ),
};

export function HomeCardIcon({ href }: { href: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {ICONS[href] ?? <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />}
    </svg>
  );
}
