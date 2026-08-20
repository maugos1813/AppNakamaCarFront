'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { createOtherCost, listOtherCosts } from '@/lib/api/entries';
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
        costs.map((cost) => (
          <div className={styles.row} key={cost.id}>
            <div className={styles.rowMain}>
              <span className={styles.rowTitle}>{cost.description}</span>
              {cost.category && <span className={styles.rowDetail}>{cost.category}</span>}
            </div>
            <span className={styles.rowAmount}>{formatCurrency(cost.amount)}</span>
          </div>
        ))}
    </div>
  );
}
