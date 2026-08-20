'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { createPart, listParts } from '@/lib/api/jobs';
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
        parts.map((part) => (
          <div className={styles.row} key={part.id}>
            <div className={styles.rowMain}>
              <span className={styles.rowTitle}>
                {part.name}
                {part.quantity > 1 ? ` × ${part.quantity}` : ''}
              </span>
              {part.partNumber && <span className={styles.rowDetail}>{part.partNumber}</span>}
            </div>
            <span className={styles.rowAmount}>{formatCurrency(part.total)}</span>
          </div>
        ))}
    </div>
  );
}
