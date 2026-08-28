'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  createWorkRequest,
  deleteWorkRequest,
  listWorkRequestsByEntry,
  setWorkRequestStatus,
} from '@/lib/api/workRequests';
import { workRequestStatusLabels, workRequestStatusTones } from '@/lib/staffLabels';
import { formatDateTime } from '@/lib/format';
import type { EntryWorkRequest } from '@/lib/types';
import styles from './ListSection.module.css';

// Where the mechanic writes up what needs doing, with no price attached —
// admin reads these, adds the priced labor/part/other-cost items elsewhere
// on this same page, then marks each request Cotizada or Descartada here.
export function WorkRequestsSection({ token, entryId, isAdmin }: { token: string; entryId: string; isAdmin: boolean }) {
  const [items, setItems] = useState<EntryWorkRequest[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    listWorkRequestsByEntry(token, entryId).then((result) => {
      if (result.ok) setItems(result.data);
    });
  }, [token, entryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await createWorkRequest(token, entryId, description);
    setSubmitting(false);
    if (result.ok) {
      setItems((current) => [result.data, ...(current ?? [])]);
      setDescription('');
      setFormOpen(false);
    } else {
      setError(result.message);
    }
  }

  async function handleSetStatus(id: string, status: 'PRICED' | 'DISMISSED') {
    setBusyId(id);
    const result = await setWorkRequestStatus(token, id, status);
    setBusyId(null);
    if (result.ok) {
      setItems((current) => current?.map((item) => (item.id === id ? result.data : item)) ?? null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    const result = await deleteWorkRequest(token, id);
    setBusyId(null);
    if (result.ok) {
      setItems((current) => current?.filter((item) => item.id !== id) ?? null);
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>Richiesta</span>
        <Button variant="secondary" className={styles.addButton} onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? 'Cancelar' : '+ Agregar'}
        </Button>
      </div>

      {formOpen && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <Textarea
            label="Qué hay que hacer"
            placeholder="Ej: cambiar pastillas de freno delanteras, están al límite"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {error && <span className={styles.error}>{error}</span>}
          <div className={styles.formActions}>
            <Button type="submit" variant="primary" loading={submitting}>
              Guardar
            </Button>
          </div>
        </form>
      )}

      {items === null && <Skeleton height={60} radius={12} />}

      {items !== null && items.length === 0 && !formOpen && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin trabajo pendiente de cotizar.</span>
      )}

      {items !== null &&
        items.map((item) => (
          <div className={styles.row} key={item.id}>
            <div className={styles.rowMain}>
              <span className={styles.rowTitle}>{item.description}</span>
              <span className={styles.rowDetail}>{formatDateTime(item.createdAt, 'es-ES')}</span>
              {(isAdmin || item.status === 'PENDING') && (
                <span className={styles.rowActions}>
                  {isAdmin && item.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        className={styles.rowAction}
                        disabled={busyId === item.id}
                        onClick={() => handleSetStatus(item.id, 'PRICED')}
                      >
                        Marcar cotizada
                      </button>
                      <button
                        type="button"
                        className={styles.rowActionDanger}
                        disabled={busyId === item.id}
                        onClick={() => handleSetStatus(item.id, 'DISMISSED')}
                      >
                        Descartar
                      </button>
                    </>
                  )}
                  {item.status === 'PENDING' && (
                    <button
                      type="button"
                      className={styles.rowActionDanger}
                      disabled={busyId === item.id}
                      onClick={() => handleDelete(item.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </span>
              )}
            </div>
            <StatusBadge tone={workRequestStatusTones[item.status]} label={workRequestStatusLabels[item.status]} />
          </div>
        ))}
    </div>
  );
}
