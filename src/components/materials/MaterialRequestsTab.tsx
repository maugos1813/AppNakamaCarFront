'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, type TableColumn } from '@/components/ui/Table';
import {
  createMaterialRequest,
  deleteMaterialRequest,
  listMaterialRequests,
  setMaterialRequestStatus,
} from '@/lib/api/materials';
import { materialRequestStatusLabels, materialRequestStatusTones } from '@/lib/staffLabels';
import { formatDateTime } from '@/lib/format';
import type { MaterialRequestStatus, Paginated, StaffMaterialRequest } from '@/lib/types';
import styles from '@/components/jobs/ListSection.module.css';

const PAGE_SIZE = 20;

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  ...(Object.entries(materialRequestStatusLabels) as [MaterialRequestStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

export function MaterialRequestsTab({
  token,
  userId,
  isAdmin,
}: {
  token: string;
  userId: string;
  isAdmin: boolean;
}) {
  const [status, setStatus] = useState<MaterialRequestStatus | ''>('PENDING');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<StaffMaterialRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!token) return;
    setLoading(true);
    listMaterialRequests(token, { status: status || undefined, page, pageSize: PAGE_SIZE }).then((result) => {
      setLoading(false);
      if (result.ok) setData(result.data);
    });
  }

  useEffect(load, [token, status, page]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await createMaterialRequest(token, { description, quantity: Number(quantity || 1) });
    setSubmitting(false);
    if (result.ok) {
      setDescription('');
      setQuantity('1');
      setFormOpen(false);
      load();
    } else {
      setError(result.message);
    }
  }

  async function handleSetStatus(id: string, next: 'APPROVED' | 'REJECTED') {
    setBusyId(id);
    const result = await setMaterialRequestStatus(token, id, next);
    setBusyId(null);
    if (result.ok) {
      setData((current) =>
        current ? { ...current, items: current.items.filter((item) => item.id !== id) } : current,
      );
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    const result = await deleteMaterialRequest(token, id);
    setBusyId(null);
    if (result.ok) {
      setData((current) =>
        current ? { ...current, items: current.items.filter((item) => item.id !== id) } : current,
      );
    }
  }

  const columns: TableColumn<StaffMaterialRequest>[] = [
    { key: 'description', header: 'Descripción', render: (item) => item.description },
    { key: 'quantity', header: 'Cantidad', align: 'right', render: (item) => item.quantity },
    { key: 'requestedBy', header: 'Solicitado por', render: (item) => item.createdBy?.fullName ?? '—' },
    { key: 'date', header: 'Fecha', render: (item) => formatDateTime(item.createdAt, 'es-ES') },
    {
      key: 'status',
      header: 'Estado',
      render: (item) => (
        <StatusBadge tone={materialRequestStatusTones[item.status]} label={materialRequestStatusLabels[item.status]} />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => {
        const canDelete = item.status === 'PENDING' && (isAdmin || item.createdBy?.id === userId);
        return (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {isAdmin && item.status === 'PENDING' && (
              <>
                <Button variant="secondary" onClick={() => handleSetStatus(item.id, 'APPROVED')} loading={busyId === item.id}>
                  Aprobar
                </Button>
                <Button variant="danger" onClick={() => handleSetStatus(item.id, 'REJECTED')} loading={busyId === item.id}>
                  Rechazar
                </Button>
              </>
            )}
            {canDelete && (
              <button
                type="button"
                className={styles.rowActionDanger}
                disabled={busyId === item.id}
                onClick={() => handleDelete(item.id)}
              >
                Eliminar
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>Solicitar Materiales</span>
        <Button variant="secondary" className={styles.addButton} onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? 'Cancelar' : '+ Solicitar'}
        </Button>
      </div>

      {formOpen && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <Input
              label="Qué material hace falta"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Input
              label="Cantidad"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          {error && <span className={styles.error}>{error}</span>}
          <div className={styles.formActions}>
            <Button type="submit" variant="primary" loading={submitting}>
              Guardar
            </Button>
          </div>
        </form>
      )}

      <div style={{ maxWidth: 280 }}>
        <Select
          label="Estado"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as MaterialRequestStatus | '');
            setPage(1);
          }}
          options={statusOptions}
        />
      </div>

      <Table
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(item) => item.id}
        loading={loading}
        emptyTitle="No hay solicitudes de materiales"
        pagination={
          data ? { page, pageSize: PAGE_SIZE, total: data.pagination.total, onPageChange: setPage } : undefined
        }
      />
    </div>
  );
}
