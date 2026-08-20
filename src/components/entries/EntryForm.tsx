'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { listVehicles } from '@/lib/api/vehicles';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { clientDisplayName } from '@/lib/format';
import { fuelLevelLabels } from '@/lib/staffLabels';
import type { CreateEntryInput } from '@/lib/api/entries';
import type { FuelLevel, VehicleWithClient } from '@/lib/types';
import styles from '@/components/ui/FormLayout.module.css';

const fuelOptions = (Object.entries(fuelLevelLabels) as [FuelLevel, string][]).map(([value, label]) => ({
  value,
  label,
}));

interface EntryFormProps {
  initialVehicleId?: string;
  onSubmit: (
    input: CreateEntryInput,
  ) => Promise<{ ok: true } | { ok: false; message: string; fieldErrors: Record<string, string> }>;
  onCancel: () => void;
}

export function EntryForm({ initialVehicleId, onSubmit, onCancel }: EntryFormProps) {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleWithClient[] | null>(null);

  const [vehicleId, setVehicleId] = useState(initialVehicleId ?? '');
  const [odometerReading, setOdometerReading] = useState('');
  const [fuelLevel, setFuelLevel] = useState<FuelLevel>('HALF');
  const [exteriorConditionNotes, setExteriorConditionNotes] = useState('');
  const [hasSpareTire, setHasSpareTire] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) return;
    listVehicles(token, { pageSize: 100 }).then((result) => {
      if (result.ok) {
        setVehicles(
          [...result.data.items].sort((a, b) => a.licensePlate.localeCompare(b.licensePlate)),
        );
      }
    });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const result = await onSubmit({
      vehicleId,
      odometerReading: Number(odometerReading),
      fuelLevel,
      exteriorConditionNotes: exteriorConditionNotes || undefined,
      hasSpareTire,
      hasDocuments,
      estimatedCompletionDate: estimatedCompletionDate || undefined,
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      setFieldErrors(result.fieldErrors);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.errorBanner}>{error}</div>}

      <Select
        label="Vehículo"
        placeholder={vehicles ? 'Selecciona un vehículo' : 'Cargando...'}
        value={vehicleId}
        onChange={(e) => setVehicleId(e.target.value)}
        options={(vehicles ?? []).map((v) => ({
          value: v.id,
          label: `${v.licensePlate} — ${clientDisplayName(v.client)}`,
        }))}
        error={fieldErrors.vehicleId}
        disabled={!vehicles}
        required
      />

      <div className={styles.grid2}>
        <Input
          label="Kilometraje"
          type="number"
          min="0"
          value={odometerReading}
          onChange={(e) => setOdometerReading(e.target.value)}
          error={fieldErrors.odometerReading}
          required
        />
        <Select
          label="Nivel de combustible"
          value={fuelLevel}
          onChange={(e) => setFuelLevel(e.target.value as FuelLevel)}
          options={fuelOptions}
        />
      </div>

      <Input
        label="Entrega estimada (opcional)"
        type="date"
        value={estimatedCompletionDate}
        onChange={(e) => setEstimatedCompletionDate(e.target.value)}
        error={fieldErrors.estimatedCompletionDate}
      />

      <Textarea
        label="Estado exterior del vehículo"
        placeholder="Rayones, golpes, desgaste visible al momento del ingreso (opcional)"
        value={exteriorConditionNotes}
        onChange={(e) => setExteriorConditionNotes(e.target.value)}
      />

      <div className={styles.grid2}>
        <Switch checked={hasSpareTire} onChange={setHasSpareTire} label="Trae rueda de auxilio" />
        <Switch checked={hasDocuments} onChange={setHasDocuments} label="Trae documentación" />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Crear ingreso
        </Button>
      </div>
    </form>
  );
}
