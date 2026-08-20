'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { createClient, type ClientInput } from '@/lib/api/clients';
import { fieldErrorMap } from '@/lib/api/http';
import { PageHeader } from '@/components/layout/PageHeader';
import { ClientForm } from '@/components/clients/ClientForm';

export default function NewClientPage() {
  const { token } = useAuth();
  const router = useRouter();

  async function handleSubmit(input: ClientInput) {
    const result = await createClient(token!, input);
    if (result.ok) {
      router.push(`/clients/${result.data.id}`);
      return { ok: true as const };
    }
    return { ok: false as const, message: result.message, fieldErrors: fieldErrorMap(result.fieldErrors) };
  }

  return (
    <div>
      <PageHeader title="Nuevo cliente" />
      <ClientForm submitLabel="Crear cliente" onSubmit={handleSubmit} onCancel={() => router.push('/clients')} />
    </div>
  );
}
