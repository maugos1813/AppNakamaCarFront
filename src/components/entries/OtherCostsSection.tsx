'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { createOtherCost, deleteOtherCost, listOtherCosts, updateOtherCost } from '@/lib/api/entries';
import { formatCurrency } from '@/lib/format';
import type { StaffOtherCost } from '@/lib/types';
import styles from '@/components/jobs/ListSection.module.css';

export function OtherCostsSection({
  token,
  entryId,
  onMutated,
}: {
  token: string;
  entryId: string;
  onMutated?: () => void;
}) {
  const [costs, setCosts] = useState<StaffOtherCost[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    listOtherCosts(token, entryId).then((result) => {
      if (result.ok) setCosts(result.data);
    });
  }, [token, entryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await createOtherCost(token, entryId, {
      description,
      amount: Number(amount),
      category: category || undefined,
    });
    setSubmitting(false);
    if (result.ok) {
      setCosts((current) => [result.data, ...(current ?? [])]);
      setDescription('');
      setAmount('');
      setCategory('');
      setFormOpen(false);
      onMutated?.();
    } else {
      setError(result.message);
    }
  }

  function startEdit(cost: StaffOtherCost) {
    setEditingId(cost.id);
    setEditDescription(cost.description);
    setEditAmount(cost.amount);
    setEditCategory(cost.category ?? '');
    setEditError(null);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    setEditError(null);
    const result = await updateOtherCost(token, editingId, {
      description: editDescription,
      amount: Number(editAmount),
      category: editCategory || null,
    });
    setEditSubmitting(false);
    if (result.ok) {
      setCosts((current) => (current ?? []).map((cost) => (cost.id === editingId ? result.data : cost)));
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
    const result = await deleteOtherCost(token, deletingId);
    setDeleting(false);
    if (result.ok) {
      setCosts((current) => (current ?? []).filter((cost) => cost.id !== deletingId));
      setDeletingId(null);
      onMutated?.();
    } else {
      setDeleteError(result.message);
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>Otros costos</span>
        <Button variant="secondary" className={styles.addButton} onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? 'Cancelar' : '+ Agregar'}
        </Button>
      </div>

      {formOpen && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <div className={styles.formRow}>
            <Input
              label="Monto (€)"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Input label="Categoría (opcional)" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          {error && <span className={styles.error}>{error}</span>}
          <div className={styles.formActions}>
            <Button type="submit" variant="primary" loading={submitting}>
              Guardar
            </Button>
          </div>
        </form>
      )}

      {costs === null && <Skeleton height={60} radius={12} />}

      {costs !== null && costs.length === 0 && !formOpen && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay otros costos registrados.</span>
      )}

      {costs !== null &&
        costs.map((cost) =>
          editingId === cost.id ? (
            <form className={styles.form} onSubmit={handleEditSubmit} key={cost.id}>
              <Input label="Descripción" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required />
              <div className={styles.formRow}>
                <Input
                  label="Monto (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
                <Input label="Categoría (opcional)" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
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
            <div className={styles.row} key={cost.id}>
              <div className={styles.rowMain}>
                <div className={styles.rowTitleRow}>
                  <span className={styles.rowTitle}>{cost.description}</span>
                  {cost.approvedAt && <StatusBadge tone="success" label="Aprobado" />}
                </div>
                {cost.category && <span className={styles.rowDetail}>{cost.category}</span>}
              </div>
              <div className={styles.rowEnd}>
                <span className={styles.rowAmount}>{formatCurrency(cost.amount)}</span>
                <div className={styles.rowActions}>
                  <button type="button" className={styles.rowAction} onClick={() => startEdit(cost)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={styles.rowActionDanger}
                    onClick={() => {
                      setDeletingId(cost.id);
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
        title="¿Eliminar este costo?"
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
