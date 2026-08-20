import { formatCurrency } from '@/lib/format';
import type { StaffInvoice } from '@/lib/types';
import styles from './InvoiceItemsList.module.css';

export function InvoiceItemsList({ invoice }: { invoice: StaffInvoice }) {
  return (
    <div>
      <div className={styles.title}>Conceptos</div>

      {invoice.items.map((item) => (
        <div className={styles.row} key={item.id}>
          <div>
            <div className={styles.description}>{item.description}</div>
            {Number(item.quantity) !== 1 && (
              <div className={styles.quantity}>
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </div>
            )}
          </div>
          <span className="tabular-nums">{formatCurrency(item.total)}</span>
        </div>
      ))}

      <div className={styles.totalsBlock}>
        <div className={styles.totalsRow}>
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className={styles.totalsRow}>
          <span>IVA ({Number(invoice.taxRate)}%)</span>
          <span className="tabular-nums">{formatCurrency(invoice.taxAmount)}</span>
        </div>
        <div className={styles.grandTotalRow}>
          <span className={styles.grandTotalLabel}>Total</span>
          <span className={`${styles.grandTotalAmount} tabular-nums`}>{formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
