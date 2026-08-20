import { apiRequest } from './http';
import type { FuelType, Paginated, Vehicle, VehicleWithClient } from '../types';

export interface VehicleInput {
  clientId: string;
  licensePlate: string;
  vin?: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  fuelType?: FuelType;
  notes?: string;
}

export function listVehicles(
  token: string,
  params: { clientId?: string; search?: string; page?: number; pageSize?: number },
) {
  const query = new URLSearchParams();
  if (params.clientId) query.set('clientId', params.clientId);
  if (params.search) query.set('search', params.search);
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 20));
  return apiRequest<Paginated<VehicleWithClient>>(`/vehicles?${query.toString()}`, { token });
}

export function getVehicle(token: string, id: string) {
  return apiRequest<VehicleWithClient>(`/vehicles/${id}`, { token });
}

export function createVehicle(token: string, input: VehicleInput) {
  return apiRequest<Vehicle>('/vehicles', { token, method: 'POST', body: JSON.stringify(input) });
}

export function updateVehicle(token: string, id: string, input: Partial<VehicleInput>) {
  return apiRequest<Vehicle>(`/vehicles/${id}`, { token, method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteVehicle(token: string, id: string) {
  return apiRequest<null>(`/vehicles/${id}`, { token, method: 'DELETE' });
}
