'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BackLink } from '@/components/ui/BackLink';
import { EntryDetail } from '@/components/entries/EntryDetail';

export default function EntryDetailPage() {
  return (
    <Suspense fallback={null}>
      <EntryDetailPageContent />
    </Suspense>
  );
}

function EntryDetailPageContent() {
  const entryId = useSearchParams().get('id') ?? '';

  return (
    <div>
      <BackLink href="/entries" label="Volver a ingresos" />
      <EntryDetail entryId={entryId} />
    </div>
  );
}
