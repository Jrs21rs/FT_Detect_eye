import { env } from '../config/env';
import { tokenStorage } from './tokenStorage';

interface RequestOptions extends RequestInit {
  auth?: boolean;
  timeoutMs?: number;
}

export interface ApiErrorResponse {
  error: string;
  status?: number;
}

const DEFAULT_TIMEOUT_MS = 15000;

const buildUrl = (path: string) => `${env.backendBaseUrl}${path}`;

const parseResponseBody = async <T>(response: Response): Promise<T | null> => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
};

export const backendClient = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { auth = false, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...requestOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(headers as Record<string, string> | undefined),
    };

    if (!(requestOptions.body instanceof FormData)) {
      requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
    }

    if (auth) {
      const token = await tokenStorage.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(path), {
      ...requestOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });

    const data = await parseResponseBody<T & { message?: string; error?: string }>(response);

    if (!response.ok) {
      const message = data && typeof data === 'object'
        ? data.error || data.message || `Error del servidor (${response.status})`
        : `Error del servidor (${response.status})`;
      throw new Error(message);
    }

    return (data ?? ({} as T)) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La conexión tardó demasiado tiempo');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
