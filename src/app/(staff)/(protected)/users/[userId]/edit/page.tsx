'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getUser, listRoles, updateUser, type UpdateUserInput } from '@/lib/api/users';
import { fieldErrorMap } from '@/lib/api/http';
import { PageHeader } from '@/components/layout/PageHeader';
import { UserForm } from '@/components/users/UserForm';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Role, StaffUser } from '@/lib/types';

export default function EditUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { token } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [roles, setRoles] = useState<Role[] | null>(null);

  useEffect(() => {
    if (!token) return;
    getUser(token, userId).then((result) => {
      if (result.ok) setUser(result.data);
    });
    listRoles(token).then((result) => {
      if (result.ok) setRoles(result.data);
    });
  }, [token, userId]);

  async function handleSubmit(input: UpdateUserInput) {
    const result = await updateUser(token!, userId, input);
    if (result.ok) {
      router.push('/users');
      return { ok: true as const };
    }
    return { ok: false as const, message: result.message, fieldErrors: fieldErrorMap(result.fieldErrors) };
  }

  return (
    <div>
      <PageHeader title="Editar usuario" />
      {(!user || !roles) && <Skeleton height={80} radius={12} />}
      {user && roles && (
        <UserForm
          mode="edit"
          initial={user}
          roles={roles}
          submitLabel="Guardar cambios"
          onSubmit={handleSubmit}
          onCancel={() => router.push('/users')}
        />
      )}
    </div>
  );
}
