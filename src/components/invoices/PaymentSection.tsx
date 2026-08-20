'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { recordPayment } from '@/lib/api/invoices';
import { paymentMethodLabels } from '@/lib/staffLabels';
import { formatCurrency, formatDate } from '@/lib/format';
import type { PaymentMethod, StaffInvoiceDetail } from '@/lib/types';
import formStyles from '@/components/ui/FormLayout.module.css';
import styles from './PaymentSection.module.css';

const methodOptions = (Object.entries(paymentMethodLabels) as [PaymentMethod, string][]).map(([value, label]) => ({
  value,
  label,
}));

export function PaymentSection({
  token,
  invoice,
  onPaymentRecorded,
}: {
  token: string;
  invoice: StaffInvoiceDetail;
  onPaymentRecorded: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRecordPayment = invoice.status === 'ISSUED' || invoice.status === 'PARTIALLY_PAID';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await recordPayment(token, invoice.id, {
      amount: Number(amount),
      method,
      reference: reference || undefined,
    });
    setSubmitting(false);
    if (result.ok) {
      setAmount('');
      setReference('');
      setMethod('CASH');
      setFormOpen(false);
      onPaymentRecorded();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>Pagos</span>
        {canRecordPayment && (
          <Button variant="secondary" onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? 'Cancelar' : '+ Registrar pago'}
          </Button>
        )}
      </div>

      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Pagado</span>
        <span className="tabular-nums">{formatCurrency(invoice.amountPaid)}</span>
      </div>
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Saldo pendiente</span>
        <span className={`${styles.dueAmount} tabular-nums`}>{formatCurrency(invoice.amountDue)}</span>
      </div>

      {formOpen && (
        <form className={formStyles.form} onSubmit={handleSubmit}>
          <div className={formStyles.grid2}>
            <Input
              label="Monto (€)"
              type="number"
              min="0.01"
              step="0.01"
              max={invoice.amountDue}
              hint={`Máximo ${formatCurrency(invoice.amountDue)}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Select
              label="Método de pago"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              options={methodOptions}
            />
          </div>
          <Input label="Referencia (opcional)" value={reference} onChange={(e) => setReference(e.target.value)} />
          {error && <div className={formStyles.errorBanner}>{error}</div>}
          <div className={formStyles.actions}>
            <Button type="submit" variant="primary" loading={submitting}>
              Registrar pago
            </Button>
          </div>
        </form>
      )}

      {invoice.payments.length === 0 && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay pagos registrados.</span>
      )}

      {invoice.payments.map((payment) => (
        <div className={styles.row} key={payment.id}>
          <div className={styles.rowMain}>
            <span className={styles.rowTitle}>{paymentMethodLabels[payment.method]}</span>
            <span className={styles.rowDetail}>
              {formatDate(payment.paidAt, 'es-ES')}
              {payment.reference ? ` · ${payment.reference}` : ''}
            </span>
          </div>
          <span className={styles.rowAmount}>{formatCurrency(payment.amount)}</span>
        </div>
      ))}
    </div>
  );
}
