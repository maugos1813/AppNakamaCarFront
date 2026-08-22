'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { deleteVehicle, getVehicle } from '@/lib/api/vehicles';
import { clientDisplayName } from '@/lib/format';
import { fuelTypeLabels } from '@/lib/staffLabels';
import { clientDetailPath, vehicleEditPath } from '@/lib/routes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { VehicleWithClient } from '@/lib/types';
import styles from '@/components/layout/DetailPage.module.css';

export default function VehicleDetailPage() {
  return (
    <Suspense fallback={<Skeleton height={80} radius={12} />}>
      <VehicleDetailPageContent />
    </Suspense>
  );
}

function VehicleDetailPageContent() {
  const vehicleId = useSearchParams().get('id') ?? '';
  const { token } = useAuth();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleWithClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !vehicleId) return;
    getVehicle(token, vehicleId).then((result) => {
      if (result.ok) {
        setVehicle(result.data);
      } else {
        setError(result.message);
      }
    });
  }, [token, vehicleId]);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteVehicle(token!, vehicleId);
    setDeleting(false);
    if (result.ok) {
      router.push('/vehicles');
    } else {
      setDeleteError(result.message);
    }
  }

  if (error) {
    return (
      <Card>
        <span style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</span>
      </Card>
    );
  }

  if (!vehicle) {
    return <Skeleton height={80} radius={12} />;
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{vehicle.licensePlate}</span>
        </div>
        <div className={styles.actions}>
          <LinkButton href={vehicleEditPath(vehicleId)} variant="secondary">
            Editar
          </LinkButton>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Eliminar
          </Button>
        </div>
      </div>

      <div className={styles.sections}>
        <Card>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Cliente</span>
              <span className={styles.infoValue}>
                <Link href={clientDetailPath(vehicle.client.id)}>{clientDisplayName(vehicle.client)}</Link>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Marca y modelo</span>
              <span className={styles.infoValue}>
                {vehicle.make} {vehicle.model}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Año</span>
              <span className={styles.infoValue}>{vehicle.year ?? '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Color</span>
              <span className={styles.infoValue}>{vehicle.color ?? '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Combustible</span>
              <span className={styles.infoValue}>{vehicle.fuelType ? fuelTypeLabels[vehicle.fuelType] : '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Chasis (VIN)</span>
              <span className={styles.infoValue}>{vehicle.vin ?? '—'}</span>
            </div>
            {vehicle.notes && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Notas</span>
                <span className={styles.infoValue}>{vehicle.notes}</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Ingresos</span>
            <LinkButton href={`/entries/new?vehicleId=${vehicleId}`} variant="secondary">
              + Nuevo ingreso
            </LinkButton>
          </div>
          <Link href={`/entries?vehicleId=${vehicleId}`}>Ver historial de ingresos de este vehículo</Link>
        </Card>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="¿Eliminar este vehículo?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleting}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
