import { AuthProvider } from '@/lib/auth/AuthContext';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
