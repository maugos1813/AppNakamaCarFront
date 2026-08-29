'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { captureSignature } from '@/lib/api/entries';
import { formatDateTime } from '@/lib/format';
import { SignaturePad, type SignaturePadHandle } from './SignaturePad';
import type { JobEntry, SignatureType } from '@/lib/types';
import styles from '@/components/jobs/ListSection.module.css';

interface SignatureBlockProps {
  token: string;
  entryId: string;
  type: SignatureType;
  label: string;
  url: string | null;
  signedAt: string | null;
  signedByName: string | null;
  canCapture: boolean;
  // A void trigger that refetches the whole entry, not the raw mutation
  // response — entries.repository.ts's update() doesn't include the
  // vehicle/stages/invoice relations JobEntry needs, same as every other
  // section's onMutated in EntryDetail.
  onCaptured: () => void;
}

function SignatureBlock({ token, entryId, type, label, url, signedAt, signedByName, canCapture, onCaptured }: SignatureBlockProps) {
  const [open, setOpen] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const padRef = useRef<SignaturePadHandle>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) {
      setError('Dibuja la firma antes de guardar.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await captureSignature(token, entryId, {
      type,
      signerName,
      imageDataUrl: pad.toDataURL(),
    });
    setSubmitting(false);
    if (result.ok) {
      onCaptured();
      setOpen(false);
      setSignerName('');
    } else {
      setError(result.message);
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowMain} style={{ flex: 1 }}>
        <span className={styles.rowTitle}>{label}</span>

        {url && !open && (
          <>
            <span className={styles.rowDetail}>
              Firmado por {signedByName} · {formatDateTime(signedAt, 'es-ES')}
            </span>
            <span className={styles.rowActions} style={{ marginTop: 4 }}>
              <a href={url} target="_blank" rel="noopener noreferrer" className={styles.rowAction}>
                Ver firma
              </a>
              {canCapture && (
                <button type="button" className={styles.rowAction} onClick={() => setOpen(true)}>
                  Reemplazar
                </button>
              )}
            </span>
          </>
        )}

        {!url && !open && (
          <>
            <span className={styles.rowDetail}>{canCapture ? 'Sin firmar todavía.' : 'Sin firmar — solo el administrador puede capturarla.'}</span>
            {canCapture && (
              <span className={styles.rowActions} style={{ marginTop: 4 }}>
                <button type="button" className={styles.rowAction} onClick={() => setOpen(true)}>
                  Capturar firma
                </button>
              </span>
            )}
          </>
        )}

        {open && (
          <form className={styles.form} style={{ marginTop: 8 }} onSubmit={handleSave}>
            <Input
              label="Nombre de quien firma"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              required
            />
            <SignaturePad ref={padRef} />
            {error && <span className={styles.error}>{error}</span>}
            <div className={styles.formActions}>
              <Button type="button" variant="secondary" onClick={() => padRef.current?.clear()}>
                Borrar
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                Guardar firma
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function SignaturesSection({
  token,
  entry,
  isAdmin,
  onMutated,
}: {
  token: string;
  entry: JobEntry;
  isAdmin: boolean;
  onMutated: () => void;
}) {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>Firmas</span>
      </div>

      <SignatureBlock
        token={token}
        entryId={entry.id}
        type="INTAKE"
        label="Firma de recepción"
        url={entry.intakeSignatureUrl}
        signedAt={entry.intakeSignedAt}
        signedByName={entry.intakeSignedByName}
        canCapture
        onCaptured={onMutated}
      />
      <SignatureBlock
        token={token}
        entryId={entry.id}
        type="DELIVERY"
        label="Firma de entrega"
        url={entry.deliverySignatureUrl}
        signedAt={entry.deliverySignedAt}
        signedByName={entry.deliverySignedByName}
        canCapture={isAdmin}
        onCaptured={onMutated}
      />
    </div>
  );
}
