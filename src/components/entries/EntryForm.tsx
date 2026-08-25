'use client';

import { useEffect, useRef, useState } from 'react';
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
    photoFiles: File[],
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
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handlePhotoFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setPhotoFiles((current) => [...current, ...selected]);
    if (photoInputRef.current) photoInputRef.current.value = '';
  }

  function removePhotoFile(index: number) {
    setPhotoFiles((current) => current.filter((_, i) => i !== index));
  }

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

    const result = await onSubmit(
      {
        vehicleId,
        odometerReading: Number(odometerReading),
        fuelLevel,
        exteriorConditionNotes: exteriorConditionNotes || undefined,
        hasSpareTire,
        hasDocuments,
        estimatedCompletionDate: estimatedCompletionDate || undefined,
      },
      photoFiles,
    );

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

      <div className={styles.photoField}>
        <span className={styles.sectionLabel}>Fotos del vehículo al ingreso (opcional)</span>
        <label className={styles.photoButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 8h3l2-3h6l2 3h3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Z"
            />
            <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
          </svg>
          Agregar fotos
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className={styles.hiddenInput}
            onChange={handlePhotoFilesSelected}
          />
        </label>

        {photoFiles.length > 0 && (
          <ul className={styles.photoList}>
            {photoFiles.map((file, index) => (
              <li key={`${file.name}-${index}`} className={styles.photoListItem}>
                <span className={styles.photoName}>{file.name}</span>
                <button type="button" className={styles.photoRemove} onClick={() => removePhotoFile(index)}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {photoFiles.length > 0 ? 'Crear ingreso y subir fotos' : 'Crear ingreso'}
        </Button>
      </div>
    </form>
  );
}
