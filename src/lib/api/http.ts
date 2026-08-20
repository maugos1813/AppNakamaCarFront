import { env } from '../env';

export interface ApiFieldError {
  field: string;
  message: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; fieldErrors: ApiFieldError[] };

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export async function apiRequest<T>(path: string, { token, headers, ...init }: RequestOptions = {}): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        // A FormData body needs the browser to set its own multipart boundary —
        // an explicit Content-Type here would break the upload.
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: 'Impossibile contattare il server. Controlla la connessione.',
      fieldErrors: [],
    };
  }

  let body: { success: boolean; message: string; data?: T; errors?: ApiFieldError[] } | null = null;
  try {
    body = await res.json();
  } catch {
    // A non-JSON body (e.g. an upstream 502) still needs to surface as a handled error.
  }

  if (!res.ok || !body?.success) {
    return {
      ok: false,
      status: res.status,
      message: body?.message ?? 'Si è verificato un errore imprevisto.',
      fieldErrors: body?.errors?.filter((e) => e.field) ?? [],
    };
  }

  return { ok: true, data: body.data as T };
}

export function fieldErrorMap(errors: ApiFieldError[]): Record<string, string> {
  return Object.fromEntries(errors.map((e) => [e.field, e.message]));
}
