'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useClientFleetAuth } from '@/lib/auth/ClientFleetAuthContext';
import {
  approveFleetEstimate,
  downloadFleetInvoicePdf,
  getFleetEntry,
  rejectFleetEstimate,
  requestFleetOfficePayment,
  uploadFleetReceipt,
} from '@/lib/api/client-fleet';
import { TrackingHeader } from '@/components/track/TrackingHeader';
import { StageStepper } from '@/components/track/StageStepper';
import { PhotoGallery } from '@/components/track/PhotoGallery';
import { EstimateSection } from '@/components/track/EstimateSection';
import { InvoiceSection } from '@/components/track/InvoiceSection';
import { Skeleton } from '@/components/ui/Skeleton';
import type { TrackingSummary } from '@/lib/types';
import styles from './page.module.css';

export default function PortalVehiclePage() {
  return (
    <Suspense fallback={<Skeleton height={300} radius={12} />}>
      <PortalVehiclePageContent />
    </Suspense>
  );
}

function PortalVehiclePageContent() {
  const entryId = useSearchParams().get('id') ?? '';
  const { token } = useClientFleetAuth();
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !entryId) return;
    getFleetEntry(token, entryId).then((result) => {
      if (result.ok) {
        setSummary(result.data);
      } else {
        setError(result.message);
      }
    });
  }, [token, entryId]);

  if (error) {
    return (
      <div className={styles.wrap}>
        <Link href="/portal/dashboard" className={styles.backLink}>
          &larr; I miei veicoli
        </Link>
        <div className={styles.errorBanner}>{error}</div>
      </div>
    );
  }

  if (!summary || !token) {
    return <Skeleton height={300} radius={12} />;
  }

  return (
    <div className={styles.wrap}>
      <Link href="/portal/dashboard" className={styles.backLink}>
        &larr; I miei veicoli
      </Link>

      <TrackingHeader vehicle={summary.vehicle} status={summary.status} />
      <StageStepper stages={summary.stages} />
      <PhotoGallery photos={summary.photos} />
      <EstimateSection
        estimate={summary.estimate}
        estimateStatus={summary.estimateStatus}
        estimateRespondedAt={summary.estimateRespondedAt}
        estimateRejectionReason={summary.estimateRejectionReason}
        onApprove={() => approveFleetEstimate(token, entryId)}
        onReject={(reason) => rejectFleetEstimate(token, entryId, reason)}
      />
      {summary.invoice && (
        <InvoiceSection
          invoice={summary.invoice}
          onDownloadPdf={() => downloadFleetInvoicePdf(token, entryId, summary.invoice!.invoiceNumber ?? summary.invoice!.id)}
          onUploadReceipt={(file) => uploadFleetReceipt(token, entryId, file)}
          onRequestOfficePayment={() => requestFleetOfficePayment(token, entryId)}
        />
      )}
    </div>
  );
}
