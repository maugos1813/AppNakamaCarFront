'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { listVehicles } from '@/lib/api/vehicles';
import { clientDisplayName } from '@/lib/format';
import { fuelTypeLabels } from '@/lib/staffLabels';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { clientDetailPath, vehicleDetailPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { LinkButton } from '@/components/ui/LinkButton';
import { Input } from '@/components/ui/Input';
import { Table, type TableColumn } from '@/components/ui/Table';
import type { Paginated, VehicleWithClient } from '@/lib/types';

const PAGE_SIZE = 20;

export default function VehiclesPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<VehicleWithClient> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    listVehicles(token, { search: debouncedSearch || undefined, page, pageSize: PAGE_SIZE }).then((result) => {
      setLoading(false);
      if (result.ok) setData(result.data);
    });
  }, [token, debouncedSearch, page]);

  const columns: TableColumn<VehicleWithClient>[] = [
    {
      key: 'plate',
      header: 'Matrícula',
      render: (vehicle) => <Link href={vehicleDetailPath(vehicle.id)}>{vehicle.licensePlate}</Link>,
    },
    { key: 'model', header: 'Marca y modelo', render: (vehicle) => `${vehicle.make} ${vehicle.model}` },
    {
      key: 'client',
      header: 'Cliente',
      render: (vehicle) => <Link href={clientDetailPath(vehicle.client.id)}>{clientDisplayName(vehicle.client)}</Link>,
    },
    { key: 'fuel', header: 'Combustible', render: (vehicle) => (vehicle.fuelType ? fuelTypeLabels[vehicle.fuelType] : '—') },
  ];

  return (
    <div>
      <PageHeader title="Vehículos" action={<LinkButton href="/vehicles/new">+ Nuevo vehículo</LinkButton>} />

      <div style={{ maxWidth: 360, marginBottom: 20 }}>
        <Input
          label="Buscar"
          placeholder="Matrícula, marca, modelo..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Table
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(vehicle) => vehicle.id}
        loading={loading}
        emptyTitle="No se encontraron vehículos"
        emptyDescription={search ? 'Intenta modificar la búsqueda.' : undefined}
        pagination={
          data
            ? { page, pageSize: PAGE_SIZE, total: data.pagination.total, onPageChange: setPage }
            : undefined
        }
      />
    </div>
  );
}
