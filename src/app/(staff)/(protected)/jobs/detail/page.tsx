'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BackLink } from '@/components/ui/BackLink';
import { EntryDetail } from '@/components/entries/EntryDetail';

export default function JobDetailPage() {
  return (
    <Suspense fallback={null}>
      <JobDetailPageContent />
    </Suspense>
  );
}

function JobDetailPageContent() {
  const entryId = useSearchParams().get('id') ?? '';

  return (
    <div>
      <BackLink href="/jobs" label="Volver al tablero" />
      <EntryDetail entryId={entryId} />
    </div>
  );
}
