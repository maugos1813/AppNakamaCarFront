'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { changeOwnPassword, updateMe } from '@/lib/api/users';
import { fieldErrorMap } from '@/lib/api/http';
import { roleNameLabels } from '@/lib/staffLabels';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import detailStyles from '@/components/layout/DetailPage.module.css';
import styles from '@/components/ui/FormLayout.module.css';

export default function ProfilePage() {
  const { token, user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string>>({});
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});
  const [passwordChanged, setPasswordChanged] = useState(false);

  if (!user || !token) return null;

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileError(null);
    setProfileFieldErrors({});
    setProfileSaved(false);

    const result = await updateMe(token!, { fullName, phone: phone || undefined });
    setProfileSubmitting(false);
    if (result.ok) {
      updateUser(result.data);
      setProfileSaved(true);
    } else {
      setProfileError(result.message);
      setProfileFieldErrors(fieldErrorMap(result.fieldErrors));
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSubmitting(true);
    setPasswordError(null);
    setPasswordFieldErrors({});
    setPasswordChanged(false);

    const result = await changeOwnPassword(token!, { currentPassword, newPassword });
    setPasswordSubmitting(false);
    if (result.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setPasswordChanged(true);
    } else {
      setPasswordError(result.message);
      setPasswordFieldErrors(fieldErrorMap(result.fieldErrors));
    }
  }

  return (
    <div>
      <PageHeader title="Mi perfil" />

      <div className={detailStyles.sections}>
        <Card>
          <div className={detailStyles.infoGrid} style={{ marginBottom: 20 }}>
            <div className={detailStyles.infoItem}>
              <span className={detailStyles.infoLabel}>Email</span>
              <span className={detailStyles.infoValue}>{user.email}</span>
            </div>
            <div className={detailStyles.infoItem}>
              <span className={detailStyles.infoLabel}>Rol</span>
              <span className={detailStyles.infoValue}>{roleNameLabels[user.role.name] ?? user.role.name}</span>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleProfileSubmit}>
            {profileError && <div className={styles.errorBanner}>{profileError}</div>}
            {profileSaved && <span style={{ fontSize: 13, color: 'var(--success)' }}>Datos actualizados.</span>}

            <Input
              label="Nombre completo"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setProfileSaved(false);
              }}
              error={profileFieldErrors.fullName}
              required
            />
            <Input
              label="Teléfono (opcional)"
              value={phone ?? ''}
              onChange={(e) => {
                setPhone(e.target.value);
                setProfileSaved(false);
              }}
              error={profileFieldErrors.phone}
            />

            <div className={styles.actions}>
              <Button type="submit" variant="primary" loading={profileSubmitting}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <span className={detailStyles.sectionTitle}>Cambiar contraseña</span>
          <form className={styles.form} style={{ marginTop: 16 }} onSubmit={handlePasswordSubmit}>
            {passwordError && <div className={styles.errorBanner}>{passwordError}</div>}
            {passwordChanged && (
              <span style={{ fontSize: 13, color: 'var(--success)' }}>Contraseña actualizada.</span>
            )}

            <Input
              label="Contraseña actual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={passwordFieldErrors.currentPassword}
              required
            />
            <Input
              label="Nueva contraseña"
              type="password"
              hint="Mínimo 8 caracteres, con al menos una mayúscula y un número."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordFieldErrors.newPassword}
              required
            />

            <div className={styles.actions}>
              <Button type="submit" variant="primary" loading={passwordSubmitting}>
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
