import { ClientFleetAuthProvider } from '@/lib/auth/ClientFleetAuthContext';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <ClientFleetAuthProvider>{children}</ClientFleetAuthProvider>;
}
