'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { deleteEntry } from '@/lib/api/entries';
import type { JobEntry } from '@/lib/types';
import styles from './EntryStatusControl.module.css';

export function DeleteEntryAction({ token, entry }: { token: string; entry: JobEntry }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    const result = await deleteEntry(token, entry.id);
    setSubmitting(false);
    if (result.ok) {
      router.push('/entries');
    } else {
      setError(result.message);
    }
  }

  return (
    <div className={styles.actions}>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Eliminar ingreso
      </Button>

      <ConfirmModal
        open={open}
        title="¿Eliminar este ingreso permanentemente?"
        description={
          entry.invoice
            ? `Esto borra el ingreso completo, incluyendo su factura${entry.invoice.invoiceNumber ? ` (${entry.invoice.invoiceNumber})` : ''} y cualquier pago registrado contra ella, además de fotos, presupuesto e historial. No se puede deshacer.`
            : 'Esto borra el ingreso completo, incluyendo fotos, presupuesto e historial. No se puede deshacer.'
        }
        confirmLabel="Eliminar definitivamente"
        cancelLabel="Cancelar"
        variant="danger"
        loading={submitting}
        errorMessage={error}
        onConfirm={handleConfirm}
        onCancel={() => {
          setOpen(false);
          setError(null);
        }}
      />
    </div>
  );
}
