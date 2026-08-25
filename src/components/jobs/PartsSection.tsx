'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { createPart, deletePart, listParts, updatePart } from '@/lib/api/jobs';
import { formatCurrency } from '@/lib/format';
import type { StaffPart } from '@/lib/types';
import styles from './ListSection.module.css';

export function PartsSection({
  token,
  entryId,
  onMutated,
}: {
  token: string;
  entryId: string;
  onMutated?: () => void;
}) {
  const [parts, setParts] = useState<StaffPart[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPartNumber, setEditPartNumber] = useState('');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editUnitCost, setEditUnitCost] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    listParts(token, entryId).then((result) => {
      if (result.ok) setParts(result.data);
    });
  }, [token, entryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await createPart(token, entryId, {
      name,
      partNumber: partNumber || undefined,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      unitPrice: Number(unitPrice),
    });
    setSubmitting(false);
    if (result.ok) {
      setParts((current) => [result.data, ...(current ?? [])]);
      setName('');
      setPartNumber('');
      setQuantity('1');
      setUnitCost('');
      setUnitPrice('');
      setFormOpen(false);
      onMutated?.();
    } else {
      setError(result.message);
    }
  }

  function startEdit(part: StaffPart) {
    setEditingId(part.id);
    setEditName(part.name);
    setEditPartNumber(part.partNumber ?? '');
    setEditQuantity(String(part.quantity));
    setEditUnitCost(part.unitCost);
    setEditUnitPrice(part.unitPrice);
    setEditError(null);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    setEditError(null);
    const result = await updatePart(token, editingId, {
      name: editName,
      partNumber: editPartNumber || null,
      quantity: Number(editQuantity),
      unitCost: Number(editUnitCost),
      unitPrice: Number(editUnitPrice),
    });
    setEditSubmitting(false);
    if (result.ok) {
      setParts((current) => (current ?? []).map((part) => (part.id === editingId ? result.data : part)));
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
    const result = await deletePart(token, deletingId);
    setDeleting(false);
    if (result.ok) {
      setParts((current) => (current ?? []).filter((part) => part.id !== deletingId));
      setDeletingId(null);
      onMutated?.();
    } else {
      setDeleteError(result.message);
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>Repuestos</span>
        <Button variant="secondary" className={styles.addButton} onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? 'Cancelar' : '+ Agregar'}
        </Button>
      </div>

      {formOpen && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <Input label="Nombre del repuesto" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Código (opcional)" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} />
          </div>
          <div className={styles.formRow}>
            <Input
              label="Cantidad"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <Input
              label="Costo unitario (€)"
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              required
            />
          </div>
          <Input
            label="Precio unitario (€)"
            type="number"
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
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

      {parts === null && <Skeleton height={60} radius={12} />}

      {parts !== null && parts.length === 0 && !formOpen && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay repuestos registrados.</span>
      )}

      {parts !== null &&
        parts.map((part) =>
          editingId === part.id ? (
            <form className={styles.form} onSubmit={handleEditSubmit} key={part.id}>
              <div className={styles.formRow}>
                <Input label="Nombre del repuesto" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                <Input label="Código (opcional)" value={editPartNumber} onChange={(e) => setEditPartNumber(e.target.value)} />
              </div>
              <div className={styles.formRow}>
                <Input
                  label="Cantidad"
                  type="number"
                  min="1"
                  step="1"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  required
                />
                <Input
                  label="Costo unitario (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editUnitCost}
                  onChange={(e) => setEditUnitCost(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Precio unitario (€)"
                type="number"
                min="0"
                step="0.01"
                value={editUnitPrice}
                onChange={(e) => setEditUnitPrice(e.target.value)}
                required
              />
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
            <div className={styles.row} key={part.id}>
              <div className={styles.rowMain}>
                <div className={styles.rowTitleRow}>
                  <span className={styles.rowTitle}>
                    {part.name}
                    {part.quantity > 1 ? ` × ${part.quantity}` : ''}
                  </span>
                  {part.approvedAt && <StatusBadge tone="success" label="Aprobado" />}
                </div>
                {part.partNumber && <span className={styles.rowDetail}>{part.partNumber}</span>}
              </div>
              <div className={styles.rowEnd}>
                <span className={styles.rowAmount}>{formatCurrency(part.total)}</span>
                <div className={styles.rowActions}>
                  <button type="button" className={styles.rowAction} onClick={() => startEdit(part)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={styles.rowActionDanger}
                    onClick={() => {
                      setDeletingId(part.id);
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
        title="¿Eliminar este repuesto?"
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
