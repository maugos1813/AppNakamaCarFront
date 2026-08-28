import { apiRequest } from './http';
import type { MyNotification } from '../types';

export function listMyNotifications(token: string) {
  return apiRequest<MyNotification[]>('/notifications', { token });
}

export function markNotificationRead(token: string, id: string) {
  return apiRequest<MyNotification>(`/notifications/${id}/read`, { token, method: 'PATCH' });
}
