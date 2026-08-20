'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { createLaborItem, listLaborItems } from '@/lib/api/jobs';
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
        items.map((item) => (
          <div className={styles.row} key={item.id}>
            <div className={styles.rowMain}>
              <span className={styles.rowTitle}>{item.description}</span>
              <span className={styles.rowDetail}>
                {item.hours} h × {formatCurrency(item.hourlyRate)}
              </span>
            </div>
            <span className={styles.rowAmount}>{formatCurrency(item.total)}</span>
          </div>
        ))}
    </div>
  );
}
