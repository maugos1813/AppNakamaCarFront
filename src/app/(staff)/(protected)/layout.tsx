'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { allowedRolesForPath, homeForRole, navItemsForRole } from '@/lib/auth/roles';
import { AppShell } from '@/components/layout/AppShell';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { PushNotificationsSetup } from '@/components/layout/PushNotificationsSetup';
import { FullPageLoading } from '@/components/ui/FullPageLoading';
import { OfflineQueueIndicator } from '@/components/ui/OfflineQueueIndicator';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { status, user, token, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowedRoles = user ? allowedRolesForPath(pathname) : undefined;
  const isRoleAllowed = !allowedRoles || (user ? allowedRoles.includes(user.role.name) : false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && user && !isRoleAllowed) {
      router.replace(homeForRole(user.role.name));
    }
  }, [status, user, isRoleAllowed, router]);

  if (status !== 'authenticated' || !user || !isRoleAllowed) {
    return <FullPageLoading />;
  }

  // The /home launcher IS the navigation (every destination is a card
  // there), so the drawer stays down to theme + logout on that one route —
  // everywhere else shows the normal full nav.
  const navItems =
    pathname === '/home'
      ? []
      : navItemsForRole(user.role.name).map((item) => ({ ...item, active: pathname.startsWith(item.href) }));

  return (
    <>
      {/* Admin-only for now — matches the notification bell, since those
          are the only events currently wired to push. */}
      {user.role.name === 'ADMIN' && token && <PushNotificationsSetup token={token} />}
      <AppShell
        navItems={navItems}
        userName={user.fullName}
        onLogout={logout}
        offlineIndicator={<OfflineQueueIndicator token={token} />}
        notificationBell={user.role.name === 'ADMIN' && token ? <NotificationBell token={token} /> : undefined}
      >
        {children}
      </AppShell>
    </>
  );
}
