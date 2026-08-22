'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getClient, updateClient, type ClientInput } from '@/lib/api/clients';
import { fieldErrorMap } from '@/lib/api/http';
import { clientDetailPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { ClientForm } from '@/components/clients/ClientForm';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ClientWithVehicles } from '@/lib/types';

export default function EditClientPage() {
  return (
    <Suspense fallback={<Skeleton height={80} radius={12} />}>
      <EditClientPageContent />
    </Suspense>
  );
}

function EditClientPageContent() {
  const clientId = useSearchParams().get('id') ?? '';
  const { token } = useAuth();
  const router = useRouter();
  const [client, setClient] = useState<ClientWithVehicles | null>(null);

  useEffect(() => {
    if (!token || !clientId) return;
    getClient(token, clientId).then((result) => {
      if (result.ok) setClient(result.data);
    });
  }, [token, clientId]);

  async function handleSubmit(input: ClientInput) {
    const result = await updateClient(token!, clientId, input);
    if (result.ok) {
      router.push(clientDetailPath(clientId));
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
          onCancel={() => router.push(clientDetailPath(clientId))}
        />
      )}
    </div>
  );
}
