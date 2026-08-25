'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { createEntry } from '@/lib/api/entries';
import { uploadPhoto } from '@/lib/api/jobs';
import { fieldErrorMap } from '@/lib/api/http';
import type { CreateEntryInput } from '@/lib/api/entries';
import { entryDetailPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { EntryForm } from '@/components/entries/EntryForm';

export default function NewEntryPage() {
  return (
    <Suspense fallback={null}>
      <NewEntryPageContent />
    </Suspense>
  );
}

function NewEntryPageContent() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialVehicleId = searchParams.get('vehicleId') ?? undefined;

  async function handleSubmit(input: CreateEntryInput, photoFiles: File[]) {
    const result = await createEntry(token!, input);
    if (!result.ok) {
      return { ok: false as const, message: result.message, fieldErrors: fieldErrorMap(result.fieldErrors) };
    }

    // Uploaded sequentially, not in parallel — this runs over a staff
    // member's mobile connection at the counter, and one steady upload at a
    // time is more predictable than several competing for bandwidth. A
    // failed photo doesn't block navigation: the entry itself already
    // exists and is the source of truth: staff can retry from its detail page.
    for (const file of photoFiles) {
      await uploadPhoto(token!, result.data.id, { file, category: 'INTAKE' });
    }

    router.push(entryDetailPath(result.data.id));
    return { ok: true as const };
  }

  return (
    <div>
      <PageHeader title="Nuevo ingreso" />
      <EntryForm initialVehicleId={initialVehicleId} onSubmit={handleSubmit} onCancel={() => router.back()} />
    </div>
  );
}
