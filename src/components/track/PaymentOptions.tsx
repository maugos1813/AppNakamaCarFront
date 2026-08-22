'use client';

import { useRef, useState } from 'react';
import { requestOfficePayment, uploadPaymentReceipt } from '@/lib/api/client-portal';
import { env } from '@/lib/env';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { TrackingInvoice } from '@/lib/types';
import styles from './PaymentOptions.module.css';

export function PaymentOptions({ token, invoice }: { token: string; invoice: TrackingInvoice }) {
  const [bonificoOpen, setBonificoOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [officeModalOpen, setOfficeModalOpen] = useState(false);
  const [officeSubmitting, setOfficeSubmitting] = useState(false);
  const [officeError, setOfficeError] = useState<string | null>(null);

  const officeRequested = Boolean(invoice.officePaymentRequestedAt);
  const receiptsCount = invoice.receiptsUploaded + (justUploaded ? 1 : 0);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const result = await uploadPaymentReceipt(token, file);
    setUploading(false);
    if (result.ok) {
      setJustUploaded(true);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } else {
      setUploadError(result.message);
    }
  }

  async function handleOfficeConfirm() {
    setOfficeSubmitting(true);
    setOfficeError(null);
    const result = await requestOfficePayment(token);
    setOfficeSubmitting(false);
    if (result.ok) {
      window.location.reload();
    } else {
      setOfficeError(result.message);
    }
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.title}>Come preferisci pagare?</span>

      <div className={styles.buttonRow}>
        <Button
          type="button"
          variant={bonificoOpen ? 'primary' : 'secondary'}
          fullWidth
          onClick={() => setBonificoOpen((v) => !v)}
        >
          Pagamento con bonifico
        </Button>
        <Button type="button" variant="secondary" fullWidth disabled={officeRequested} onClick={() => setOfficeModalOpen(true)}>
          {officeRequested ? 'Ufficio avvisato ✓' : 'Pagamento in ufficio'}
        </Button>
      </div>

      {officeRequested && (
        <p className={styles.successText}>Hai avvisato il negozio che pagherai di persona — ti aspettiamo!</p>
      )}

      {bonificoOpen && (
        <div className={styles.panel}>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>IBAN</span>
            <span className={styles.bankValue}>{env.companyIban}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>Intestatario</span>
            <span className={styles.bankValue}>{env.companyBankAccountHolder}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>Banca</span>
            <span className={styles.bankValue}>{env.companyBankName}</span>
          </div>

          <p className={styles.helpText}>
            Dopo aver effettuato il bonifico, carica qui la ricevuta (screenshot o PDF) — il nostro team la verificherà a breve
            e confermerà il pagamento.
          </p>

          {receiptsCount > 0 && (
            <p className={styles.successText}>
              ✓ {receiptsCount === 1 ? 'Ricevuta inviata.' : `${receiptsCount} ricevute inviate.`} Puoi caricarne un&rsquo;altra
              se necessario.
            </p>
          )}

          <form className={styles.uploadForm} onSubmit={handleUpload}>
            <label className={styles.fileButton}>
              {file ? file.name : 'Scegli un file (immagine o PDF)'}
              <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                className={styles.hiddenInput}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {uploadError && <span className={styles.errorText}>{uploadError}</span>}
            <Button type="submit" variant="primary" fullWidth loading={uploading} disabled={!file}>
              Invia ricevuta
            </Button>
          </form>
        </div>
      )}

      <ConfirmModal
        open={officeModalOpen}
        title="Confermi il pagamento in ufficio?"
        description="Avviseremo subito il negozio che passerai a pagare di persona. Non è richiesta nessun'altra azione adesso."
        confirmLabel="Confermo"
        variant="primary"
        loading={officeSubmitting}
        errorMessage={officeError}
        onConfirm={handleOfficeConfirm}
        onCancel={() => {
          setOfficeModalOpen(false);
          setOfficeError(null);
        }}
      />
    </div>
  );
}
