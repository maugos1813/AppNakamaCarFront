import { apiRequest } from './http';
import type { MechanicProductivity } from '../types';

export function getMechanicProductivity(token: string, months = 6) {
  return apiRequest<MechanicProductivity>(`/reports/mechanic-productivity?months=${months}`, { token });
}
