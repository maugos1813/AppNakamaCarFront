export type VehicleEntryStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELIVERED';

export type EstimateStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type RepairStageName =
  | 'DIAGNOSIS'
  | 'DISASSEMBLY'
  | 'BODYWORK'
  | 'PAINTING'
  | 'ASSEMBLY'
  | 'QUALITY_CHECK'
  | 'READY_FOR_DELIVERY';

export type RepairStageStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';

export type PhotoCategory = 'INTAKE' | 'DAMAGE' | 'PROGRESS' | 'COMPLETION';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';

export interface TrackingStage {
  stage: RepairStageName;
  status: RepairStageStatus;
  order: number;
}

export interface TrackingPhoto {
  url: string;
  category: PhotoCategory;
  caption: string | null;
  createdAt: string;
}

// Decimal fields from Prisma are serialized as strings in JSON — never numbers.
export interface LaborLineItem {
  id: string;
  description: string;
  hours: string;
  hourlyRate: string;
  total: string;
  approvedAt: string | null;
}

export interface PartLineItem {
  id: string;
  name: string;
  partNumber: string | null;
  quantity: number;
  unitPrice: string;
  total: string;
  approvedAt: string | null;
}

export interface OtherCostLineItem {
  id: string;
  description: string;
  amount: string;
  category: string | null;
  approvedAt: string | null;
}

export interface Estimate {
  labor: { items: LaborLineItem[]; total: number };
  parts: { items: PartLineItem[]; total: number };
  otherCosts: { items: OtherCostLineItem[]; total: number };
  grandTotal: number;
  taxRate: number;
  taxAmount: number;
  totalWithTax: number;
}

export interface TrackingInvoice {
  id: string;
  status: InvoiceStatus;
  invoiceNumber: string | null;
  canPay: boolean;
  officePaymentRequestedAt: string | null;
  receiptsUploaded: number;
}

export interface TrackingSummary {
  vehicle: { licensePlate: string; make: string; model: string };
  status: VehicleEntryStatus;
  estimateStatus: EstimateStatus;
  estimateRespondedAt: string | null;
  estimateRejectionReason: string | null;
  entryDate: string;
  estimatedCompletionDate: string | null;
  stages: TrackingStage[];
  photos: TrackingPhoto[];
  estimate: Estimate;
  invoice: TrackingInvoice | null;
}

export type StaffRoleName = 'ADMIN' | 'MECHANIC';

export interface Role {
  id: string;
  name: StaffRoleName;
  description: string | null;
}

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  roleId: string;
  role: { id: string; name: StaffRoleName; description: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface StaffClient {
  id: string;
  isCompany: boolean;
  fullName: string;
  companyName: string | null;
}

export interface StaffVehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  client: StaffClient;
}

interface AssignedMechanic {
  id: string;
  fullName: string;
  email: string;
}

export interface RepairStageDetail {
  id: string;
  stage: RepairStageName;
  status: RepairStageStatus;
  order: number;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  vehicleEntryId: string;
  assignedMechanicId: string | null;
  assignedMechanic: AssignedMechanic | null;
}

export interface JobEntry {
  id: string;
  entryDate: string;
  odometerReading: number;
  fuelLevel: string;
  status: VehicleEntryStatus;
  estimateStatus: EstimateStatus;
  estimatedCompletionDate: string | null;
  vehicle: StaffVehicle;
  stages: RepairStageDetail[];
  invoice: { id: string; invoiceNumber: string | null; status: InvoiceStatus } | null;
}

export type DamageSeverity = 'MINOR' | 'MODERATE' | 'SEVERE';

export interface StaffDamage {
  id: string;
  area: string;
  description: string;
  severity: DamageSeverity;
  createdAt: string;
}

export type LaborItemStatus = 'PENDING' | 'APPROVED' | 'COMPLETED';

export interface StaffLaborItem {
  id: string;
  description: string;
  hours: string;
  hourlyRate: string;
  total: string;
  status: LaborItemStatus;
  approvedAt: string | null;
}

export type PartStatus = 'PENDING_ORDER' | 'ORDERED' | 'RECEIVED' | 'INSTALLED';

export interface StaffPart {
  id: string;
  name: string;
  partNumber: string | null;
  supplier: string | null;
  quantity: number;
  unitCost: string;
  unitPrice: string;
  total: string;
  status: PartStatus;
  approvedAt: string | null;
}

export interface StaffPhoto {
  id: string;
  url: string;
  category: PhotoCategory;
  caption: string | null;
  createdAt: string;
}

export type RepairHistoryEventType =
  | 'STATUS_CHANGED'
  | 'STAGE_CHANGED'
  | 'NOTE_ADDED'
  | 'DAMAGE_ADDED'
  | 'PHOTO_ADDED'
  | 'INVOICE_ISSUED'
  | 'ESTIMATE_APPROVED'
  | 'ESTIMATE_REJECTED'
  | 'PAYMENT_RECEIPT_UPLOADED'
  | 'OFFICE_PAYMENT_REQUESTED';

export interface HistoryEvent {
  id: string;
  eventType: RepairHistoryEventType;
  description: string;
  createdAt: string;
  performedBy: { id: string; fullName: string; email: string } | null;
}

export interface Client {
  id: string;
  isCompany: boolean;
  fullName: string;
  companyName: string | null;
  fiscalCode: string | null;
  vatNumber: string | null;
  email: string | null;
  phone: string;
  addressLine: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  country: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithVehicles extends Client {
  vehicles: Vehicle[];
}

export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'LPG' | 'CNG';

export interface Vehicle {
  id: string;
  clientId: string;
  licensePlate: string;
  vin: string | null;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  fuelType: FuelType | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleWithClient extends Vehicle {
  client: Client;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; pageSize: number; total: number };
}

export type FuelLevel = 'EMPTY' | 'QUARTER' | 'HALF' | 'THREE_QUARTERS' | 'FULL';

export interface StaffOtherCost {
  id: string;
  description: string;
  amount: string;
  category: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export interface EntryEstimate {
  labor: { items: StaffLaborItem[]; total: number };
  parts: { items: StaffPart[]; total: number };
  otherCosts: { items: StaffOtherCost[]; total: number };
  grandTotal: number;
  taxRate: number;
  taxAmount: number;
  totalWithTax: number;
}

export type NotificationType =
  | 'REPAIR_STAGE_UPDATE'
  | 'INVOICE_ISSUED'
  | 'PAYMENT_RECEIVED'
  | 'VEHICLE_READY'
  | 'ESTIMATE_PENDING_APPROVAL'
  | 'GENERIC';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS';

export type NotificationDeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface StaffNotification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  status: NotificationDeliveryStatus;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';

export interface StaffInvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
}

export interface StaffPayment {
  id: string;
  amount: string;
  method: PaymentMethod;
  paidAt: string;
  reference: string | null;
  createdAt: string;
}

export interface StaffPaymentReceipt {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface StaffInvoice {
  id: string;
  invoiceNumber: string | null;
  issueDate: string | null;
  dueDate: string | null;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  totalAmount: string;
  status: InvoiceStatus;
  notes: string | null;
  officePaymentRequestedAt: string | null;
  vehicleEntryId: string;
  clientId: string;
  client: Client;
  vehicleEntry: { id: string; vehicle: Vehicle };
  items: StaffInvoiceItem[];
  payments: StaffPayment[];
  receipts: StaffPaymentReceipt[];
  createdAt: string;
  updatedAt: string;
}

export interface StaffInvoiceDetail extends StaffInvoice {
  amountPaid: number;
  amountDue: number;
}

export interface DashboardSummary {
  entriesByStatus: Record<VehicleEntryStatus, number>;
  activeEntries: number;
  stagesInProgress: Record<RepairStageName, number>;
  readyForPickup: number;
  totalClients: number;
  totalVehicles: number;
}

export interface DashboardActivityEvent {
  id: string;
  eventType: RepairHistoryEventType;
  description: string;
  createdAt: string;
  performedBy: { id: string; fullName: string; email: string } | null;
  vehicleEntry: { id: string; vehicle: Vehicle & { client: Client } };
}

export interface FinanceSummary {
  period: { from: string; to: string };
  totalInvoiced: number;
  totalCollected: number;
  outstandingBalance: number;
  byStatus: { status: InvoiceStatus; count: number; totalAmount: number }[];
  byPaymentMethod: { method: PaymentMethod; count: number; totalAmount: number }[];
  revenueByMonth: { month: string; invoiced: number; collected: number }[];
  profit: { revenue: number; partsCost: number; estimatedProfit: number };
}

export interface OverdueInvoice {
  id: string;
  invoiceNumber: string | null;
  dueDate: string | null;
  totalAmount: string;
  status: InvoiceStatus;
  client: Client;
  amountPaid: number;
  amountDue: number;
}
