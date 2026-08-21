// Spanish copy for the internal staff panel only (login, dashboard, clients,
// vehicles, jobs board, etc.). The public Client Portal (/track/[token])
// stays Italian — see ./labels.ts — since it's read by the shop's own
// (Italian-speaking) customers, not the staff using this panel.
import type { BadgeTone } from '@/components/ui/StatusBadge';
import type {
  DamageSeverity,
  EstimateStatus,
  FuelLevel,
  FuelType,
  InvoiceStatus,
  NotificationDeliveryStatus,
  NotificationType,
  PartStatus,
  PaymentMethod,
  PhotoCategory,
  RepairHistoryEventType,
  RepairStageName,
  RepairStageStatus,
  StaffRoleName,
  VehicleEntryStatus,
} from './types';

export const entryStatusLabels: Record<VehicleEntryStatus, string> = {
  IN_PROGRESS: 'En reparación',
  COMPLETED: 'Listo para retirar',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const entryStatusTones: Record<VehicleEntryStatus, BadgeTone> = {
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  DELIVERED: 'neutral',
  CANCELLED: 'danger',
};

export const stageLabels: Record<RepairStageName, string> = {
  DIAGNOSIS: 'Diagnóstico',
  DISASSEMBLY: 'Desmontaje',
  BODYWORK: 'Carrocería',
  PAINTING: 'Pintura',
  ASSEMBLY: 'Montaje',
  QUALITY_CHECK: 'Control de calidad',
  READY_FOR_DELIVERY: 'Listo para entrega',
};

export const stageStatusLabels: Record<RepairStageStatus, string> = {
  PENDING: 'Por iniciar',
  IN_PROGRESS: 'En curso',
  DONE: 'Completada',
  SKIPPED: 'Omitida',
};

export const photoCategoryLabels: Record<PhotoCategory, string> = {
  INTAKE: 'Al ingreso',
  DAMAGE: 'Daños',
  PROGRESS: 'Avance del trabajo',
  COMPLETION: 'Finalización',
};

export const estimateStatusLabels: Record<EstimateStatus, string> = {
  DRAFT: 'En preparación',
  PENDING_APPROVAL: 'Pendiente de aprobación',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

export const damageSeverityLabels: Record<DamageSeverity, string> = {
  MINOR: 'Leve',
  MODERATE: 'Moderado',
  SEVERE: 'Grave',
};

export const damageSeverityTones: Record<DamageSeverity, BadgeTone> = {
  MINOR: 'neutral',
  MODERATE: 'warning',
  SEVERE: 'danger',
};

export const partStatusLabels: Record<PartStatus, string> = {
  PENDING_ORDER: 'Por pedir',
  ORDERED: 'Pedido',
  RECEIVED: 'Recibido',
  INSTALLED: 'Instalado',
};

export const fuelTypeLabels: Record<FuelType, string> = {
  PETROL: 'Gasolina',
  DIESEL: 'Diésel',
  ELECTRIC: 'Eléctrico',
  HYBRID: 'Híbrido',
  LPG: 'GLP',
  CNG: 'GNC',
};

export const historyEventLabels: Record<RepairHistoryEventType, string> = {
  STATUS_CHANGED: 'Estado actualizado',
  STAGE_CHANGED: 'Fase actualizada',
  NOTE_ADDED: 'Nota añadida',
  DAMAGE_ADDED: 'Daño registrado',
  PHOTO_ADDED: 'Foto cargada',
  INVOICE_ISSUED: 'Factura emitida',
  ESTIMATE_APPROVED: 'Presupuesto aprobado',
  ESTIMATE_REJECTED: 'Presupuesto rechazado',
};

export const fuelLevelLabels: Record<FuelLevel, string> = {
  EMPTY: 'Vacío',
  QUARTER: 'Un cuarto',
  HALF: 'Medio',
  THREE_QUARTERS: 'Tres cuartos',
  FULL: 'Lleno',
};

export const notificationTypeLabels: Record<NotificationType, string> = {
  REPAIR_STAGE_UPDATE: 'Actualización de fase',
  INVOICE_ISSUED: 'Factura emitida',
  PAYMENT_RECEIVED: 'Pago recibido',
  VEHICLE_READY: 'Vehículo listo',
  ESTIMATE_PENDING_APPROVAL: 'Presupuesto pendiente de aprobación',
  GENERIC: 'Aviso general',
};

export const notificationStatusLabels: Record<NotificationDeliveryStatus, string> = {
  PENDING: 'Pendiente',
  SENT: 'Enviada',
  FAILED: 'Falló',
};

export const notificationStatusTones: Record<NotificationDeliveryStatus, BadgeTone> = {
  PENDING: 'neutral',
  SENT: 'success',
  FAILED: 'danger',
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Borrador',
  ISSUED: 'Emitida',
  PAID: 'Pagada',
  PARTIALLY_PAID: 'Pago parcial',
  OVERDUE: 'Vencida',
  CANCELLED: 'Cancelada',
};

export const invoiceStatusTones: Record<InvoiceStatus, BadgeTone> = {
  DRAFT: 'neutral',
  ISSUED: 'brand',
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  BANK_TRANSFER: 'Transferencia bancaria',
  OTHER: 'Otro',
};

export const roleNameLabels: Record<StaffRoleName, string> = {
  ADMIN: 'Administrador',
  MECHANIC: 'Mecánico',
};
