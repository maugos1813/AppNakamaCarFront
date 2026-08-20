'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { createEntry } from '@/lib/api/entries';
import { fieldErrorMap } from '@/lib/api/http';
import type { CreateEntryInput } from '@/lib/api/entries';
import { PageHeader } from '@/components/layout/PageHeader';
import { EntryForm } from '@/components/entries/EntryForm';

export default function NewEntryPage() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialVehicleId = searchParams.get('vehicleId') ?? undefined;

  async function handleSubmit(input: CreateEntryInput) {
    const result = await createEntry(token!, input);
    if (result.ok) {
      router.push(`/entries/${result.data.id}`);
      return { ok: true as const };
    }
    return { ok: false as const, message: result.message, fieldErrors: fieldErrorMap(result.fieldErrors) };
  }

  return (
    <div>
      <PageHeader title="Nuevo ingreso" />
      <EntryForm initialVehicleId={initialVehicleId} onSubmit={handleSubmit} onCancel={() => router.back()} />
    </div>
  );
}
