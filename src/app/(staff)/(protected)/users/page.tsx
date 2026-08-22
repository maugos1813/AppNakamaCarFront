'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { listRoles, listUsers } from '@/lib/api/users';
import { roleNameLabels } from '@/lib/staffLabels';
import { formatDate } from '@/lib/format';
import { userEditPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { LinkButton } from '@/components/ui/LinkButton';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, type TableColumn } from '@/components/ui/Table';
import type { Paginated, Role, StaffUser } from '@/lib/types';

const PAGE_SIZE = 20;

const activeOptions = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
];

export default function UsersPage() {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleId, setRoleId] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<StaffUser> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    listRoles(token).then((result) => {
      if (result.ok) setRoles(result.data);
    });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    listUsers(token, {
      roleId: roleId || undefined,
      isActive: isActive === '' ? undefined : isActive === 'true',
      page,
      pageSize: PAGE_SIZE,
    }).then((result) => {
      setLoading(false);
      if (result.ok) setData(result.data);
    });
  }, [token, roleId, isActive, page]);

  const roleOptions = [{ value: '', label: 'Todos los roles' }, ...roles.map((role) => ({ value: role.id, label: roleNameLabels[role.name] ?? role.name }))];

  const columns: TableColumn<StaffUser>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (user) => <Link href={userEditPath(user.id)}>{user.fullName}</Link>,
    },
    { key: 'email', header: 'Email', render: (user) => user.email },
    { key: 'role', header: 'Rol', render: (user) => roleNameLabels[user.role.name] ?? user.role.name },
    {
      key: 'status',
      header: 'Estado',
      render: (user) => (
        <StatusBadge tone={user.isActive ? 'success' : 'neutral'} label={user.isActive ? 'Activo' : 'Inactivo'} />
      ),
    },
    {
      key: 'lastLogin',
      header: 'Último acceso',
      render: (user) => (user.lastLoginAt ? formatDate(user.lastLoginAt, 'es-ES') : 'Nunca'),
    },
  ];

  return (
    <div>
      <PageHeader title="Usuarios" action={<LinkButton href="/users/new">+ Nuevo usuario</LinkButton>} />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ width: 220 }}>
          <Select
            label="Rol"
            value={roleId}
            onChange={(e) => {
              setRoleId(e.target.value);
              setPage(1);
            }}
            options={roleOptions}
          />
        </div>
        <div style={{ width: 180 }}>
          <Select
            label="Estado"
            value={isActive}
            onChange={(e) => {
              setIsActive(e.target.value);
              setPage(1);
            }}
            options={activeOptions}
          />
        </div>
      </div>

      <Table
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(user) => user.id}
        loading={loading}
        emptyTitle="No se encontraron usuarios"
        pagination={
          data ? { page, pageSize: PAGE_SIZE, total: data.pagination.total, onPageChange: setPage } : undefined
        }
      />
    </div>
  );
}
