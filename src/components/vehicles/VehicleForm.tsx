'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { listClients } from '@/lib/api/clients';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { clientDisplayName } from '@/lib/format';
import { fuelTypeLabels } from '@/lib/staffLabels';
import type { VehicleInput } from '@/lib/api/vehicles';
import type { Client, FuelType, Vehicle } from '@/lib/types';
import styles from '@/components/ui/FormLayout.module.css';

const fuelOptions = (Object.entries(fuelTypeLabels) as [FuelType, string][]).map(([value, label]) => ({
  value,
  label,
}));

interface VehicleFormProps {
  initial?: Vehicle;
  initialClientId?: string;
  submitLabel: string;
  onSubmit: (
    input: VehicleInput,
  ) => Promise<{ ok: true } | { ok: false; message: string; fieldErrors: Record<string, string> }>;
  onCancel: () => void;
}

export function VehicleForm({ initial, initialClientId, submitLabel, onSubmit, onCancel }: VehicleFormProps) {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[] | null>(null);

  const [clientId, setClientId] = useState(initial?.clientId ?? initialClientId ?? '');
  const [licensePlate, setLicensePlate] = useState(initial?.licensePlate ?? '');
  const [vin, setVin] = useState(initial?.vin ?? '');
  const [make, setMake] = useState(initial?.make ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [year, setYear] = useState(initial?.year ? String(initial.year) : '');
  const [color, setColor] = useState(initial?.color ?? '');
  const [fuelType, setFuelType] = useState<FuelType | ''>(initial?.fuelType ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) return;
    listClients(token, { pageSize: 100 }).then((result) => {
      if (result.ok) {
        setClients([...result.data.items].sort((a, b) => clientDisplayName(a).localeCompare(clientDisplayName(b))));
      }
    });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const result = await onSubmit({
      clientId,
      licensePlate,
      vin: vin || undefined,
      make,
      model,
      year: year ? Number(year) : undefined,
      color: color || undefined,
      fuelType: fuelType || undefined,
      notes: notes || undefined,
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
        label="Cliente"
        placeholder={clients ? 'Selecciona un cliente' : 'Cargando...'}
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        options={(clients ?? []).map((c) => ({ value: c.id, label: clientDisplayName(c) }))}
        error={fieldErrors.clientId}
        disabled={!clients}
        required
      />

      <div className={styles.grid2}>
        <Input
          label="Matrícula"
          hint="se convertirá a mayúsculas"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          error={fieldErrors.licensePlate}
          required
        />
        <Input
          label="Chasis (VIN)"
          hint="17 caracteres (opcional)"
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          error={fieldErrors.vin}
        />
      </div>

      <div className={styles.grid2}>
        <Input label="Marca" value={make} onChange={(e) => setMake(e.target.value)} error={fieldErrors.make} required />
        <Input
          label="Modelo"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          error={fieldErrors.model}
          required
        />
      </div>

      <div className={styles.grid3}>
        <Input
          label="Año"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          error={fieldErrors.year}
        />
        <Input label="Color" value={color} onChange={(e) => setColor(e.target.value)} />
        <Select
          label="Combustible"
          placeholder="No especificado"
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value as FuelType)}
          options={fuelOptions}
        />
      </div>

      <Textarea label="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
