import { apiRequest } from './http';

export interface ReminderRunResult {
  dryRun: boolean;
  pickupReminders: number;
  overdueInvoiceReminders: number;
}

export function runReminders(token: string, dryRun = false) {
  return apiRequest<ReminderRunResult>(`/reminders/run?dryRun=${dryRun}`, { token, method: 'POST' });
}
