'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { createLaborItem, deleteLaborItem, listLaborItems, updateLaborItem } from '@/lib/api/jobs';
import { formatCurrency } from '@/lib/format';
import type { StaffLaborItem } from '@/lib/types';
import styles from './ListSection.module.css';

export function LaborSection({
  token,
  entryId,
  onMutated,
}: {
  token: string;
  entryId: string;
  onMutated?: () => void;
}) {
  const [items, setItems] = useState<StaffLaborItem[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editHourlyRate, setEditHourlyRate] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    listLaborItems(token, entryId).then((result) => {
      if (result.ok) setItems(result.data);
    });
  }, [token, entryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await createLaborItem(token, entryId, {
      description,
      hours: Number(hours),
      hourlyRate: Number(hourlyRate),
    });
    setSubmitting(false);
    if (result.ok) {
      setItems((current) => [result.data, ...(current ?? [])]);
      setDescription('');
      setHours('');
      setHourlyRate('');
      setFormOpen(false);
      onMutated?.();
    } else {
      setError(result.message);
    }
  }

  function startEdit(item: StaffLaborItem) {
    setEditingId(item.id);
    setEditDescription(item.description);
    setEditHours(item.hours);
    setEditHourlyRate(item.hourlyRate);
    setEditError(null);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    setEditError(null);
    const result = await updateLaborItem(token, editingId, {
      description: editDescription,
      hours: Number(editHours),
      hourlyRate: Number(editHourlyRate),
    });
    setEditSubmitting(false);
    if (result.ok) {
      setItems((current) => (current ?? []).map((item) => (item.id === editingId ? result.data : item)));
      setEditingId(null);
      onMutated?.();
    } else {
      setEditError(result.message);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteLaborItem(token, deletingId);
    setDeleting(false);
    if (result.ok) {
      setItems((current) => (current ?? []).filter((item) => item.id !== deletingId));
      setDeletingId(null);
      onMutated?.();
    } else {
      setDeleteError(result.message);
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>Mano de obra</span>
        <Button variant="secondary" className={styles.addButton} onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? 'Cancelar' : '+ Agregar'}
        </Button>
      </div>

      {formOpen && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <div className={styles.formRow}>
            <Input
              label="Horas"
              type="number"
              min="0"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
            <Input
              label="Tarifa horaria (€)"
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required
            />
          </div>
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
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay mano de obra registrada.</span>
      )}

      {items !== null &&
        items.map((item) =>
          editingId === item.id ? (
            <form className={styles.form} onSubmit={handleEditSubmit} key={item.id}>
              <Input label="Descripción" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required />
              <div className={styles.formRow}>
                <Input
                  label="Horas"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  required
                />
                <Input
                  label="Tarifa horaria (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editHourlyRate}
                  onChange={(e) => setEditHourlyRate(e.target.value)}
                  required
                />
              </div>
              {editError && <span className={styles.error}>{editError}</span>}
              <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={editSubmitting}>
                  Guardar cambios
                </Button>
              </div>
            </form>
          ) : (
            <div className={styles.row} key={item.id}>
              <div className={styles.rowMain}>
                <div className={styles.rowTitleRow}>
                  <span className={styles.rowTitle}>{item.description}</span>
                  {item.approvedAt && <StatusBadge tone="success" label="Aprobado" />}
                </div>
                <span className={styles.rowDetail}>
                  {item.hours} h × {formatCurrency(item.hourlyRate)}
                </span>
              </div>
              <div className={styles.rowEnd}>
                <span className={styles.rowAmount}>{formatCurrency(item.total)}</span>
                <div className={styles.rowActions}>
                  <button type="button" className={styles.rowAction} onClick={() => startEdit(item)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={styles.rowActionDanger}
                    onClick={() => {
                      setDeletingId(item.id);
                      setDeleteError(null);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ),
        )}

      <ConfirmModal
        open={deletingId !== null}
        title="¿Eliminar esta mano de obra?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleting}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeletingId(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
