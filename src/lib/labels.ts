// Italian copy for the public Client Portal (/track/[token]) only.
// Staff-facing screens use ../lib/staffLabels.ts (Spanish) instead.
import type { BadgeTone } from '@/components/ui/StatusBadge';
import type {
  EstimateStatus,
  InvoiceStatus,
  PhotoCategory,
  RepairStageName,
  VehicleEntryStatus,
} from './types';

export const entryStatusLabels: Record<VehicleEntryStatus, string> = {
  IN_PROGRESS: 'In riparazione',
  COMPLETED: 'Pronto per il ritiro',
  DELIVERED: 'Consegnato',
  CANCELLED: 'Annullato',
};

export const entryStatusTones: Record<VehicleEntryStatus, BadgeTone> = {
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  DELIVERED: 'neutral',
  CANCELLED: 'danger',
};

export const stageOrder: RepairStageName[] = [
  'DIAGNOSIS',
  'DISASSEMBLY',
  'BODYWORK',
  'PAINTING',
  'ASSEMBLY',
  'QUALITY_CHECK',
  'READY_FOR_DELIVERY',
];

export const stageLabels: Record<RepairStageName, string> = {
  DIAGNOSIS: 'Diagnosi',
  DISASSEMBLY: 'Smontaggio',
  BODYWORK: 'Carrozzeria',
  PAINTING: 'Verniciatura',
  ASSEMBLY: 'Montaggio',
  QUALITY_CHECK: 'Controllo qualità',
  READY_FOR_DELIVERY: 'Pronto per la consegna',
};

export const photoCategoryOrder: PhotoCategory[] = ['INTAKE', 'DAMAGE', 'PROGRESS', 'COMPLETION'];

export const photoCategoryLabels: Record<PhotoCategory, string> = {
  INTAKE: 'Al ricevimento',
  DAMAGE: 'Danni',
  PROGRESS: 'Avanzamento lavori',
  COMPLETION: 'Completamento',
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Bozza',
  ISSUED: 'Emessa',
  PAID: 'Pagata',
  PARTIALLY_PAID: 'Pagamento parziale',
  OVERDUE: 'Scaduta',
  CANCELLED: 'Annullata',
};

export const invoiceStatusTones: Record<InvoiceStatus, BadgeTone> = {
  DRAFT: 'neutral',
  ISSUED: 'brand',
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
};

export const estimateStatusLabels: Record<EstimateStatus, string> = {
  DRAFT: 'In preparazione',
  PENDING_APPROVAL: 'In attesa di approvazione',
  APPROVED: 'Approvato',
  REJECTED: 'Rifiutato',
};
