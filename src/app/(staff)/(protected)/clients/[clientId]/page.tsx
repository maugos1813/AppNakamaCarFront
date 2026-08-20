'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { deleteClient, getClient } from '@/lib/api/clients';
import { clientDisplayName } from '@/lib/format';
import { fuelTypeLabels } from '@/lib/staffLabels';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { ClientWithVehicles } from '@/lib/types';
import detailStyles from '@/components/layout/DetailPage.module.css';
import styles from './page.module.css';

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const { token } = useAuth();
  const router = useRouter();
  const [client, setClient] = useState<ClientWithVehicles | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getClient(token, clientId).then((result) => {
      if (result.ok) {
        setClient(result.data);
      } else {
        setError(result.message);
      }
    });
  }, [token, clientId]);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteClient(token!, clientId);
    setDeleting(false);
    if (result.ok) {
      router.push('/clients');
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

  if (!client) {
    return <Skeleton height={80} radius={12} />;
  }

  return (
    <div>
      <div className={detailStyles.header}>
        <div className={detailStyles.titleRow}>
          <span className={detailStyles.title}>{clientDisplayName(client)}</span>
          {client.isCompany && <StatusBadge tone="neutral" label="Empresa" />}
        </div>
        <div className={detailStyles.actions}>
          <LinkButton href={`/clients/${clientId}/edit`} variant="secondary">
            Editar
          </LinkButton>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Eliminar
          </Button>
        </div>
      </div>

      <div className={detailStyles.sections}>
        <Card>
          <div className={detailStyles.infoGrid}>
            <div className={detailStyles.infoItem}>
              <span className={detailStyles.infoLabel}>Teléfono</span>
              <span className={detailStyles.infoValue}>{client.phone}</span>
            </div>
            <div className={detailStyles.infoItem}>
              <span className={detailStyles.infoLabel}>Email</span>
              <span className={detailStyles.infoValue}>{client.email ?? '—'}</span>
            </div>
            {client.isCompany && (
              <div className={detailStyles.infoItem}>
                <span className={detailStyles.infoLabel}>N.º de IVA</span>
                <span className={detailStyles.infoValue}>{client.vatNumber ?? '—'}</span>
              </div>
            )}
            <div className={detailStyles.infoItem}>
              <span className={detailStyles.infoLabel}>Código fiscal</span>
              <span className={detailStyles.infoValue}>{client.fiscalCode ?? '—'}</span>
            </div>
            <div className={detailStyles.infoItem}>
              <span className={detailStyles.infoLabel}>Dirección</span>
              <span className={detailStyles.infoValue}>
                {client.addressLine ? `${client.addressLine}, ` : ''}
                {[client.postalCode, client.city, client.province].filter(Boolean).join(' ') || '—'}
              </span>
            </div>
            {client.notes && (
              <div className={detailStyles.infoItem}>
                <span className={detailStyles.infoLabel}>Notas</span>
                <span className={detailStyles.infoValue}>{client.notes}</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className={detailStyles.sectionHeader}>
            <span className={detailStyles.sectionTitle}>Vehículos</span>
            <LinkButton href={`/vehicles/new?clientId=${clientId}`} variant="secondary">
              + Agregar vehículo
            </LinkButton>
          </div>

          {client.vehicles.length === 0 && (
            <EmptyState title="No hay vehículos registrados" description="Agrega el primer vehículo de este cliente." />
          )}

          {client.vehicles.map((vehicle) => (
            <Link href={`/vehicles/${vehicle.id}`} className={styles.vehicleRow} key={vehicle.id}>
              <div>
                <div className={styles.vehiclePlate}>{vehicle.licensePlate}</div>
                <div className={styles.vehicleModel}>
                  {vehicle.make} {vehicle.model}
                </div>
              </div>
              {vehicle.fuelType && <StatusBadge tone="neutral" label={fuelTypeLabels[vehicle.fuelType]} />}
            </Link>
          ))}
        </Card>

        <Card>
          <span className={detailStyles.sectionTitle}>Ingresos</span>
          <div style={{ marginTop: 8 }}>
            <Link href={`/entries?clientId=${clientId}`}>Ver historial de ingresos de este cliente</Link>
          </div>
        </Card>

        <Card>
          <span className={detailStyles.sectionTitle}>Facturación</span>
          <div style={{ marginTop: 8 }}>
            <Link href={`/invoices?clientId=${clientId}`}>Ver facturas de este cliente</Link>
          </div>
        </Card>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="¿Eliminar este cliente?"
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
