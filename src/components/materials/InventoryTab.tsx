'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import {
  createInventoryItem,
  deleteInventoryItem,
  listInventoryItems,
  updateInventoryItem,
} from '@/lib/api/materials';
import type { InventoryItem } from '@/lib/types';
import styles from '@/components/jobs/ListSection.module.css';

// Below minQuantity the row gets a "Stock bajo" flag — purely a display
// hint, nothing here ever blocks or auto-reorders.
function isLowStock(item: InventoryItem) {
  if (item.minQuantity === null) return false;
  return Number(item.quantity) <= Number(item.minQuantity);
}

export function InventoryTab({ token, isAdmin }: { token: string; isAdmin: boolean }) {
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editMinQuantity, setEditMinQuantity] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    listInventoryItems(token).then((result) => {
      if (result.ok) setItems(result.data);
    });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await createInventoryItem(token, {
      name,
      unit,
      quantity: Number(quantity || 0),
      minQuantity: minQuantity ? Number(minQuantity) : undefined,
      notes: notes || undefined,
    });
    setSubmitting(false);
    if (result.ok) {
      setItems((current) => [...(current ?? []), result.data].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setUnit('');
      setQuantity('');
      setMinQuantity('');
      setNotes('');
      setFormOpen(false);
    } else {
      setError(result.message);
    }
  }

  function startEdit(item: InventoryItem) {
    setEditingId(item.id);
    setEditQuantity(item.quantity);
    setEditMinQuantity(item.minQuantity ?? '');
    setEditNotes(item.notes ?? '');
    setEditError(null);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    setEditError(null);
    const result = await updateInventoryItem(token, editingId, {
      quantity: Number(editQuantity || 0),
      minQuantity: editMinQuantity ? Number(editMinQuantity) : null,
      notes: editNotes || null,
    });
    setEditSubmitting(false);
    if (result.ok) {
      setItems((current) => (current ?? []).map((item) => (item.id === editingId ? result.data : item)));
      setEditingId(null);
    } else {
      setEditError(result.message);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteInventoryItem(token, deletingId);
    setDeleting(false);
    if (result.ok) {
      setItems((current) => (current ?? []).filter((item) => item.id !== deletingId));
      setDeletingId(null);
    } else {
      setDeleteError(result.message);
    }
  }

  return (
    <div className={styles.section}>
      {isAdmin && (
        <div className={styles.header}>
          <span className={styles.title}>Inventario</span>
          <Button variant="secondary" className={styles.addButton} onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? 'Cancelar' : '+ Nuevo material'}
          </Button>
        </div>
      )}

      {formOpen && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Unidad" placeholder="Ej: litro, unidad, kg" value={unit} onChange={(e) => setUnit(e.target.value)} required />
          </div>
          <div className={styles.formRow}>
            <Input
              label="Cantidad en stock"
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <Input
              label="Stock mínimo (opcional)"
              type="number"
              min="0"
              step="0.01"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
            />
          </div>
          <Input label="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay materiales registrados.</span>
      )}

      {items !== null &&
        items.map((item) =>
          editingId === item.id ? (
            <form className={styles.form} onSubmit={handleEditSubmit} key={item.id}>
              <div className={styles.formRow}>
                <Input
                  label="Cantidad en stock"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  required
                />
                <Input
                  label="Stock mínimo (opcional)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editMinQuantity}
                  onChange={(e) => setEditMinQuantity(e.target.value)}
                />
              </div>
              <Input label="Notas (opcional)" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
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
                  <span className={styles.rowTitle}>{item.name}</span>
                  {isLowStock(item) && <StatusBadge tone="danger" label="Stock bajo" />}
                </div>
                <span className={styles.rowDetail}>
                  {item.quantity} {item.unit}
                  {item.notes ? ` · ${item.notes}` : ''}
                </span>
              </div>
              {isAdmin && (
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
              )}
            </div>
          ),
        )}

      <ConfirmModal
        open={deletingId !== null}
        title="¿Eliminar este material del inventario?"
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
