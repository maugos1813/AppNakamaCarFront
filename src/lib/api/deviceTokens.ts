import { apiRequest } from './http';

export function registerDeviceToken(token: string, deviceToken: string, platform: 'android' | 'ios' = 'android') {
  return apiRequest<{ id: string }>('/device-tokens', {
    token,
    method: 'POST',
    body: JSON.stringify({ token: deviceToken, platform }),
  });
}
