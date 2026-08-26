'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { listClients } from '@/lib/api/clients';
import { clientDisplayName } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { clientDetailPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { LinkButton } from '@/components/ui/LinkButton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, type TableColumn } from '@/components/ui/Table';
import type { Client, Paginated } from '@/lib/types';

const PAGE_SIZE = 20;

const premiumOptions = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Solo premium' },
  { value: 'false', label: 'Sin premium' },
];

export default function ClientsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [premiumFilter, setPremiumFilter] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Client> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    listClients(token, {
      search: debouncedSearch || undefined,
      portalEnabled: premiumFilter ? premiumFilter === 'true' : undefined,
      page,
      pageSize: PAGE_SIZE,
    }).then((result) => {
      setLoading(false);
      if (result.ok) setData(result.data);
    });
  }, [token, debouncedSearch, premiumFilter, page]);

  const columns: TableColumn<Client>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (client) => <Link href={clientDetailPath(client.id)}>{clientDisplayName(client)}</Link>,
    },
    { key: 'phone', header: 'Teléfono', render: (client) => client.phone },
    { key: 'email', header: 'Email', render: (client) => client.email ?? '—' },
    { key: 'city', header: 'Ciudad', render: (client) => client.city ?? '—' },
    {
      key: 'premium',
      header: 'Premium',
      render: (client) => (client.portalEnabled ? <StatusBadge tone="success" label="Premium" /> : '—'),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clientes"
        action={<LinkButton href="/clients/new">+ Nuevo cliente</LinkButton>}
      />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ maxWidth: 360, flex: 1, minWidth: 220 }}>
          <Input
            label="Buscar"
            placeholder="Nombre, teléfono, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div style={{ maxWidth: 200 }}>
          <Select
            label="Premium"
            value={premiumFilter}
            onChange={(e) => {
              setPremiumFilter(e.target.value);
              setPage(1);
            }}
            options={premiumOptions}
          />
        </div>
      </div>

      <Table
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(client) => client.id}
        loading={loading}
        emptyTitle="No se encontraron clientes"
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
