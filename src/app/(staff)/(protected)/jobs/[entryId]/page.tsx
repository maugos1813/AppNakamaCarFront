'use client';

import { use } from 'react';
import { BackLink } from '@/components/ui/BackLink';
import { EntryDetail } from '@/components/entries/EntryDetail';

export default function JobDetailPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = use(params);

  return (
    <div>
      <BackLink href="/jobs" label="Volver al tablero" />
      <EntryDetail entryId={entryId} />
    </div>
  );
}
