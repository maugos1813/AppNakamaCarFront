'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import type { ClientInput } from '@/lib/api/clients';
import type { Client } from '@/lib/types';
import styles from '@/components/ui/FormLayout.module.css';

interface ClientFormProps {
  initial?: Client;
  submitLabel: string;
  onSubmit: (
    input: ClientInput,
  ) => Promise<{ ok: true } | { ok: false; message: string; fieldErrors: Record<string, string> }>;
  onCancel: () => void;
}

export function ClientForm({ initial, submitLabel, onSubmit, onCancel }: ClientFormProps) {
  const [isCompany, setIsCompany] = useState(initial?.isCompany ?? false);
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [companyName, setCompanyName] = useState(initial?.companyName ?? '');
  const [vatNumber, setVatNumber] = useState(initial?.vatNumber ?? '');
  const [fiscalCode, setFiscalCode] = useState(initial?.fiscalCode ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [addressLine, setAddressLine] = useState(initial?.addressLine ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? '');
  const [province, setProvince] = useState(initial?.province ?? '');
  const [country, setCountry] = useState(initial?.country ?? 'IT');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const result = await onSubmit({
      isCompany,
      fullName,
      companyName: isCompany ? companyName : undefined,
      vatNumber: isCompany ? vatNumber : undefined,
      fiscalCode: fiscalCode || undefined,
      email: email || undefined,
      phone,
      addressLine: addressLine || undefined,
      city: city || undefined,
      postalCode: postalCode || undefined,
      province: province || undefined,
      country,
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
      <Switch checked={isCompany} onChange={setIsCompany} label="Cliente empresa" />

      {error && <div className={styles.errorBanner}>{error}</div>}

      <Input
        label="Nombre y apellido"
        hint={isCompany ? 'Persona de contacto' : undefined}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={fieldErrors.fullName}
        required
      />

      {isCompany && (
        <div className={styles.grid2}>
          <Input
            label="Razón social"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            error={fieldErrors.companyName}
            required
          />
          <Input
            label="N.º de IVA"
            hint="11 dígitos"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            error={fieldErrors.vatNumber}
            required
          />
        </div>
      )}

      <div className={styles.grid2}>
        <Input
          label="Código fiscal"
          hint="16 caracteres (opcional)"
          value={fiscalCode}
          onChange={(e) => setFiscalCode(e.target.value)}
          error={fieldErrors.fiscalCode}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
      </div>

      <Input
        label="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={fieldErrors.phone}
        required
      />

      <span className={styles.sectionLabel}>Dirección</span>

      <Input label="Calle y número" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />

      <div className={styles.grid3}>
        <Input label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
        <Input label="Código postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
        <Input label="Provincia" value={province} onChange={(e) => setProvince(e.target.value)} maxLength={2} />
      </div>

      <div className={styles.grid2}>
        <Input
          label="País"
          hint="código ISO de 2 letras"
          value={country}
          onChange={(e) => setCountry(e.target.value.toUpperCase())}
          maxLength={2}
          error={fieldErrors.country}
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
