'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { createUser, listRoles, type CreateUserInput } from '@/lib/api/users';
import { fieldErrorMap } from '@/lib/api/http';
import { PageHeader } from '@/components/layout/PageHeader';
import { UserForm } from '@/components/users/UserForm';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Role } from '@/lib/types';

export default function NewUserPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[] | null>(null);

  useEffect(() => {
    if (!token) return;
    listRoles(token).then((result) => {
      if (result.ok) setRoles(result.data);
    });
  }, [token]);

  async function handleSubmit(input: CreateUserInput) {
    const result = await createUser(token!, input);
    if (result.ok) {
      router.push('/users');
      return { ok: true as const };
    }
    return { ok: false as const, message: result.message, fieldErrors: fieldErrorMap(result.fieldErrors) };
  }

  return (
    <div>
      <PageHeader title="Nuevo usuario" />
      {!roles && <Skeleton height={80} radius={12} />}
      {roles && (
        <UserForm
          mode="create"
          roles={roles}
          submitLabel="Crear usuario"
          onSubmit={handleSubmit}
          onCancel={() => router.push('/users')}
        />
      )}
    </div>
  );
}
