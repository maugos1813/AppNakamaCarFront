'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';
import styles from './page.module.css';

interface SampleVehicle {
  id: string;
  plate: string;
  model: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED';
}

const sampleRows: SampleVehicle[] = [
  { id: '1', plate: 'AP123RV', model: 'Fiat 500', status: 'IN_PROGRESS' },
  { id: '2', plate: 'NE111BB', model: 'Alfa Romeo Giulia', status: 'COMPLETED' },
  { id: '3', plate: 'NT999AA', model: 'Lancia Ypsilon', status: 'DELIVERED' },
];

const statusLabel: Record<SampleVehicle['status'], string> = {
  IN_PROGRESS: 'En reparación',
  COMPLETED: 'Listo',
  DELIVERED: 'Entregado',
};

function Gallery() {
  const showToast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableEmpty, setTableEmpty] = useState(false);
  const [page, setPage] = useState(1);

  const columns: TableColumn<SampleVehicle>[] = [
    { key: 'plate', header: 'Matrícula', render: (r) => r.plate },
    { key: 'model', header: 'Modelo', render: (r) => r.model },
    { key: 'status', header: 'Estado', render: (r) => <StatusBadge tone="warning" label={statusLabel[r.status]} /> },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Sistema de diseño</div>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Página de referencia interna — no está enlazada a la navegación de la app.
          </span>
        </div>
        <ThemeToggle activateLightLabel="Activar tema claro" activateDarkLabel="Activar tema oscuro" />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Logo</div>
        <Card>
          <Logo />
        </Card>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Button</div>
        <div className={styles.row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" loading>
            Loading
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Status badge</div>
        <div className={styles.row}>
          <StatusBadge tone="success" label="Aprobado" />
          <StatusBadge tone="warning" label="En curso" />
          <StatusBadge tone="danger" label="Rechazado" />
          <StatusBadge tone="neutral" label="Borrador" />
          <StatusBadge tone="brand" label="Emitida" />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Card</div>
        <Card>Contenido genérico dentro de una card.</Card>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Campos de formulario</div>
        <div className={styles.grid2}>
          <Input label="Nombre del cliente" placeholder="Mario Pérez" />
          <Input label="Email" placeholder="mario@ejemplo.es" error="Email no válido" />
          <Select
            label="Estado"
            placeholder="Selecciona un estado"
            options={[
              { value: 'IN_PROGRESS', label: 'En reparación' },
              { value: 'COMPLETED', label: 'Listo para retirar' },
            ]}
          />
          <Select
            label="Rol"
            options={[{ value: 'ADMIN', label: 'Admin' }]}
            error="Campo obligatorio"
          />
        </div>
        <Textarea label="Notas" placeholder="Notas adicionales (opcional)" />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Modal de confirmación</div>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Abrir modal
        </Button>
        <ConfirmModal
          open={confirmOpen}
          title="¿Confirmas la acción?"
          description="Esta es una modal de ejemplo con variante danger."
          confirmLabel="Confirmar"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={() => setConfirmOpen(false)}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Toast</div>
        <div className={styles.row}>
          <Button variant="primary" onClick={() => showToast('Operación completada.', 'success')}>
            Mostrar éxito
          </Button>
          <Button variant="danger" onClick={() => showToast('Ocurrió un error.', 'error')}>
            Mostrar error
          </Button>
          <Button variant="secondary" onClick={() => showToast('Información general.', 'info')}>
            Mostrar info
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Skeleton</div>
        <div className={styles.stack}>
          <div className={styles.skeletonRow}>
            <Skeleton width={40} height={40} radius="50%" />
            <Skeleton width={160} />
          </div>
          <Skeleton height={80} radius={12} />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Empty state</div>
        <Card>
          <EmptyState
            title="No se encontraron vehículos"
            description="Intenta modificar los filtros de búsqueda."
            action={<Button variant="secondary">Restablecer filtros</Button>}
          />
        </Card>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Table</div>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setTableLoading((v) => !v)}>
            {tableLoading ? 'Desactivar loading' : 'Activar loading'}
          </Button>
          <Button variant="secondary" onClick={() => setTableEmpty((v) => !v)}>
            {tableEmpty ? 'Mostrar filas' : 'Mostrar estado vacío'}
          </Button>
        </div>
        <Table
          columns={columns}
          rows={tableEmpty ? [] : sampleRows}
          getRowId={(r) => r.id}
          loading={tableLoading}
          emptyTitle="No se encontraron vehículos"
          pagination={{ page, pageSize: 3, total: tableEmpty ? 0 : 9, onPageChange: setPage }}
        />
      </div>
    </div>
  );
}

export default function ComponentsGalleryPage() {
  return (
    <ToastProvider>
      <Gallery />
    </ToastProvider>
  );
}
