'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { createDamage, listDamages } from '@/lib/api/jobs';
import { damageSeverityLabels, damageSeverityTones } from '@/lib/staffLabels';
import { formatDate } from '@/lib/format';
import type { DamageSeverity, StaffDamage } from '@/lib/types';
import styles from './ListSection.module.css';

const severityOptions = (Object.entries(damageSeverityLabels) as [DamageSeverity, string][]).map(([value, label]) => ({
  value,
  label,
}));

export function DamagesSection({ token, entryId }: { token: string; entryId: string }) {
  const [damages, setDamages] = useState<StaffDamage[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<DamageSeverity>('MINOR');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listDamages(token, entryId).then((result) => {
      if (result.ok) setDamages(result.data);
    });
  }, [token, entryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await createDamage(token, entryId, { area, description, severity });
    setSubmitting(false);
    if (result.ok) {
      setDamages((current) => [result.data, ...(current ?? [])]);
      setArea('');
      setDescription('');
      setSeverity('MINOR');
      setFormOpen(false);
    } else {
      setError(result.message);
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>Daños</span>
        <Button variant="secondary" className={styles.addButton} onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? 'Cancelar' : '+ Agregar'}
        </Button>
      </div>

      {formOpen && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <Input label="Zona" value={area} onChange={(e) => setArea(e.target.value)} required />
            <Select
              label="Gravedad"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as DamageSeverity)}
              options={severityOptions}
            />
          </div>
          <Input label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} required />
          {error && <span className={styles.error}>{error}</span>}
          <div className={styles.formActions}>
            <Button type="submit" variant="primary" loading={submitting}>
              Guardar
            </Button>
          </div>
        </form>
      )}

      {damages === null && <Skeleton height={60} radius={12} />}

      {damages !== null && damages.length === 0 && !formOpen && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay daños registrados.</span>
      )}

      {damages !== null &&
        damages.map((damage) => (
          <div className={styles.row} key={damage.id}>
            <div className={styles.rowMain}>
              <span className={styles.rowTitle}>{damage.area}</span>
              <span className={styles.rowDetail}>{damage.description}</span>
              <span className={styles.rowDetail}>{formatDate(damage.createdAt, 'es-ES')}</span>
            </div>
            <StatusBadge tone={damageSeverityTones[damage.severity]} label={damageSeverityLabels[damage.severity]} />
          </div>
        ))}
    </div>
  );
}
