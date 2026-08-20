'use client';

import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import styles from './Table.module.css';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pagination?: PaginationState;
}

export function Table<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  emptyTitle = 'Sin resultados',
  emptyDescription,
  pagination,
}: TableProps<T>) {
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  return (
    <div className={styles.wrap}>
      <div className={styles.scroller}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.align === 'right' ? styles.alignRight : undefined}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      <Skeleton height={14} />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading &&
              rows.map((row) => (
                <tr key={getRowId(row)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.align === 'right' ? styles.alignRight : undefined}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && rows.length === 0 && <EmptyState title={emptyTitle} description={emptyDescription} />}

      {pagination && !loading && rows.length > 0 && (
        <div className={styles.pagination}>
          <span>
            Página {pagination.page} de {totalPages} · {pagination.total} resultados
          </span>
          <div className={styles.pageButtons}>
            <button
              type="button"
              className={styles.pageButton}
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Anterior
            </button>
            <button
              type="button"
              className={styles.pageButton}
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
