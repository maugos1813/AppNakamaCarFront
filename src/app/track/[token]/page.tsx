import { getTrackingSummary } from '@/lib/api/client-portal';
import { TrackPageShell } from '@/components/track/TrackPageShell';
import { TrackingError } from '@/components/track/TrackingError';
import { TrackingHeader } from '@/components/track/TrackingHeader';
import { StageStepper } from '@/components/track/StageStepper';
import { PhotoGallery } from '@/components/track/PhotoGallery';
import { EstimateSection } from '@/components/track/EstimateSection';
import { InvoiceSection } from '@/components/track/InvoiceSection';
import { ContactFooter } from '@/components/track/ContactFooter';

export default async function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getTrackingSummary(token);

  if (!result.ok) {
    return <TrackingError status={result.status} />;
  }

  const summary = result.data;

  return (
    <TrackPageShell>
      <TrackingHeader vehicle={summary.vehicle} status={summary.status} />
      <StageStepper stages={summary.stages} />
      <PhotoGallery photos={summary.photos} />
      <EstimateSection
        token={token}
        estimate={summary.estimate}
        estimateStatus={summary.estimateStatus}
        estimateRespondedAt={summary.estimateRespondedAt}
        estimateRejectionReason={summary.estimateRejectionReason}
      />
      {summary.invoice && <InvoiceSection invoice={summary.invoice} token={token} />}
      <ContactFooter />
    </TrackPageShell>
  );
}
