'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import type { CreateUserInput, UpdateUserInput } from '@/lib/api/users';
import { roleNameLabels } from '@/lib/staffLabels';
import type { Role, StaffUser } from '@/lib/types';
import styles from '@/components/ui/FormLayout.module.css';

type SubmitResult = { ok: true } | { ok: false; message: string; fieldErrors: Record<string, string> };

type UserFormProps =
  | {
      mode: 'create';
      roles: Role[];
      submitLabel: string;
      onSubmit: (input: CreateUserInput) => Promise<SubmitResult>;
      onCancel: () => void;
    }
  | {
      mode: 'edit';
      roles: Role[];
      initial: StaffUser;
      submitLabel: string;
      onSubmit: (input: UpdateUserInput) => Promise<SubmitResult>;
      onCancel: () => void;
    };

export function UserForm(props: UserFormProps) {
  const { mode, roles, submitLabel, onCancel } = props;
  const initial = mode === 'edit' ? props.initial : undefined;

  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [roleId, setRoleId] = useState(initial?.roleId ?? roles[0]?.id ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const roleOptions = roles.map((role) => ({ value: role.id, label: roleNameLabels[role.name] ?? role.name }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const result =
      mode === 'create'
        ? await props.onSubmit({ fullName, email, password, roleId, phone: phone || undefined })
        : await props.onSubmit({ fullName, phone: phone || undefined, roleId, isActive });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      setFieldErrors(result.fieldErrors);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.errorBanner}>{error}</div>}

      <Input
        label="Nombre completo"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={fieldErrors.fullName}
        required
      />

      {mode === 'create' && (
        <div className={styles.grid2}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            hint="Mínimo 8 caracteres, con al menos una mayúscula y un número."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
          />
        </div>
      )}

      <div className={styles.grid2}>
        <Select
          label="Rol"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          options={roleOptions}
          error={fieldErrors.roleId}
          required
        />
        <Input
          label="Teléfono (opcional)"
          value={phone ?? ''}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldErrors.phone}
        />
      </div>

      {mode === 'edit' && (
        <Switch checked={isActive} onChange={setIsActive} label="Usuario activo (puede iniciar sesión)" />
      )}

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
