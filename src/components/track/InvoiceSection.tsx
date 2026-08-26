import type { ApiResult } from '@/lib/api/client-portal';
import { invoiceStatusLabels, invoiceStatusTones } from '@/lib/labels';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentOptions } from './PaymentOptions';
import type { TrackingInvoice } from '@/lib/types';
import styles from './InvoiceSection.module.css';

interface InvoiceSectionProps {
  invoice: TrackingInvoice;
  pdfHref?: string;
  onDownloadPdf?: () => void;
  onUploadReceipt: (file: File) => Promise<ApiResult<unknown>>;
  onRequestOfficePayment: () => Promise<ApiResult<unknown>>;
}

export function InvoiceSection({
  invoice,
  pdfHref,
  onDownloadPdf,
  onUploadReceipt,
  onRequestOfficePayment,
}: InvoiceSectionProps) {
  const downloadIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"
      />
    </svg>
  );

  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <span className={styles.number}>{invoice.invoiceNumber ?? 'Fattura'}</span>
        <StatusBadge tone={invoiceStatusTones[invoice.status]} label={invoiceStatusLabels[invoice.status]} />
      </div>

      {pdfHref ? (
        <a className={styles.downloadLink} href={pdfHref}>
          {downloadIcon}
          Scarica fattura (PDF)
        </a>
      ) : (
        <button type="button" className={styles.downloadLink} onClick={onDownloadPdf}>
          {downloadIcon}
          Scarica fattura (PDF)
        </button>
      )}

      {invoice.canPay && (
        <PaymentOptions invoice={invoice} onUploadReceipt={onUploadReceipt} onRequestOfficePayment={onRequestOfficePayment} />
      )}
    </div>
  );
}
