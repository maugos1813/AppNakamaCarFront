'use client';

import { useState } from 'react';
import { approveEstimate, rejectEstimate } from '@/lib/api/client-portal';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Estimate, EstimateStatus, LaborLineItem, OtherCostLineItem, PartLineItem } from '@/lib/types';
import styles from './EstimateSection.module.css';
import modalStyles from '@/components/ui/ConfirmModal.module.css';

interface EstimateSectionProps {
  token: string;
  estimate: Estimate;
  estimateStatus: EstimateStatus;
  estimateRespondedAt: string | null;
  estimateRejectionReason: string | null;
}

function splitByApproval<T extends { approvedAt: string | null }>(items: T[]) {
  return { approved: items.filter((i) => i.approvedAt), pending: items.filter((i) => !i.approvedAt) };
}

export function EstimateSection({
  token,
  estimate,
  estimateStatus,
  estimateRespondedAt,
  estimateRejectionReason,
}: EstimateSectionProps) {
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (estimateStatus === 'DRAFT') {
    return <div className={styles.draft}>Preventivo in preparazione. Ti avviseremo quando sarà pronto.</div>;
  }

  const labor = splitByApproval(estimate.labor.items);
  const parts = splitByApproval(estimate.parts.items);
  const otherCosts = splitByApproval(estimate.otherCosts.items);

  const pendingSubtotal =
    labor.pending.reduce((sum, i) => sum + Number(i.total), 0) +
    parts.pending.reduce((sum, i) => sum + Number(i.total), 0) +
    otherCosts.pending.reduce((sum, i) => sum + Number(i.amount), 0);
  const pendingTaxAmount = pendingSubtotal * (estimate.taxRate / 100);
  const pendingTotalWithTax = pendingSubtotal + pendingTaxAmount;

  // A mix of already-approved and newly-pending items means this is a
  // follow-up round (an additional cost added after the client already
  // approved once) — the approval prompt and confirm modal below should
  // talk about that new amount, not silently re-ask for the whole total.
  const isAdditionalRound = labor.approved.length + parts.approved.length + otherCosts.approved.length > 0;

  async function handleApprove() {
    setSubmitting(true);
    setError(null);
    const result = await approveEstimate(token);
    setSubmitting(false);
    if (result.ok) {
      window.location.reload();
    } else {
      setError(result.message);
      if (result.status === 400) window.location.reload();
    }
  }

  async function handleReject() {
    setSubmitting(true);
    setError(null);
    const result = await rejectEstimate(token, reason.trim());
    setSubmitting(false);
    if (result.ok) {
      window.location.reload();
    } else {
      setError(result.message);
      if (result.status === 400) window.location.reload();
    }
  }

  function closeModal() {
    if (submitting) return;
    setModal(null);
    setError(null);
    setReason('');
  }

  return (
    <div className={`${styles.card} ${estimateStatus === 'PENDING_APPROVAL' ? styles.pending : ''}`}>
      <span className={styles.title}>Preventivo</span>

      {estimate.labor.items.length > 0 && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>Manodopera</span>
          <LaborRows items={isAdditionalRound ? labor.approved : estimate.labor.items} muted={isAdditionalRound} />
          {isAdditionalRound && labor.pending.length > 0 && (
            <>
              <span className={styles.groupLabel}>Nuovo — da approvare</span>
              <LaborRows items={labor.pending} />
            </>
          )}
          <div className={`${styles.subtotalRow} tabular-nums`}>
            <span>Subtotale</span>
            <span>{formatCurrency(estimate.labor.total)}</span>
          </div>
        </div>
      )}

      {estimate.parts.items.length > 0 && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>Ricambi</span>
          <PartRows items={isAdditionalRound ? parts.approved : estimate.parts.items} muted={isAdditionalRound} />
          {isAdditionalRound && parts.pending.length > 0 && (
            <>
              <span className={styles.groupLabel}>Nuovo — da approvare</span>
              <PartRows items={parts.pending} />
            </>
          )}
          <div className={`${styles.subtotalRow} tabular-nums`}>
            <span>Subtotale</span>
            <span>{formatCurrency(estimate.parts.total)}</span>
          </div>
        </div>
      )}

      {estimate.otherCosts.items.length > 0 && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>Altri costi</span>
          <OtherCostRows items={isAdditionalRound ? otherCosts.approved : estimate.otherCosts.items} muted={isAdditionalRound} />
          {isAdditionalRound && otherCosts.pending.length > 0 && (
            <>
              <span className={styles.groupLabel}>Nuovo — da approvare</span>
              <OtherCostRows items={otherCosts.pending} />
            </>
          )}
          <div className={`${styles.subtotalRow} tabular-nums`}>
            <span>Subtotale</span>
            <span>{formatCurrency(estimate.otherCosts.total)}</span>
          </div>
        </div>
      )}

      <div className={`${styles.subtotalRow} tabular-nums`}>
        <span>Imponibile</span>
        <span>{formatCurrency(estimate.grandTotal)}</span>
      </div>
      <div className={`${styles.subtotalRow} tabular-nums`}>
        <span>IVA ({estimate.taxRate}%)</span>
        <span>{formatCurrency(estimate.taxAmount)}</span>
      </div>

      <div className={styles.grandTotalRow}>
        <span className={styles.grandTotalLabel}>Totale (IVA inclusa)</span>
        <span className={`${styles.grandTotalAmount} tabular-nums`}>{formatCurrency(estimate.totalWithTax)}</span>
      </div>

      {estimateStatus === 'PENDING_APPROVAL' && (
        <div className={styles.approvalPrompt}>
          <p className={styles.approvalText}>
            {isAdditionalRound
              ? `È stato aggiunto un costo aggiuntivo di ${formatCurrency(pendingTotalWithTax)} (IVA inclusa), da approvare separatamente rispetto a quanto già confermato.`
              : 'È necessaria la tua approvazione prima di iniziare i lavori di riparazione.'}
          </p>
          <div className={styles.actions}>
            <Button variant="danger" fullWidth onClick={() => setModal('reject')}>
              Rifiuta
            </Button>
            <Button variant="primary" fullWidth onClick={() => setModal('approve')}>
              {isAdditionalRound ? 'Approva costo aggiuntivo' : 'Approva preventivo'}
            </Button>
          </div>
        </div>
      )}

      {estimateStatus === 'APPROVED' && (
        <div>
          <StatusBadge
            tone="success"
            label={`Preventivo approvato${formatDate(estimateRespondedAt) ? ` il ${formatDate(estimateRespondedAt)}` : ''}`}
          />
        </div>
      )}

      {estimateStatus === 'REJECTED' && (
        <div className={styles.group}>
          <StatusBadge
            tone="danger"
            label={`Preventivo rifiutato${formatDate(estimateRespondedAt) ? ` il ${formatDate(estimateRespondedAt)}` : ''}`}
          />
          {estimateRejectionReason && <p className={styles.reasonBox}>“{estimateRejectionReason}”</p>}
          <p className={styles.approvalText}>Contatta l’officina per rivedere insieme il preventivo.</p>
        </div>
      )}

      <ConfirmModal
        open={modal === 'approve'}
        title="Confermi l’approvazione?"
        description={
          isAdditionalRound
            ? `Stai per approvare il costo aggiuntivo di ${formatCurrency(pendingTotalWithTax)} (IVA inclusa). Questa azione non può essere annullata da questa pagina.`
            : `Stai per approvare il preventivo di ${formatCurrency(estimate.totalWithTax)} (IVA inclusa). L’officina inizierà i lavori. Questa azione non può essere annullata da questa pagina.`
        }
        confirmLabel="Approva"
        variant="primary"
        loading={submitting}
        errorMessage={error}
        onConfirm={handleApprove}
        onCancel={closeModal}
      />

      <ConfirmModal
        open={modal === 'reject'}
        title="Confermi il rifiuto?"
        description="Puoi indicare il motivo del rifiuto: sarà comunicato all’officina."
        confirmLabel="Rifiuta preventivo"
        variant="danger"
        loading={submitting}
        errorMessage={error}
        onConfirm={handleReject}
        onCancel={closeModal}
      >
        <textarea
          className={modalStyles.textarea}
          placeholder="Motivo (facoltativo)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={submitting}
        />
      </ConfirmModal>
    </div>
  );
}

function LaborRows({ items, muted }: { items: LaborLineItem[]; muted?: boolean }) {
  return (
    <>
      {items.map((item) => (
        <div className={styles.row} key={item.id} style={muted ? { opacity: 0.6 } : undefined}>
          <span className={styles.rowDescription}>{item.description}</span>
          <span className={`${styles.rowAmount} tabular-nums`}>{formatCurrency(item.total)}</span>
        </div>
      ))}
    </>
  );
}

function PartRows({ items, muted }: { items: PartLineItem[]; muted?: boolean }) {
  return (
    <>
      {items.map((item) => (
        <div className={styles.row} key={item.id} style={muted ? { opacity: 0.6 } : undefined}>
          <span className={styles.rowDescription}>
            {item.name}
            {item.quantity > 1 ? ` × ${item.quantity}` : ''}
          </span>
          <span className={`${styles.rowAmount} tabular-nums`}>{formatCurrency(item.total)}</span>
        </div>
      ))}
    </>
  );
}

function OtherCostRows({ items, muted }: { items: OtherCostLineItem[]; muted?: boolean }) {
  return (
    <>
      {items.map((item) => (
        <div className={styles.row} key={item.id} style={muted ? { opacity: 0.6 } : undefined}>
          <span className={styles.rowDescription}>{item.description}</span>
          <span className={`${styles.rowAmount} tabular-nums`}>{formatCurrency(item.amount)}</span>
        </div>
      ))}
    </>
  );
}
