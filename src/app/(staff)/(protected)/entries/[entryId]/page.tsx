'use client';

import { use } from 'react';
import { BackLink } from '@/components/ui/BackLink';
import { EntryDetail } from '@/components/entries/EntryDetail';

export default function EntryDetailPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = use(params);

  return (
    <div>
      <BackLink href="/entries" label="Volver a ingresos" />
      <EntryDetail entryId={entryId} />
    </div>
  );
}
