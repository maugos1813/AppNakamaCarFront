'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { changeEntryStatus } from '@/lib/api/entries';
import type { VehicleEntryStatus } from '@/lib/types';
import styles from './EntryStatusControl.module.css';

// Mirrors the backend's ALLOWED_TRANSITIONS exactly (entries.service.ts).
const TRANSITIONS: Record<VehicleEntryStatus, VehicleEntryStatus[]> = {
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['DELIVERED', 'IN_PROGRESS'],
  DELIVERED: [],
  CANCELLED: [],
};

const ACTION_LABEL: Partial<Record<VehicleEntryStatus, string>> = {
  COMPLETED: 'Marcar como listo para retirar',
  CANCELLED: 'Cancelar ingreso',
  DELIVERED: 'Marcar como entregado',
  IN_PROGRESS: 'Reabrir (volver a en reparación)',
};

// These transitions trigger a real email to the client (notifyEntryStatusChange).
const NOTIFIES_CLIENT = new Set<VehicleEntryStatus>(['COMPLETED', 'DELIVERED', 'CANCELLED']);

export function EntryStatusControl({
  token,
  entryId,
  currentStatus,
  isAdmin,
  onMutated,
}: {
  token: string;
  entryId: string;
  currentStatus: VehicleEntryStatus;
  isAdmin: boolean;
  onMutated: () => void;
}) {
  const [target, setTarget] = useState<VehicleEntryStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A mechanic only gets to say "this is done" — cancelling the job,
  // reopening it, or handing it over (which is tied to payment) stay
  // admin-only decisions.
  const options = isAdmin ? TRANSITIONS[currentStatus] : TRANSITIONS[currentStatus].filter((s) => s === 'COMPLETED');
  if (options.length === 0) return null;

  async function handleConfirm() {
    if (!target) return;
    setSubmitting(true);
    setError(null);
    const result = await changeEntryStatus(token, entryId, target);
    setSubmitting(false);
    if (result.ok) {
      setTarget(null);
      onMutated();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className={styles.actions}>
      {options.map((status) => (
        <Button key={status} variant={status === 'CANCELLED' ? 'danger' : 'secondary'} onClick={() => setTarget(status)}>
          {ACTION_LABEL[status]}
        </Button>
      ))}

      <ConfirmModal
        open={target !== null}
        title="¿Confirmas el cambio de estado?"
        description={
          target && NOTIFIES_CLIENT.has(target)
            ? 'Se notificará al cliente por email.'
            : 'Este cambio no envía ninguna notificación.'
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant={target === 'CANCELLED' ? 'danger' : 'primary'}
        loading={submitting}
        errorMessage={error}
        onConfirm={handleConfirm}
        onCancel={() => {
          setTarget(null);
          setError(null);
        }}
      />
    </div>
  );
}
