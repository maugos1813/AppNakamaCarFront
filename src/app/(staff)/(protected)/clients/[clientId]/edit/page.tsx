'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getClient, updateClient, type ClientInput } from '@/lib/api/clients';
import { fieldErrorMap } from '@/lib/api/http';
import { PageHeader } from '@/components/layout/PageHeader';
import { ClientForm } from '@/components/clients/ClientForm';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ClientWithVehicles } from '@/lib/types';

export default function EditClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const { token } = useAuth();
  const router = useRouter();
  const [client, setClient] = useState<ClientWithVehicles | null>(null);

  useEffect(() => {
    if (!token) return;
    getClient(token, clientId).then((result) => {
      if (result.ok) setClient(result.data);
    });
  }, [token, clientId]);

  async function handleSubmit(input: ClientInput) {
    const result = await updateClient(token!, clientId, input);
    if (result.ok) {
      router.push(`/clients/${clientId}`);
      return { ok: true as const };
    }
    return { ok: false as const, message: result.message, fieldErrors: fieldErrorMap(result.fieldErrors) };
  }

  return (
    <div>
      <PageHeader title="Editar cliente" />
      {!client && <Skeleton height={80} radius={12} />}
      {client && (
        <ClientForm
          initial={client}
          submitLabel="Guardar cambios"
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/clients/${clientId}`)}
        />
      )}
    </div>
  );
}
