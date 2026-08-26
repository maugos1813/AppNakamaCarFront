'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  approveEstimate,
  getInvoicePdfUrl,
  getTrackingSummary,
  rejectEstimate,
  requestOfficePayment,
  uploadPaymentReceipt,
} from '@/lib/api/client-portal';
import type { TrackingSummary } from '@/lib/types';
import { TrackPageShell } from '@/components/track/TrackPageShell';
import { TrackingError } from '@/components/track/TrackingError';
import { TrackingHeader } from '@/components/track/TrackingHeader';
import { TrackingSkeleton } from '@/components/track/TrackingSkeleton';
import { StageStepper } from '@/components/track/StageStepper';
import { PhotoGallery } from '@/components/track/PhotoGallery';
import { EstimateSection } from '@/components/track/EstimateSection';
import { InvoiceSection } from '@/components/track/InvoiceSection';
import { ContactFooter } from '@/components/track/ContactFooter';

export default function TrackPage() {
  return (
    <Suspense fallback={<TrackingSkeleton />}>
      <TrackPageContent />
    </Suspense>
  );
}

function TrackPageContent() {
  const token = useSearchParams().get('token') ?? '';
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorStatus(404);
      return;
    }
    getTrackingSummary(token).then((result) => {
      if (result.ok) {
        setSummary(result.data);
      } else {
        setErrorStatus(result.status);
      }
    });
  }, [token]);

  if (errorStatus !== null) {
    return <TrackingError status={errorStatus} />;
  }

  if (!summary) {
    return <TrackingSkeleton />;
  }

  return (
    <TrackPageShell>
      <TrackingHeader vehicle={summary.vehicle} status={summary.status} />
      <StageStepper stages={summary.stages} />
      <PhotoGallery photos={summary.photos} />
      <EstimateSection
        estimate={summary.estimate}
        estimateStatus={summary.estimateStatus}
        estimateRespondedAt={summary.estimateRespondedAt}
        estimateRejectionReason={summary.estimateRejectionReason}
        onApprove={() => approveEstimate(token)}
        onReject={(reason) => rejectEstimate(token, reason)}
      />
      {summary.invoice && (
        <InvoiceSection
          invoice={summary.invoice}
          pdfHref={getInvoicePdfUrl(token)}
          onUploadReceipt={(file) => uploadPaymentReceipt(token, file)}
          onRequestOfficePayment={() => requestOfficePayment(token)}
        />
      )}
      <ContactFooter />
    </TrackPageShell>
  );
}
